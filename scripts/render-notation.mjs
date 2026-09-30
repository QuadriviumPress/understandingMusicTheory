import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import * as VF from 'vexflow';

const root = process.cwd();
const definitionsDirectory = path.join(root, 'notation', 'definitions');
const outputDirectory = path.join(root, 'images', 'notation');
const namespace = 'http://www.w3.org/2000/svg';
const bravuraSource = fs.readFileSync(path.join(root, 'node_modules', 'vexflow', 'build', 'esm', 'src', 'fonts', 'bravura.js'), 'utf8');
const bravuraDataUri = bravuraSource.match(/export const Bravura = '([^']+)'/)?.[1];
if (!bravuraDataUri) throw new Error('Unable to load VexFlow Bravura font.');
// Advance width and vertical extent of each SMuFL glyph in the Bravura font
// VexFlow embeds, in font units. VexFlow sizes clefs, noteheads, accidentals,
// and time signatures from these metrics, so they must match the real font.
const bravuraMetrics = JSON.parse(fs.readFileSync(path.join(root, 'notation', 'bravura-metrics.json'), 'utf8'));

function measureText(font, text) {
  const size = font.match(/([\d.]+)(pt|px)/);
  const px = size ? Number(size[1]) * (size[2] === 'pt' ? 4 / 3 : 1) : 16;
  const scale = px / bravuraMetrics.unitsPerEm;
  let width = 0;
  let ascent = 0;
  let descent = 0;
  for (const character of text) {
    const glyph = bravuraMetrics.glyphs[character.codePointAt(0).toString(16)];
    if (glyph) {
      width += glyph[0] * scale;
      ascent = Math.max(ascent, glyph[1] * scale);
      descent = Math.max(descent, -glyph[2] * scale);
    } else {
      // Plain text: an average sans-serif advance is close enough for layout.
      width += px * (/[\s.,:;'!|il]/.test(character) ? 0.3 : 0.56);
      ascent = Math.max(ascent, px * 0.72);
      descent = Math.max(descent, px * 0.2);
    }
  }
  return { width, actualBoundingBoxAscent: ascent, actualBoundingBoxDescent: descent };
}

function element(document, name, attributes = {}, content) {
  const node = document.createElementNS(namespace, name);
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined) node.setAttribute(key, String(value));
  }
  if (content !== undefined) node.textContent = content;
  return node;
}

function createOverlay(document, svg) {
  const layer = element(document, 'g', { class: 'notation-overlay' });
  svg.append(layer);
  const append = (name, attributes, content) => layer.append(element(document, name, attributes, content));
  return {
    line(x1, y1, x2, y2, attributes = {}) { append('line', { x1, y1, x2, y2, ...attributes }); },
    circle(cx, cy, r, attributes = {}) { append('circle', { cx, cy, r, ...attributes }); },
    ellipse(cx, cy, rx, ry, attributes = {}) { append('ellipse', { cx, cy, rx, ry, ...attributes }); },
    path(d, attributes = {}) { append('path', { d, ...attributes }); },
    text(value, x, y, attributes = {}) {
      String(value).split('\n').forEach((line, index) => append('text', {
        x,
        y: y + index * Number(attributes['data-line-height'] ?? 22),
        'font-family': 'system-ui, sans-serif',
        'font-size': 16,
        // The VexFlow root sets stroke="black"; text must not inherit it.
        stroke: 'none',
        ...attributes,
        'data-line-height': undefined,
      }, line));
    },
  };
}

async function loadDefinitions() {
  const files = fs.readdirSync(definitionsDirectory).filter((file) => file.endsWith('.mjs')).sort();
  const groups = await Promise.all(files.map(async (file) => {
    const module = await import(pathToFileURL(path.join(definitionsDirectory, file)).href);
    const definitions = module.definitions ?? [module.definition];
    if (!definitions.length || definitions.some((definition) => !definition?.id || typeof definition.render !== 'function')) {
      throw new Error(`Invalid notation definition: ${file}`);
    }
    return definitions;
  }));
  return groups.flat();
}

function render(definition) {
  const dom = new JSDOM('<!doctype html><html><body><div id="score"></div></body></html>');
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
  // VexFlow uses an offscreen canvas only for text metrics, including when it
  // renders SVG. JSDOM intentionally omits Canvas; deterministic metrics keep
  // the static renderer dependency-free and make layout repeatable in CI.
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    font: '',
    measureText(text) { return measureText(this.font, String(text)); },
  });
  try {
    const host = dom.window.document.getElementById('score');
    const renderer = new VF.Renderer(host, VF.Renderer.Backends.SVG);
    renderer.resize(definition.width, definition.height);
    const context = renderer.getContext();
    const svg = host.querySelector('svg');
    svg.setAttribute('xmlns', namespace);
    svg.setAttribute('viewBox', `0 0 ${definition.width} ${definition.height}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', `${definition.id}-title ${definition.id}-description`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.prepend(element(dom.window.document, 'style', {}, `@font-face{font-family:Bravura;src:url(${bravuraDataUri}) format('woff2');}`));
    svg.prepend(element(dom.window.document, 'desc', { id: `${definition.id}-description` }, definition.alt));
    svg.prepend(element(dom.window.document, 'title', { id: `${definition.id}-title` }, definition.id.replaceAll('-', ' ')));
    definition.render({ VF, context, overlay: createOverlay(dom.window.document, svg) });
    return `<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML}\n`;
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
    dom.window.close();
  }
}

const definitions = await loadDefinitions();
const requested = process.argv.slice(2);
const selected = requested.length ? definitions.filter((definition) => requested.includes(definition.id)) : definitions;
if (requested.length && selected.length !== requested.length) throw new Error('Unknown notation definition requested.');
fs.mkdirSync(outputDirectory, { recursive: true });
for (const definition of selected) {
  fs.writeFileSync(path.join(outputDirectory, definition.output), render(definition));
  console.log(`Rendered ${definition.id}`);
}
