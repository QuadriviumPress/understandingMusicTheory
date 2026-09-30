const barTypes = { none: 'NONE', single: 'SINGLE', double: 'DOUBLE', end: 'END', repeatBegin: 'REPEAT_BEGIN', repeatEnd: 'REPEAT_END' };

// Accidentals written in parentheses, such as '(#)', render as cautionary.
function accidental(VF, code) {
  const cautionary = /^\(.*\)$/.test(code);
  const modifier = new VF.Accidental(cautionary ? code.slice(1, -1) : code);
  return cautionary ? modifier.setAsCautionary() : modifier;
}

export function note(VF, spec = {}) {
  if (typeof spec === 'string') spec = { key: spec };
  if (spec.bar) return new VF.BarNote(VF.BarlineType[barTypes[spec.bar] ?? 'SINGLE']);
  if (spec.ghost) return new VF.GhostNote({ duration: spec.duration ?? 'q' });
  const keys = spec.keys ?? [spec.key ?? (spec.rest ? 'b/4' : 'c/5')];
  // 'd' per dot makes the dot count toward the note's duration, not just its look.
  const duration = `${spec.duration ?? 'q'}${'d'.repeat(spec.dots ?? 0)}${spec.rest ? 'r' : ''}`;
  const staveNote = new VF.StaveNote({
    keys,
    duration,
    clef: spec.clef,
    stemDirection: spec.stemDirection,
    autoStem: spec.stemDirection === undefined,
  });
  (spec.accidentals ?? []).forEach((code, index) => {
    if (code) staveNote.addModifier(accidental(VF, code), index);
  });
  if (spec.accidental) staveNote.addModifier(accidental(VF, spec.accidental), 0);
  if (spec.dots) VF.Dot.buildAndAttach([staveNote], { all: true });
  (spec.articulations ?? []).forEach((code) => {
    const articulation = new VF.Articulation(code).setPosition(spec.articulationBelow ? VF.Modifier.Position.BELOW : VF.Modifier.Position.ABOVE);
    if (spec.articulationColor) articulation.setStyle({ fillStyle: spec.articulationColor, strokeStyle: spec.articulationColor });
    staveNote.addModifier(articulation, 0);
  });
  if (spec.fermata) staveNote.addModifier(new VF.Articulation('a@a').setPosition(VF.Modifier.Position.ABOVE), 0);
  if (spec.color) {
    const style = { fillStyle: spec.color, strokeStyle: spec.color };
    staveNote.setStyle(style);
    staveNote.getModifiers().forEach((modifier) => modifier.setStyle(style));
  }
  return staveNote;
}

export function drawStave(VF, context, options = {}) {
  const {
    x = 40,
    y = 50,
    width = 700,
    clef = 'treble',
    key,
    time,
    notes = [],
    formatWidth = width - 110,
    beams = false,
    beamGroups,
    tuplets = [],
    beginBar,
    endBar,
    clefSize,
    softmax,
    padding = 12,
    hideLines = false,
    noteStartX,
  } = options;
  const stave = new VF.Stave(x, y, width);
  if (clef) stave.addClef(clef, clefSize);
  // A key may be [spec, alterations], e.g. ['C#', ['##', '##', '#', ...]] for D sharp major.
  if (key) Array.isArray(key) ? stave.addModifier(new VF.KeySignature(key[0], undefined, key[1])) : stave.addKeySignature(key);
  if (time) stave.addTimeSignature(time);
  if (beginBar) stave.setBegBarType(VF.BarlineType[barTypes[beginBar] ?? beginBar] ?? beginBar);
  if (endBar) stave.setEndBarType(VF.BarlineType[barTypes[endBar] ?? endBar] ?? endBar);
  if (hideLines) {
    // Notes floating without a staff, as in rhythm-equation figures.
    stave.setConfigForLines(Array.from({ length: 5 }, () => ({ visible: false })));
    stave.setBegBarType(VF.BarlineType.NONE).setEndBarType(VF.BarlineType.NONE);
  }
  stave.setContext(context).draw();
  // Leave a little air between the clef/signatures and the first note.
  if (padding) stave.setNoteStartX(stave.getNoteStartX() + padding);
  if (noteStartX !== undefined) stave.setNoteStartX(noteStartX);
  if (!notes.length) return { stave, notes: [], voice: null };
  const tickables = notes.map((item) => item instanceof VF.Note ? item : note(VF, { clef, ...item }));
  // Beams and tuplets must exist before formatting so stems are laid out once.
  const beamObjects = [];
  if (beamGroups) beamGroups.forEach(([from, to]) => beamObjects.push(new VF.Beam(tickables.slice(from, to + 1))));
  else if (beams) {
    // Auto-beam each measure on its own so groups restart at every barline.
    let measure = [];
    const flush = () => {
      if (measure.length) beamObjects.push(...VF.Beam.generateBeams(measure, beams === true ? {} : beams));
      measure = [];
    };
    tickables.forEach((item) => (item instanceof VF.BarNote ? flush() : measure.push(item)));
    flush();
  }
  const tupletObjects = tuplets.map(({ from, to, ...rest }) => new VF.Tuplet(tickables.slice(from, to + 1), { bracketed: true, ...rest }));
  const voice = new VF.Voice({ num_beats: 64, beat_value: 4 }).setStrict(false).addTickables(tickables);
  new VF.Formatter(softmax ? { softmaxFactor: softmax } : {}).joinVoices([voice]).format([voice], formatWidth);
  voice.setStave(stave).draw(context, stave);
  beamObjects.forEach((beam) => beam.setContext(context).draw());
  tupletObjects.forEach((tuplet) => tuplet.setContext(context).draw());
  return { stave, notes: tickables, voice };
}

// Draws consecutive measures as abutting staves, each with its own notes
// centred in the measure, the way the source figures lay out short examples.
// The first measure carries the clef, key, and time signature.
export function drawMeasures(VF, context, options = {}) {
  const {
    x = 10, y = 30, widths, clef = 'treble', key, time, measures, endBar = 'single', spread = 0.6, beams = [], centre = true, endBars = [],
  } = options;
  let left = x;
  const drawn = measures.map((items, index) => {
    const width = widths[index] ?? widths[widths.length - 1];
    const stave = new VF.Stave(left, y, width);
    if (index === 0 && clef) stave.addClef(clef);
    if (index === 0 && key) stave.addKeySignature(key);
    if (index === 0 && time) stave.addTimeSignature(time);
    if (index > 0) stave.setBegBarType(VF.BarlineType.NONE);
    const barType = endBars[index] ?? (index === measures.length - 1 ? endBar : 'single');
    stave.setEndBarType(VF.BarlineType[barTypes[barType] ?? 'SINGLE']);
    stave.setContext(context).draw();
    left += width;
    if (!items.length) return { stave, notes: [] };
    const notes = items.map((item) => item instanceof VF.Note ? item : note(VF, { clef, ...item }));
    const voice = new VF.Voice({ num_beats: 64, beat_value: 4 }).setStrict(false).addTickables(notes);
    const available = stave.getNoteEndX() - stave.getNoteStartX();
    const formatter = new VF.Formatter().joinVoices([voice]);
    const minimum = formatter.preCalculateMinTotalWidth([voice]);
    const justify = notes.length > 1 ? Math.max(minimum, available * spread) : 0;
    formatter.format([voice], justify);
    const content = justify ? justify + notes[notes.length - 1].getGlyphWidth() : minimum;
    if (centre) stave.setNoteStartX((stave.getNoteStartX() + stave.getNoteEndX()) / 2 - content / 2);
    else stave.setNoteStartX(stave.getNoteStartX() + 12);
    // Beams are created before drawing so their stems are shortened, not drawn twice.
    const beamObjects = (beams[index] ?? []).map(([from, to]) => new VF.Beam(notes.slice(from, to + 1)));
    voice.setStave(stave);
    voice.draw(context, stave);
    beamObjects.forEach((beam) => beam.setContext(context).draw());
    return { stave, notes };
  });
  return drawn;
}

// Draws a stave and places each note or chord at an absolute x (its notehead
// centre), for figures whose notes are laid out by hand. Items use melody
// syntax: { x, music: '(c4+fb4):w' }.
export function placeNotes(VF, context, { x = 0, y = 0, width, clef = 'treble', noteClef, key, time, endBar, beginBar, items = [] }) {
  const stave = new VF.Stave(x, y, width);
  if (clef) stave.addClef(clef);
  if (key) stave.addKeySignature(key);
  if (time) stave.addTimeSignature(time);
  stave.setBegBarType(VF.BarlineType[barTypes[beginBar ?? 'single'] ?? 'SINGLE']);
  stave.setEndBarType(VF.BarlineType[barTypes[endBar ?? 'none'] ?? 'NONE']);
  stave.setContext(context).draw();
  const notes = items.map((item) => {
    const staveNote = note(VF, { clef: noteClef ?? clef ?? 'treble', ...melody(item.music, item.extra ?? {})[0] });
    staveNote.setStave(stave);
    const tick = new VF.TickContext().addTickable(staveNote).preFormat();
    tick.setX(item.x - stave.getNoteStartX() - staveNote.getGlyphWidth() / 2);
    staveNote.setContext(context).draw();
    return staveNote;
  });
  return { stave, notes };
}

// Quadratic curve through control point (cx, cy), optionally ending in an arrowhead.
export function curvedArrow(overlay, x1, y1, cx, cy, x2, y2, color = '#111', { head = false, width = 2 } = {}) {
  overlay.path(`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, { fill: 'none', stroke: color, 'stroke-width': width });
  if (!head) return;
  const angle = Math.atan2(y2 - cy, x2 - cx);
  [-0.5, 0.5].forEach((spread) => overlay.line(x2, y2, x2 - 10 * Math.cos(angle + spread), y2 - 10 * Math.sin(angle + spread), { stroke: color, 'stroke-width': width }));
}

// Text on a white window, used for labels drawn over black keys.
export function keyLabel(overlay, text, x, y, color, size = 14) {
  overlay.path(`M ${x - size * 0.75} ${y - size * 0.95} H ${x + size * 0.75} V ${y + size * 0.3} H ${x - size * 0.75} Z`, { fill: 'white', stroke: 'none' });
  overlay.text(text, x, y, { 'font-size': size, 'text-anchor': 'middle', fill: color });
}

// Keyboard in the style of the source figures. `start` is the first white key
// letter; returns white-key centres (by index) and black-key centres keyed by
// the index of the white key they follow. Letters sit near the bottom.
export function drawPiano(overlay, options = {}) {
  const {
    x = 0, y = 0, whiteWidth = 28, whiteHeight = 220, blackWidth = 19, blackHeight = 128, count = 7, start = 'C',
    letters = true, letterSize = 14, stroke = 3,
  } = options;
  const order = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const first = order.indexOf(start);
  const white = [];
  const black = {};
  overlay.path(`M ${x} ${y} V ${y + whiteHeight} H ${x + count * whiteWidth} V ${y}`, { fill: 'white', stroke: '#111', 'stroke-width': stroke });
  for (let index = 0; index < count; index += 1) {
    const left = x + index * whiteWidth;
    if (index) overlay.line(left, y, left, y + whiteHeight, { stroke: '#111', 'stroke-width': 1.5 });
    white.push(left + whiteWidth / 2);
    if (letters) overlay.text(order[(first + index) % 7], left + whiteWidth / 2, y + whiteHeight - 22, { 'font-size': letterSize, 'text-anchor': 'middle', fill: '#333' });
  }
  for (let index = 0; index < count - 1; index += 1) {
    if (!['C', 'D', 'F', 'G', 'A'].includes(order[(first + index) % 7])) continue;
    const centre = x + (index + 1) * whiteWidth;
    black[index] = centre;
    overlay.path(`M ${centre - blackWidth / 2} ${y} H ${centre + blackWidth / 2} V ${y + blackHeight} H ${centre - blackWidth / 2} Z`, { fill: '#111', stroke: '#111', 'stroke-width': 1 });
  }
  return { white, black };
}

// Rows of short measures (typically two whole notes forming an interval) with
// a centred caption under each measure. Notes are written as 'd/4' or
// ['d/4', '#']; a caption may contain '\n'.
export function drawIntervalRows(VF, context, overlay, rows, options = {}) {
  const {
    x = 0, y = 10, rowHeight = 190, widths = [270, 230, 230, 240], time = '8/4', endBar = 'end',
    labelOffset = 132, labelSize = 18, duration = 'w',
  } = options;
  return rows.map((row, rowIndex) => {
    const top = y + rowIndex * rowHeight;
    const measures = drawMeasures(VF, context, {
      x, y: top, widths: row.widths ?? widths, clef: row.clef ?? 'treble', key: row.key, time: row.time ?? time, endBar,
      measures: row.measures.map((items) => items.map((item) => {
        if (typeof item === 'string') return { key: item, duration };
        if (Array.isArray(item)) return { key: item[0], accidental: item[1] ?? undefined, duration };
        return { duration, ...item };
      })),
    });
    (row.labels ?? []).forEach((label, index) => {
      if (!label) return;
      const { stave } = measures[index];
      const centre = index === 0
        ? (stave.getNoteStartX() - 20 + stave.getX() + stave.getWidth()) / 2
        : stave.getX() + stave.getWidth() / 2;
      overlay.text(label, centre, top + labelOffset, { 'font-size': labelSize, 'text-anchor': 'middle', 'data-line-height': labelSize + 5 });
    });
    return measures;
  });
}

// Parses a compact melody: space-separated tokens such as 'f#4:8.' (pitch,
// written accidental, octave, duration, optional dot), 'r:q' (rest),
// '(c5+e5):h' (chord), 'b(b)4' (cautionary flat), '|' / '||' / '|.' (barlines). A trailing '@' adds a
// fermata. Accidentals are shown only when written, so key signatures work.
export function melody(text, extra = {}) {
  const bars = { '|': 'single', '||': 'double', '|.': 'end', '|:': 'repeatBegin', ':|': 'repeatEnd' };
  return text.trim().split(/\s+/).map((token) => {
    if (bars[token]) return { bar: bars[token] };
    const fermata = token.endsWith('@');
    const [pitchText, durationText = 'q'] = token.replace(/@$/, '').split(':');
    const dots = (durationText.match(/\./g) ?? []).length;
    const duration = durationText.replace(/\./g, '');
    if (pitchText === 'r') return { rest: true, duration, dots, ...extra };
    const pitches = pitchText.replace(/^\(|\)$/g, '').split('+').map((pitch) => {
      const match = pitch.match(/^([a-g])(##|bb|#|b|n|\(#\)|\(b\)|\(n\))?(\d)$/);
      if (!match) throw new Error(`Bad melody token: ${token}`);
      return { key: `${match[1]}/${match[3]}`, accidental: match[2] ?? null };
    });
    return {
      keys: pitches.map((pitch) => pitch.key),
      accidentals: pitches.map((pitch) => pitch.accidental),
      duration, dots, fermata, ...extra,
    };
  });
}

const clefGlyphs = { treble: '', bass: '', alto: '' };
const clefReferenceStep = { treble: 2, bass: 6, alto: 4 };

// Arrow drawn as a line plus an open two-stroke head at (x2, y2).
export function arrowLine(overlay, x1, y1, x2, y2, attributes = {}) {
  const stroke = attributes.stroke ?? '#111';
  const strokeWidth = attributes['stroke-width'] ?? 1.6;
  overlay.line(x1, y1, x2, y2, { stroke, 'stroke-width': strokeWidth });
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = attributes.head ?? 12;
  [-0.45, 0.45].forEach((spread) => overlay.line(x2, y2, x2 - size * Math.cos(angle + spread), y2 - size * Math.sin(angle + spread), { stroke, 'stroke-width': strokeWidth }));
}

// A large hand-drawn staff whose lines and spaces are labelled with letter
// names written directly on the staff (letters on a line interrupt it; letters
// beyond the staff get short ledger dashes). Steps count from the bottom line.
export function drawNamedStaff(overlay, options) {
  const {
    top, spacing = 26, x1 = 0, x2 = 848, clef, clefX = 4, entries, size = 20, lineWidth = 2, color = '#111',
  } = options;
  const yOf = (step) => top + 4 * spacing - step * spacing / 2;
  const half = size * 0.45;
  for (let line = 0; line < 5; line += 1) {
    const y = yOf(line * 2);
    const gaps = entries.filter((entry) => entry.step === line * 2).map((entry) => entry.x).sort((a, b) => a - b);
    let start = x1;
    gaps.forEach((x) => {
      overlay.line(start, y, x - half - 4, y, { stroke: '#222', 'stroke-width': lineWidth });
      start = x + half + 4;
    });
    overlay.line(start, y, x2, y, { stroke: '#222', 'stroke-width': lineWidth });
  }
  if (clef) overlay.text(clefGlyphs[clef], clefX, yOf(clefReferenceStep[clef]), { 'font-family': 'Bravura', 'font-size': spacing * 3.3, fill: '#111' });
  entries.forEach(({ letter, x, step, fill = color }) => {
    const y = yOf(step);
    if ((step < 0 || step > 8) && step % 2 === 0) {
      overlay.line(x - half - 16, y, x - half - 4, y, { stroke: '#222', 'stroke-width': lineWidth });
      overlay.line(x + half + 4, y, x + half + 16, y, { stroke: '#222', 'stroke-width': lineWidth });
    }
    overlay.text(letter, x, y + size * 0.36, { 'font-size': size, 'font-weight': '700', 'text-anchor': 'middle', fill });
  });
  return yOf;
}

// A rhythm "equation" row of floating notes (no staff), symbols, and answer
// boxes, as in the duration worksheets. Items:
//   { x, music: 'f4:q' | 'f4:8 f4:8', beam?: true, color? }  notes, first head centred on x
//   { x, text: '=' }                                             a symbol
//   { box: [x1, x2], top, bottom }                               an empty answer box
// headY is the y of an F4 notehead (rests sit a little higher).
export function drawRhythmEquation(VF, context, overlay, items, { headY }) {
  items.forEach((item) => {
    if (item.text) {
      overlay.text(item.text, item.x, headY + (item.drop ?? -2), { 'font-size': item.size ?? 24, 'font-weight': '700', 'text-anchor': 'middle' });
    } else if (item.box) {
      const [x1, x2] = item.box;
      overlay.path(`M ${x1} ${item.top} H ${x2} V ${item.bottom} H ${x1} Z`, { fill: 'none', stroke: '#333', 'stroke-width': 1.6 });
    } else {
      const notes = melody(item.music, { stemDirection: 1, color: item.color });
      const width = 40 + notes.length * (item.spacing ?? 32);
      drawStave(VF, context, {
        x: item.x - 30, y: headY - 75, width, clef: null, hideLines: true, padding: 0, noteStartX: item.x - 17,
        formatWidth: notes.length > 1 ? notes.length * (item.spacing ?? 32) * 0.95 : 0, notes,
        beamGroups: item.beam ? [[0, notes.length - 1]] : undefined,
      });
    }
  });
}

// Absolute x of a drawn note head's centre, for overlay labels and arrows.
export function noteX(item) {
  if (item.getNoteHeadBeginX) return (item.getNoteHeadBeginX() + item.getNoteHeadEndX()) / 2;
  return item.getAbsoluteX();
}

export function drawKeyboard(overlay, options = {}) {
  const {
    x = 40,
    y = 35,
    whiteWidth = 46,
    whiteHeight = 180,
    whiteKeys = 14,
    labels = [],
    blackLabels = {},
  } = options;
  overlay.path(`M ${x} ${y} H ${x + whiteKeys * whiteWidth} V ${y + whiteHeight} H ${x} Z`, {
    fill: 'white', stroke: '#111', 'stroke-width': 2,
  });
  for (let index = 1; index < whiteKeys; index += 1) {
    overlay.line(x + index * whiteWidth, y, x + index * whiteWidth, y + whiteHeight, { stroke: '#111', 'stroke-width': 2 });
  }
  const blackAfter = [0, 1, 3, 4, 5];
  for (let index = 0; index < whiteKeys - 1; index += 1) {
    if (!blackAfter.includes(index % 7)) continue;
    const center = x + (index + 1) * whiteWidth;
    overlay.path(`M ${center - whiteWidth * 0.3} ${y} H ${center + whiteWidth * 0.3} V ${y + whiteHeight * 0.62} H ${center - whiteWidth * 0.3} Z`, {
      fill: '#111', stroke: '#111', 'stroke-width': 1,
    });
    if (blackLabels[index]) overlay.text(blackLabels[index], center, y + whiteHeight * 0.35, {
      fill: 'white', 'font-size': 14, 'font-weight': '700', 'text-anchor': 'middle', 'data-line-height': 18,
    });
  }
  labels.forEach((label, index) => overlay.text(label, x + (index + 0.5) * whiteWidth, y + whiteHeight - 14, {
    'font-size': 15, 'text-anchor': 'middle',
  }));
}

export function labelUnder(overlay, labels, startX, step, y, attributes = {}) {
  labels.forEach((label, index) => overlay.text(label, startX + index * step, y, {
    'font-size': 16,
    'text-anchor': 'middle',
    ...attributes,
  }));
}
