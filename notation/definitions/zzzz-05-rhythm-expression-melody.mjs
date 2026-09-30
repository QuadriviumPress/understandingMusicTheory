import { arrowLine, drawIntervalRows, drawMeasures, drawRhythmEquation, drawStave, melody, note, noteX } from '../figure-helpers.mjs';

const red = '#d32f2f';
const blue = '#1565c0';
const green = '#2e7d32';
const pink = '#d81b60';

function arrow(overlay, x, y1, y2, color = red) {
  overlay.line(x, y1, x, y2, { stroke: color, 'stroke-width': 2 });
  overlay.path(`M ${x - 7} ${y2 - 9} L ${x} ${y2} L ${x + 7} ${y2 - 9}`, { fill: 'none', stroke: color, 'stroke-width': 2 });
}

function redArrow(overlay, x, y1, y2) {
  overlay.line(x, y1, x, y2, { stroke: red, 'stroke-width': 2 });
  overlay.path(`M ${x - 10} ${y2 - 16} L ${x} ${y2} L ${x + 10} ${y2 - 16}`, { fill: 'none', stroke: red, 'stroke-width': 2 });
}

function bracket(overlay, x1, x2, y, label, color = '#111') {
  overlay.path(`M ${x1} ${y + 12} V ${y} H ${x2} V ${y + 12}`, { fill: 'none', stroke: color, 'stroke-width': 2 });
  overlay.text(label, (x1 + x2) / 2, y - 6, { fill: color, 'font-size': 17, 'font-weight': '700', 'text-anchor': 'middle' });
}

function curve(overlay, x1, y1, x2, y2, rise = 24, color = '#111') {
  overlay.path(`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - rise} ${x2} ${y2}`, { fill: 'none', stroke: color, 'stroke-width': 2.2 });
}

function label(overlay, value, x, y, attributes = {}) {
  overlay.text(value, x, y, { 'font-size': 17, ...attributes });
}

function drawCoda(overlay, x, y, size = 13, color = red) {
  overlay.circle(x, y, size, { fill: 'none', stroke: color, 'stroke-width': 2.4 });
  overlay.line(x - size - 7, y, x + size + 7, y, { stroke: color, 'stroke-width': 2.4 });
  overlay.line(x, y - size - 7, x, y + size + 7, { stroke: color, 'stroke-width': 2.4 });
}

function drawSegno(overlay, x, y, color = red) {
  overlay.path(`M ${x - 13} ${y + 11} C ${x + 18} ${y + 1}, ${x + 14} ${y - 19}, ${x - 5} ${y - 16} C ${x - 22} ${y - 13}, ${x - 18} ${y + 8}, ${x + 11} ${y + 17}`, { fill: 'none', stroke: color, 'stroke-width': 2.6 });
  overlay.line(x - 16, y + 20, x + 17, y - 22, { stroke: color, 'stroke-width': 2.1 });
  overlay.circle(x - 18, y - 7, 2.8, { fill: color });
  overlay.circle(x + 18, y + 7, 2.8, { fill: color });
}

function dynamicsAccentNotes() {
  const marks = [['a>'], [], [], ['a>'], [], [], ['a^'], [], ['a^'], [], ['a^'], []];
  const eighths = marks.map((articulations) => ({ key: 'd/5', duration: '8', articulations, articulationColor: red }));
  return [
    ...eighths.slice(0, 6), { bar: 'single' }, ...eighths.slice(6), { bar: 'single' },
    { key: 'g/4', duration: 'h', dots: 1 }, { bar: 'single' }, { key: 'g/4', duration: 'h', dots: 1 },
  ];
}

function drawRoadmapStave(VF, context, x, y, notes, width = 520, time = '4/4') {
  return drawStave(VF, context, { x, y, width, time, notes, formatWidth: width - 150, beams: true });
}

// Dotted-duration worksheet: rows of [left items..., box, answer] in a 515 x 305 frame.
const dottedRows = [
  { headY: 54, items: [{ x: 11, music: 'f4:w' }, { x: 51, text: '=' }, { x: 97, music: 'f4:q' }, { box: [140, 212], top: 16, bottom: 70 }], answer: { x: 165, music: 'f4:h.' } },
  { headY: 54, items: [{ x: 289, music: 'f4:w' }, { x: 329, text: '=' }, { x: 362, music: 'f4:q f4:q f4:8', spacing: 33 }, { box: [452, 515], top: 18, bottom: 72 }], answer: { x: 472, music: 'f4:q.' } },
  { headY: 131, items: [{ x: 6, music: 'f4:w' }, { x: 41, music: 'f4:q f4:q', spacing: 31 }, { x: 102, text: '=' }, { box: [153, 215], top: 90, bottom: 144 }], answer: { x: 172, music: 'f4:w.' } },
  { headY: 131, items: [{ x: 279, music: 'f4:8 f4:8', beam: true }, { x: 347, text: '=' }, { x: 381, music: 'f4:16' }, { box: [425, 515], top: 90, bottom: 144 }], answer: { x: 458, music: 'f4:8.' } },
  { headY: 205, items: [{ x: 41, music: 'f4:q' }, { x: 83, text: '=' }, { box: [125, 188], top: 167, bottom: 221 }, { x: 205, music: 'f4:16' }], answer: { x: 145, music: 'f4:8.' } },
  { headY: 205, items: [{ x: 309, music: 'r:q' }, { x: 344, music: 'r:8' }, { x: 377, text: '=' }, { box: [418, 515], top: 163, bottom: 218 }], answer: { x: 452, music: 'r:q.' } },
  { headY: 278, items: [{ x: 14, music: 'f4:q' }, { x: 59, music: 'f4:h' }, { x: 103, text: '=' }, { box: [140, 215], top: 240, bottom: 294 }], answer: { x: 165, music: 'f4:h.' } },
  { headY: 278, items: [{ x: 311, music: 'r:8' }, { x: 346, music: 'r:16' }, { x: 385, text: '=' }, { box: [424, 499], top: 236, bottom: 291 }], answer: { x: 452, music: 'r:8.' } },
];

function drawDottedWorksheet(VF, context, overlay, showAnswers) {
  dottedRows.forEach(({ headY, items, answer }) => {
    drawRhythmEquation(VF, context, overlay, showAnswers ? [...items, { ...answer, color: red }] : items, { headY });
  });
}

export const definitions = [
  {
    id: 'beat-grouping-by-time-signature',
    status: 'vexflow-overlay',
    sources: ['fefd427443e72ac2f4a849fd2250c004da0683d2.png'],
    output: 'beat-grouping-by-time-signature.svg',
    alt: 'The same note values grouped in one-one, two-two, and four-four time, with red arrows marking one, two, or four beat beginnings per measure.',
    width: 900,
    height: 580,
    render({ VF, context, overlay }) {
      const rhythm = [melody('a4:w'), melody('a4:h a4:h'), melody('a4:q a4:q a4:q a4:q'), melody('a4:8 a4:8 a4:8 a4:8 a4:8 a4:8 a4:8 a4:8')];
      const rows = [
        { time: '1/1', beats: 1, beams: [[0, 7]] },
        { time: '2/2', beats: 2, beams: [[0, 3], [4, 7]] },
        { time: '4/4', beats: 4, beams: [[0, 1], [2, 3], [4, 5], [6, 7]] },
      ];
      rows.forEach(({ time, beats, beams }, rowIndex) => {
        const y = 40 + rowIndex * 165;
        const measures = drawMeasures(VF, context, {
          x: 0, y, widths: [190, 130, 215, 365], time, measures: rhythm, beams: [[], [], [], beams], spread: 0.7, centre: false,
        });
        measures.forEach(({ stave, notes }) => {
          // A beat that falls inside a long note is placed proportionally
          // between that note and the next one (or the barline).
          const xs = [...notes.map(noteX), stave.getX() + stave.getWidth() + 14];
          for (let beat = 0; beat < beats; beat += 1) {
            const position = beat * notes.length / beats;
            const index = Math.floor(position);
            redArrow(overlay, xs[index] + (position - index) * (xs[index + 1] - xs[index]), y - 38, y + 28);
          }
        });
      });
      redArrow(overlay, 68, 522, 572);
      label(overlay, '=   beginning of a beat', 96, 548, { fill: red, 'font-size': 21 });
    },
  },
  {
    id: 'equivalent-two-four-rhythms',
    status: 'vexflow-overlay',
    sources: ['e2f8f09813a0e0bff4ecb4cb571a114b3f6163b0.png'],
    output: 'equivalent-two-four-rhythms.svg',
    alt: 'Two rhythmically equivalent melodies: the upper in two-four time at quarter note equals 116, the lower in two-two time with doubled note values at half note equals 116.',
    width: 760,
    height: 285,
    render({ VF, context, overlay }) {
      const tempo = (glyph, y) => {
        overlay.text(glyph, 12, y, { 'font-family': 'Bravura', 'font-size': 30, fill: '#111' });
        label(overlay, '= 116', 26, y, { 'font-size': 15 });
      };
      tempo('', 26);
      drawStave(VF, context, { x: 0, y: 18, width: 760, key: 'G', time: '2/4', formatWidth: 610, beams: true, notes: melody('d4:8 | d4:8. g4:16 g4:8 g4:8 | g4:q f4:8 g4:8 | a4:8. d4:16 d4:8 d4:8 | d4:q r:q') });
      tempo('', 166);
      drawStave(VF, context, { x: 0, y: 154, width: 760, key: 'G', time: '2/2', formatWidth: 610, notes: melody('d4:q | d4:q. g4:8 g4:q g4:q | g4:h f4:q g4:q | a4:q. d4:8 d4:q d4:q | d4:h r:h') });
    },
  },
  {
    id: 'compound-six-eight-beats',
    status: 'vexflow-overlay',
    sources: ['540d38c5d4317268ef6344e38f6f46e2e352e370.png'],
    output: 'compound-six-eight-beats.svg',
    alt: 'Six-eight measures with red arrows marking two dotted-quarter beats in each measure.',
    width: 720,
    height: 270,
    render({ VF, context, overlay }) {
      const { notes } = drawStave(VF, context, {
        x: 0, y: 55, width: 720, time: '6/8', formatWidth: 560, notes: melody('g4:q. g4:q. | g4:8 g4:8 g4:8 g4:q g4:8 | g4:h.'), beamGroups: [[3, 5]],
      });
      [notes[0], notes[1], notes[3], notes[6]].forEach((item) => redArrow(overlay, noteX(item), 45, 100));
      redArrow(overlay, noteX(notes[9]), 45, 100);
      redArrow(overlay, noteX(notes[9]) + 60, 45, 100);
      redArrow(overlay, 45, 208, 262);
      label(overlay, '=   beginning of a beat', 80, 236, { fill: red, 'font-size': 19, 'font-weight': '700' });
    },
  },
  {
    id: 'common-meter-counting-chart',
    status: 'svg-overlay',
    sources: ['77f33d1d601bfa5087cad774ba9e409e87922dd4.png'],
    output: 'common-meter-counting-chart.svg',
    alt: 'Chart of simple and compound duple, triple, and quadruple meters with count syllables and example time signatures.',
    width: 900,
    height: 392,
    render({ overlay }) {
      const serif = { 'font-family': 'Georgia, "Times New Roman", serif' };
      const simple = [['1', 283], ['&', 340], ['2', 395], ['&', 453], ['3', 510], ['&', 565], ['4', 618], ['&', 667]];
      const compound = [['1', 283], ['&', 320], ['a', 355], ['2', 395], ['&', 433], ['a', 470], ['3', 510], ['&', 547], ['a', 582], ['4', 618], ['&', 655], ['a', 690]];
      const rows = [
        ['Duple Simple', simple.slice(0, 4), '2', '4'], ['Triple Simple', simple.slice(0, 6), '3', '4'], ['Quadruple Simple', simple, '4', '4'],
        ['Duple Compound', compound.slice(0, 6), '6', '8'], ['Triple Compound', compound.slice(0, 9), '9', '8'], ['Quadruple Compound', compound, '12', '8'],
      ];
      const bounds = [48, 100, 158, 218, 275, 330, 386];
      label(overlay, 'Meter', 55, 22, { ...serif, 'font-size': 20, 'font-weight': '700' });
      label(overlay, 'Count', 365, 22, { ...serif, 'font-size': 20, 'font-weight': '700' });
      label(overlay, 'Example Time Signature', 615, 24, { ...serif, 'font-size': 20, 'font-weight': '700' });
      rows.forEach(([meter, syllables, top, bottom], index) => {
        const [y1, y2] = [bounds[index], bounds[index + 1]];
        syllables.forEach(([syllable, x]) => {
          const fill = /\d/.test(syllable) ? '#3d9a37' : syllable === 'a' ? '#f7f21e' : '#dbe81c';
          overlay.path(`M ${x - 14} ${y1} H ${x + 14} V ${y2} H ${x - 14} Z`, { fill, stroke: 'none' });
          label(overlay, syllable, x, y2 - 7, { ...serif, 'font-size': /\d/.test(syllable) ? 27 : 22, 'font-weight': '700', 'text-anchor': 'middle', fill: '#222' });
        });
        overlay.line(0, y2, 890, y2, { stroke: '#f0735f', 'stroke-width': 2 });
        label(overlay, meter, 4, y2 - 6, { ...serif, 'font-size': 21 });
        label(overlay, top, 770, y1 + 22, { ...serif, 'font-size': 22, 'text-anchor': 'middle' });
        label(overlay, bottom, 770, y2 - 5, { ...serif, 'font-size': 22, 'text-anchor': 'middle' });
      });
    },
  },
  {
    id: 'mixed-meter-boris-godunov',
    status: 'vexflow-overlay',
    sources: ['20477f21bfabd1ca700d9d8d578fbbeb218fc823.png'],
    output: 'mixed-meter-boris-godunov.svg',
    alt: 'A melody from Boris Godunov changing from three-four to five-four and back to three-four time.',
    width: 900,
    height: 190,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 35, y: 55, width: 830, key: 'A', time: '3/4', notes: [{ rest: true, duration: 'q' }, { key: 'e/4', duration: '8' }, { key: 'd/4', duration: 'q' }, { key: 'e/4', duration: '8' }, { key: 'e/4', duration: 'q' }, { key: 'a/4', duration: 'q' }, { rest: true, duration: 'q' }, { key: 'g/4', duration: '8' }, { key: 'e/4', duration: 'q' }, { key: 'd/4', duration: '8' }, { key: 'e/4', duration: 'q' }, { key: 'b/3', duration: 'q' }, { rest: true, duration: '8' }, { key: 'd/4', duration: '8' }, { key: 'e/4', duration: 'q' }], formatWidth: 670, beams: true });
      label(overlay, '3/4', 815, 45, { 'font-weight': '700' });
      label(overlay, '5/4', 390, 45, { 'font-weight': '700' });
    },
  },
  {
    id: 'pickup-measure-completion',
    status: 'vexflow-overlay',
    sources: ['8cdcdfc87f3ef226a369d3b33e3e1be142063a0a.png'],
    output: 'pickup-measure-completion.svg',
    alt: 'Two examples in which a short opening pickup measure and shortened final measure together equal one complete measure.',
    width: 900,
    height: 330,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 40, y: 40, width: 820, time: 'C', notes: [{ key: 'c/4', duration: 'q' }, { key: 'd/4', duration: 'q' }, { key: 'e/4', duration: 'q' }, { key: 'f/4', duration: 'q' }, { key: 'g/4', duration: 'q' }, { key: 'a/4', duration: 'h' }, { key: 'g/4', duration: 'w' }], formatWidth: 650 });
      drawStave(VF, context, { x: 40, y: 185, width: 820, time: '3/4', notes: [{ key: 'c/4', duration: '8' }, { key: 'd/4', duration: '8' }, note(VF, { key: 'e/4', duration: 'q', dots: 1 }), { key: 'd/4', duration: '8' }, { key: 'c/4', duration: 'q' }, note(VF, { key: 'b/3', duration: 'q', dots: 1 }), { key: 'c/4', duration: '8' }], formatWidth: 650, beams: true });
      label(overlay, 'pickup', 105, 28, { fill: blue, 'font-weight': '700' });
      label(overlay, 'shortened final measure', 710, 28, { fill: blue, 'font-weight': '700' });
      label(overlay, 'pickup', 105, 173, { fill: blue, 'font-weight': '700' });
      label(overlay, 'shortened final measure', 710, 173, { fill: blue, 'font-weight': '700' });
    },
  },
  {
    id: 'four-phrases-with-pickups',
    status: 'vexflow-overlay',
    sources: ['1064d35194f9c5ffefc3f50c0ca0e338f6426d44.png'],
    output: 'four-phrases-with-pickups.svg',
    alt: 'A melody in four phrases in cut time; each phrase begins with pickup notes, shown in red, before the downbeat.',
    width: 820,
    height: 262,
    render({ VF, context, overlay }) {
      const colour = (notes, indices) => notes.map((item, index) => (indices.includes(index) ? { ...item, color: red } : item));
      drawStave(VF, context, {
        x: 0, y: -8, width: 795, key: 'D', time: 'C|', formatWidth: 650, beamGroups: [[0, 1], [15, 18]],
        notes: colour(melody('f5:8 e5:8 | b4:q a4:q f4:q d4:q | e4:q d4:q a3:q. c4:8 | d4:q d4:q d4:8 e4:8 f4:8 g4:8'), [0, 1, 11]),
      });
      drawStave(VF, context, {
        x: 0, y: 131, width: 820, key: 'D', formatWidth: 700, endBar: 'none', beamGroups: [[2, 3], [18, 19]],
        notes: colour(melody('a4:h f4:q f5:8 e5:8 | b4:q a4:q f4:q d4:q | e4:q d4:q a3:q. f4:8 | c4:q e4:q a3:q b3:8 c4:8 | d4:h'), [2, 3, 13]),
      });
      [['Phrase 1', 150, 15], ['Phrase 2', 531, 17], ['Phrase 3', 207, 157], ['Phrase 4', 582, 157]].forEach(([text, x, y]) => overlay.text(text, x, y, { 'font-size': 16, 'font-weight': '700', 'text-anchor': 'middle' }));
    },
  },
  {
    id: 'pickup-notes-across-repeat-barline',
    status: 'vexflow-overlay',
    sources: ['8872ae6e6d44368fdf861fbcc6de3343180854cb.png'],
    output: 'pickup-notes-across-repeat-barline.svg',
    alt: 'A melody whose measure is interrupted by a repeat barline so the following pickup notes belong to the repeated section.',
    width: 900,
    height: 190,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 40, y: 55, width: 820, key: 'E', time: '2/4', notes: [{ key: 'e/4', duration: '16' }, { key: 'd/4', duration: '8' }, { key: 'b/3', duration: 'q' }, { key: 'b/3', duration: '8' }, { key: 'c/4', duration: '16' }, { key: 'd/4', duration: '16' }, { key: 'e/4', duration: '8' }, { key: 'e/4', duration: '8' }, { key: 'd/4', duration: 'q' }, { key: 'e/4', duration: '8' }, { key: 'g/4', duration: '16' }, { key: 'a/4', duration: '16' }], formatWidth: 650, beams: true });
      overlay.line(615, 57, 615, 138, { stroke: '#111', 'stroke-width': 5 });
      overlay.circle(605, 93, 3.5, { fill: '#111' });
      overlay.circle(605, 108, 3.5, { fill: '#111' });
      label(overlay, 'repeat barline inside the measure', 615, 175, { fill: blue, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'dotted-duration-practice',
    status: 'vexflow-overlay',
    sources: ['b38c68f9b7567902f35080c958b602133e1646f3.png'],
    output: 'dotted-duration-practice.svg',
    alt: 'Eight note and rest equations with a box for the single dotted value that completes each one',
    width: 515,
    height: 305,
    render({ VF, context, overlay }) { drawDottedWorksheet(VF, context, overlay, false); },
  },
  {
    id: 'dotted-duration-practice-solutions',
    status: 'vexflow-overlay',
    sources: ['aea8aa79be190e40bc0147148906d1647e4b1b83.png'],
    output: 'dotted-duration-practice-solutions.svg',
    alt: 'Eight note and rest equations with a box for the single dotted value that completes each one, answered in red: dotted half, dotted quarter, dotted whole, dotted eighth, dotted eighth, dotted quarter rest, dotted half, and dotted eighth rest',
    width: 515,
    height: 305,
    render({ VF, context, overlay }) { drawDottedWorksheet(VF, context, overlay, true); },
  },
  {
    id: 'borrowed-division-examples',
    status: 'vexflow-overlay',
    sources: ['497bb9fdd651f112aced13e093e724b06bb8b7fb.png'],
    output: 'borrowed-division-examples.svg',
    alt: 'A whole note equals a half-note triplet or a quarter-note quintuplet; a half note equals a quarter-note triplet or an eighth-note septuplet; a quarter note equals an eighth-note triplet, a quarter-and-eighth triplet, or an eighth, eighth rest, and eighth triplet.',
    width: 560,
    height: 400,
    render({ VF, context, overlay }) {
      // Each group floats without a staff; widths follow the source layout.
      const group = (x, y, width, music, tuplet, beamGroups) => drawStave(VF, context, {
        x, y, width, clef: null, hideLines: true, padding: 0, formatWidth: width - 25,
        notes: melody(music, { stemDirection: 1 }), beamGroups,
        tuplets: tuplet ? [{ ratioed: false, ...tuplet }] : [],
      });
      const equals = (x, y) => overlay.text('=', x, y, { 'font-size': 30, 'text-anchor': 'middle' });
      const rows = [
        { y: 5, lead: 'f4:w', parts: [
          [112, 125, 'f4:h f4:h f4:h', { from: 0, to: 2, numNotes: 3, notesOccupied: 2 }],
          [310, 250, 'f4:q f4:q f4:q f4:q f4:q', { from: 0, to: 4, numNotes: 5, notesOccupied: 4 }],
        ] },
        { y: 135, lead: 'f4:h', parts: [
          [102, 125, 'f4:q f4:q f4:q', { from: 0, to: 2, numNotes: 3, notesOccupied: 2 }],
          [285, 260, 'f4:8 f4:8 f4:8 f4:8 f4:8 f4:8 f4:8', { from: 0, to: 6, numNotes: 7, notesOccupied: 4, bracketed: false }, [[0, 6]]],
        ] },
        { y: 265, lead: 'f4:q', parts: [
          [90, 105, 'f4:8 f4:8 f4:8', { from: 0, to: 2, numNotes: 3, notesOccupied: 2, bracketed: false }, [[0, 2]]],
          [272, 105, 'f4:q f4:8', { from: 0, to: 1, numNotes: 3, notesOccupied: 2 }],
          [430, 125, 'f4:8 r:8 f4:8', { from: 0, to: 2, numNotes: 3, notesOccupied: 2 }],
        ] },
      ];
      rows.forEach(({ y, lead, parts }) => {
        group(-12, y, 60, lead);
        parts.forEach(([x, width, music, tuplet, beams], index) => {
          equals(x - (index ? 24 : 36), y + 88);
          group(x, y, width, music, tuplet, beams);
        });
      });
    },
  },
  {
    id: 'compound-meter-duplet',
    status: 'vexflow-overlay',
    sources: ['4d2420cf5eede85bc5c3f12ef4287b370db94fbb.png'],
    output: 'compound-meter-duplet.svg',
    alt: 'A six-eight passage in which the second measure begins with a duplet: two eighth notes filling the time of three.',
    width: 420,
    height: 130,
    render({ VF, context }) {
      drawStave(VF, context, {
        x: 0, y: 5, width: 420, time: '6/8', formatWidth: 300, notes: melody('f4:8 f4:8 f4:8 f4:q f4:8 | f4:8 f4:8 f4:8 f4:8 f4:8'),
        beamGroups: [[0, 2], [6, 7], [8, 10]], tuplets: [{ from: 6, to: 7, numNotes: 2, notesOccupied: 3, bracketed: false, ratioed: false }],
      });
    },
  },
  {
    id: 'swing-rhythm-interpretation',
    status: 'vexflow-overlay',
    sources: ['f60857c8669a175558b409f0c714dcbee4a36513.png'],
    output: 'swing-rhythm-interpretation.svg',
    alt: 'Swing notation showing pairs of written eighth notes or dotted-eighth–sixteenth rhythms interpreted as triplet quarter–eighth patterns.',
    width: 760,
    height: 330,
    render({ VF, context, overlay }) {
      const rows = [
        { y: 55, left: [{ key: 'b/4', duration: '8' }, { key: 'b/4', duration: '8' }, { key: 'b/4', duration: '8' }, { key: 'b/4', duration: '8' }] },
        { y: 200, left: [note(VF, { key: 'b/4', duration: '8', dots: 1 }), { key: 'b/4', duration: '16' }, note(VF, { key: 'b/4', duration: '8', dots: 1 }), { key: 'b/4', duration: '16' }] },
      ];
      rows.forEach(({ y, left }) => {
        label(overlay, '“swing”', 30, y + 45, { 'font-size': 20, 'font-weight': '700' });
        drawStave(VF, context, { x: 125, y, width: 210, clef: null, notes: left, formatWidth: 140, beams: true });
        label(overlay, '=', 370, y + 43, { 'font-size': 28, 'text-anchor': 'middle' });
        drawStave(VF, context, { x: 410, y, width: 290, clef: null, notes: [{ key: 'b/4', duration: 'q' }, { key: 'b/4', duration: '8' }, { key: 'b/4', duration: 'q' }, { key: 'b/4', duration: '8' }], formatWidth: 210, beams: true });
        bracket(overlay, 445, 540, y + 5, '3');
        bracket(overlay, 565, 665, y + 5, '3');
      });
    },
  },
  {
    id: 'syncopation-on-weak-beats',
    status: 'vexflow-overlay',
    sources: ['8df2e82253f904461194dc01196bde306adf3d4b.png'],
    output: 'syncopation-on-weak-beats.svg',
    alt: 'A four-four melody with expected beat positions marked above and long red notes highlighted in unexpected weak-beat positions.',
    width: 920,
    height: 260,
    render({ VF, context, overlay }) {
      const notes = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'a/4', 'g/4', 'f/4', 'e/4', 'd/4', 'c/4'].map((key, index) => ({ key, duration: index === 8 || index === 11 ? 'h' : '8' }));
      drawStave(VF, context, { x: 40, y: 75, width: 840, time: 'C', notes, formatWidth: 680, beams: true });
      label(overlay, 'Expected emphasis on beats 1 and 3', 180, 35, { 'font-size': 16 });
      [170, 285, 400, 515, 630, 745].forEach((x) => arrow(overlay, x, 42, 68, '#666'));
      arrow(overlay, 545, 225, 160);
      arrow(overlay, 720, 225, 160);
      label(overlay, 'Longer notes in unexpected places', 620, 242, { fill: red, 'font-weight': '700', 'text-anchor': 'middle' });
    },
  },
  {
    id: 'peacherine-rag-syncopation',
    status: 'vexflow-overlay',
    sources: ['ad427d413191cb046506b502e32446ed538422a5.png'],
    output: 'peacherine-rag-syncopation.svg',
    alt: 'Grand-staff excerpt from Joplin’s Peacherine Rag, with red melody notes highlighting syncopation against a steady accompaniment.',
    width: 900,
    height: 330,
    render({ VF, context, overlay }) {
      const upper = drawStave(VF, context, { x: 55, y: 35, width: 790, key: 'Eb', time: '2/4', notes: [{ keys: ['eb/4', 'g/4'], duration: '8' }, { keys: ['g/4', 'bb/4'], duration: '8' }, { keys: ['f/4', 'ab/4'], duration: '8' }, { keys: ['g/4', 'bb/4'], duration: '8' }, { keys: ['eb/4', 'g/4', 'bb/4'], duration: '8' }, { keys: ['f/4', 'ab/4', 'c/5'], duration: '8' }, { keys: ['g/4', 'bb/4', 'd/5'], duration: '8' }, { key: 'c/5', duration: 'q' }], formatWidth: 620, beams: true });
      const lower = drawStave(VF, context, { x: 55, y: 185, width: 790, clef: 'bass', key: 'Eb', time: '2/4', notes: [{ key: 'eb/3', duration: 'q' }, { keys: ['bb/2', 'eb/3', 'g/3'], duration: 'q' }, { key: 'bb/2', duration: 'q' }, { keys: ['bb/2', 'd/3', 'f/3'], duration: 'q' }, { key: 'eb/3', duration: 'q' }, { keys: ['bb/2', 'eb/3', 'g/3'], duration: 'q' }], formatWidth: 620 });
      new VF.StaveConnector(upper.stave, lower.stave).setType(VF.StaveConnector.type.BRACE).setContext(context).draw();
      [430, 470, 515, 560].forEach((x) => overlay.circle(x, 100, 6, { fill: red }));
      label(overlay, 'syncopated melody', 500, 165, { fill: red, 'font-weight': '700', 'text-anchor': 'middle' });
    },
  },
  {
    id: 'syncopation-by-unexpected-accents',
    status: 'vexflow-overlay',
    sources: ['9901bdbeacc244671af7a5173eb91147c1fc2ba7.png'],
    output: 'syncopation-by-unexpected-accents.svg',
    alt: 'Repeated chords in common time with accents shifted from expected strong beats to an unexpected offbeat chord highlighted in red.',
    width: 820,
    height: 220,
    render({ VF, context, overlay }) {
      const notes = Array.from({ length: 12 }, (_, index) => {
        const n = note(VF, { keys: ['c/4', 'e/4', 'g/4'], duration: '8' });
        if ([0, 4, 8].includes(index)) n.addModifier(new VF.Articulation('a>').setPosition(VF.Modifier.Position.ABOVE), 0);
        return n;
      });
      drawStave(VF, context, { x: 45, y: 65, width: 730, time: 'C', notes, formatWidth: 590, beams: true });
      label(overlay, '>', 575, 52, { fill: red, 'font-size': 24, 'font-weight': '700', 'text-anchor': 'middle' });
      overlay.path('M 560 92 H 590 V 135 H 560 Z', { fill: 'none', stroke: red, 'stroke-width': 2 });
      label(overlay, 'unexpected accent', 575, 195, { fill: red, 'font-weight': '700', 'text-anchor': 'middle' });
    },
  },
  {
    id: 'one-and-two-measure-repeat-symbols',
    status: 'vexflow-overlay',
    sources: ['3d9009feab4fb0b2f7b3e95e4d2a7126b2f71d60.png'],
    output: 'one-and-two-measure-repeat-symbols.svg',
    alt: 'Examples of the slash-and-dot symbols that mean repeat the previous one measure or previous two measures.',
    width: 760,
    height: 400,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 45, y: 45, width: 670, key: 'G', time: '3/4', notes: [{ key: 'g/4', duration: 'q' }, { keys: ['b/4', 'd/5'], duration: 'q' }, { keys: ['b/4', 'd/5'], duration: 'q' }], formatWidth: 220 });
      label(overlay, '•  ╱  •', 520, 110, { 'font-size': 32, 'font-weight': '700', 'text-anchor': 'middle' });
      arrow(overlay, 520, 185, 135, '#555');
      label(overlay, 'Repeat the previous measure.', 520, 205, { 'font-size': 19, 'text-anchor': 'middle' });
      drawStave(VF, context, { x: 45, y: 240, width: 670, time: '3/4', notes: [{ key: 'g/4', duration: 'q' }, { keys: ['b/4', 'd/5'], duration: 'q' }, { keys: ['a/4', 'c/5'], duration: 'q' }, { key: 'e/4', duration: 'q' }, { keys: ['g/4', 'b/4'], duration: 'q' }], formatWidth: 360 });
      label(overlay, '•  ╱╱  •', 605, 304, { 'font-size': 30, 'font-weight': '700', 'text-anchor': 'middle' });
      label(overlay, 'Repeat the previous two measures.', 520, 382, { 'font-size': 19, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'first-second-and-third-endings',
    status: 'vexflow-overlay',
    sources: ['6a71fe8ef244b0a4385573aff0451eaadabb8201.png'],
    output: 'first-second-and-third-endings.svg',
    alt: 'A passage with a repeated section whose first-and-second ending (closed bracket) is played the first two times and whose third ending (open bracket) is played the third time.',
    width: 820,
    height: 360,
    render({ VF, context, overlay }) {
      const text = (value, x, y, fill = '#222') => label(overlay, value, x, y, { 'font-size': 17, fill, 'data-line-height': 24 });
      text('Closed bracket = go someplace else after ending', 418, 28, blue);
      text('(repeat or D.S., for example)', 558, 53, blue);
      text('Open bracket = go on', 635, 77, blue);
      text('Numbers tell you\nwhich time(s) to take\nthis ending', 215, 78, red);
      arrowLine(overlay, 504, 46, 615, 123, { stroke: blue, 'stroke-width': 1.5 });
      arrowLine(overlay, 752, 89, 798, 123, { stroke: blue, 'stroke-width': 1.5 });
      drawMeasures(VF, context, {
        x: 0, y: 120, widths: [187, 142, 148, 144, 146, 53], key: 'F', time: 'C', endBars: [null, null, null, 'repeatEnd', null, 'none'],
        measures: [melody('f4:w'), melody('a4:h c5:h'), melody('d5:w'), melody('c5:w'), melody('f5:w'), []],
      });
      const bracket = (x1, x2, number, closed) => {
        overlay.path(`M ${x1} 146 V 127 H ${x2}${closed ? ' V 146' : ''}`, { fill: 'none', stroke: blue, 'stroke-width': 1.5 });
        label(overlay, number, x1 + 4, 146, { fill: red, 'font-size': 16 });
      };
      bracket(329, 616, '1,2.', true);
      bracket(623, 808, '3.', false);
      const brace = (x1, x2) => {
        const mid = (x1 + x2) / 2;
        overlay.path(`M ${x1} 222 Q ${x1} 230 ${x1 + 12} 230 H ${mid - 12} Q ${mid} 230 ${mid} 238 Q ${mid} 230 ${mid + 12} 230 H ${x2 - 12} Q ${x2} 230 ${x2} 222`, { fill: 'none', stroke: '#111', 'stroke-width': 2.4 });
      };
      brace(83, 325); brace(350, 600); brace(631, 817);
      text('Play these measures\nevery time.', 103, 267);
      text('Play these measures\nand take the repeat\nthe first and second time.', 342, 265);
      text('Skip them the third time.', 342, 338, red);
      text('Play these measures\nthe third time\nand go on.', 642, 267);
    },
  },
  {
    id: 'musical-roadmap-signs',
    status: 'svg-overlay',
    sources: ['3790348ad803232771a0a0338773ace6a6da0ebe.png'],
    output: 'musical-roadmap-signs.svg',
    alt: 'Definitions of D.C., D.S., al fine, segno, fine, to-coda, and coda musical road-map signs.',
    width: 900,
    height: 430,
    render({ overlay }) {
      const rows = [
        ['D.C.   or   da capo', '“To the head” — go back to the very beginning'],
        ['D.S.   or   dal segno', '“To the sign” — go back to the segno sign'],
        ['al fine', '“To the end” — on the repeat, stop at fine'],
        ['segno', 'Segno: the sign'],
        ['fine', '“End” — on the final time through, stop here'],
        ['to-coda', 'Go to the coda section'],
        ['coda', 'Coda section'],
      ];
      rows.forEach(([symbol, meaning], index) => {
        const y = 55 + index * 53;
        if (symbol === 'segno') drawSegno(overlay, 72, y - 5);
        else if (symbol === 'coda') drawCoda(overlay, 72, y - 5);
        else if (symbol === 'to-coda') {
          label(overlay, 'to', 60, y, { fill: red, 'font-size': 18, 'font-style': 'italic', 'font-weight': '700' });
          drawCoda(overlay, 113, y - 5, 10);
        } else label(overlay, symbol, 60, y, { fill: red, 'font-size': 18, 'font-style': 'italic', 'font-weight': '700' });
        label(overlay, meaning, 330, y, { 'font-size': 18 });
      });
    },
  },
  {
    id: 'da-capo-and-dal-segno-roadmaps',
    status: 'vexflow-overlay',
    sources: ['6ff2ebbbc07037cf05e7f6a4621e7a5b1574b0cb.png'],
    output: 'da-capo-and-dal-segno-roadmaps.svg',
    alt: 'Two road maps: a D.C. al fine example that returns to the beginning and stops at fine, and a D.S. al coda example that returns to the sign, jumps at the to-coda mark, and finishes with the coda.',
    width: 625,
    height: 515,
    render({ VF, context, overlay }) {
      const italic = { 'font-family': 'Georgia, "Times New Roman", serif', 'font-style': 'italic', 'font-weight': '700', 'font-size': 14 };
      const glyph = (code, x, y, size = 30) => overlay.text(code, x, y, { 'font-family': 'Bravura', 'font-size': size, 'text-anchor': 'middle', fill: '#111' });
      const halves = (keys) => keys.map((key) => [{ key, duration: 'h' }]);
      label(overlay, 'Example 1:\nPlay to the D.C., then go back to the beginning and play until you reach "fine", then stop.', 20, 17, { 'font-size': 13, 'data-line-height': 19 });
      drawMeasures(VF, context, { x: 0, y: 35, widths: [151, 113, 109, 128], key: 'F', time: '2/4', measures: halves(['f/4', 'f/4', 'c/5', 'a/4']), endBars: [null, 'double', null, 'end'] });
      label(overlay, 'fine', 270, 62, italic);
      label(overlay, 'D.C.  al fine', 467, 63, italic);
      label(overlay, 'Example 2: Play to the  D.S., then go back to the sign and play until you find\nthe "to coda".  Go directly to the coda and play to the end.', 22, 180, { 'font-size': 13, 'data-line-height': 19 });
      drawMeasures(VF, context, { x: 0, y: 186, widths: [153, 110, 110, 124, 128], key: 'G', time: '2/4', measures: halves(['g/4', 'd/5', 'c/5', 'b/4', 'a/4']), endBars: [null, null, null, 'double', 'none'] });
      glyph('\uE047', 499, 222);
      drawMeasures(VF, context, { x: 0, y: 293, widths: [164, 121, 129], key: 'G', measures: halves(['c/5', 'b/4', 'a/4']), endBars: ['double', null, 'double'] });
      label(overlay, '2nd time to', 74, 316, italic);
      glyph('\uE048', 164, 316, 28);
      label(overlay, 'D.S. al coda', 399, 322, italic);
      glyph('\uE048', 34, 418, 28);
      drawMeasures(VF, context, { x: 0, y: 409, widths: [153, 115, 143], key: 'G', measures: halves(['e/5', 'f/5', 'g/5']), endBar: 'end' });
      const redCurve = (x1, y1, cx, cy, x2, y2) => {
        overlay.path(`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, { fill: 'none', stroke: red, 'stroke-width': 2.2 });
        const angle = Math.atan2(y2 - cy, x2 - cx);
        [-0.5, 0.5].forEach((spread) => overlay.line(x2, y2, x2 - 12 * Math.cos(angle + spread), y2 - 12 * Math.sin(angle + spread), { stroke: red, 'stroke-width': 2.2 }));
      };
      redCurve(433, 310, 480, 280, 489, 226);
      redCurve(149, 322, 150, 420, 64, 437);
    },
  },
  {
    id: 'accent-marking-types',
    status: 'vexflow-overlay',
    sources: ['daecca1456c88bc1862974a0fab72ff6b9043f84.png'],
    output: 'accent-marking-types.svg',
    alt: 'A six-eight passage showing ordinary accents, caret accents, sforzando, and fortepiano markings.',
    width: 900,
    height: 205,
    render({ VF, context, overlay }) {
      const { notes } = drawStave(VF, context, {
        x: 10, y: 25, width: 880, time: '6/8', notes: dynamicsAccentNotes(), formatWidth: 760, softmax: 40,
        beamGroups: [[0, 2], [3, 5], [7, 9], [10, 12]],
      });
      [[notes[14], 'sfz', '(sforzando)'], [notes[16], 'fp', '(fortepiano)']].forEach(([item, mark, gloss]) => {
        const x = noteX(item);
        label(overlay, mark, x, 160, { fill: red, 'font-style': 'italic', 'font-weight': '700', 'text-anchor': 'middle' });
        label(overlay, gloss, x, 188, { 'text-anchor': 'middle' });
      });
    },
  },
  {
    id: 'staccato-written-and-realized',
    status: 'vexflow-overlay',
    sources: ['315403d0f8e3593e35187bcadfa48bfc2cb9e10d.png'],
    output: 'staccato-written-and-realized.svg',
    alt: 'Staccato quarter notes compared with their approximate sound as alternating eighth notes and eighth rests.',
    width: 850,
    height: 420,
    render({ VF, context, overlay }) {
      const pitches = ['b/4', 'b/4', 'b/4', 'd/4', 'd/4', 'd/4', 'b/4', 'b/4', 'b/4'];
      const staccato = pitches.map((key) => note(VF, { key, duration: 'q' }).addModifier(new VF.Articulation('a.').setPosition(VF.Modifier.Position.ABOVE), 0));
      drawStave(VF, context, { x: 45, y: 45, width: 760, time: '3/4', notes: staccato, formatWidth: 600 });
      label(overlay, 'staccato…', 650, 35, { 'font-size': 20, 'font-style': 'italic' });
      label(overlay, 'Staccato notes sound approximately like notes separated by equal rests:', 55, 218, { 'font-size': 18 });
      const realized = pitches.flatMap((key) => [{ key, duration: '8' }, { rest: true, duration: '8' }]);
      drawStave(VF, context, { x: 45, y: 250, width: 760, time: '3/4', notes: realized, formatWidth: 600, beams: true });
    },
  },
  {
    id: 'slur-articulation-groups',
    status: 'vexflow-overlay',
    sources: ['771ffdbcc579a14d7b1c02cfd20985353e61c94c.png'],
    output: 'slur-articulation-groups.svg',
    alt: 'A three-four melody grouped by three slurs, with arrows showing that only each slur’s first note receives a definite articulation.',
    width: 850,
    height: 300,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 45, y: 65, width: 760, time: '3/4', notes: ['g/4', 'b/4', 'd/5', 'c/5', 'b/4', 'a/4', 'g/4', 'b/4', 'c/5'].map((key) => ({ key, duration: 'q' })), formatWidth: 610 });
      curve(overlay, 145, 93, 280, 75, 28);
      curve(overlay, 340, 75, 500, 97, 28);
      curve(overlay, 570, 103, 690, 89, 25);
      [145, 340, 570].forEach((x) => arrow(overlay, x, 235, 150));
      label(overlay, 'Only the first note under each slur has a definite articulation.', 425, 278, { 'font-size': 18, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'slurs-versus-ties',
    status: 'vexflow-overlay',
    sources: ['03fa0af783198b5c02044abfa9c9d47b3f5dafb9.png'],
    output: 'slurs-versus-ties.svg',
    alt: 'A three-four melody labelling slurs between different pitches in blue and ties between repeated pitches in red.',
    width: 880,
    height: 250,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 45, y: 80, width: 790, time: '3/4', notes: ['g/4', 'b/4', 'd/5', 'c/5', 'b/4', 'b/4', 'a/4', 'b/4', 'c/5', 'b/4', 'b/4', 'a/4'].map((key) => ({ key, duration: 'q' })), formatWidth: 630 });
      curve(overlay, 160, 105, 275, 88, 25, blue);
      curve(overlay, 335, 105, 410, 105, 22, red);
      curve(overlay, 475, 108, 565, 95, 22, blue);
      curve(overlay, 660, 114, 755, 114, 22, red);
      label(overlay, 'slur', 218, 55, { fill: blue, 'font-style': 'italic', 'font-weight': '700', 'text-anchor': 'middle' });
      label(overlay, 'tie', 372, 55, { fill: red, 'font-style': 'italic', 'font-weight': '700', 'text-anchor': 'middle' });
      label(overlay, 'slur', 520, 55, { fill: blue, 'font-style': 'italic', 'font-weight': '700', 'text-anchor': 'middle' });
      label(overlay, 'tie', 708, 55, { fill: red, 'font-style': 'italic', 'font-weight': '700', 'text-anchor': 'middle' });
    },
  },
  {
    id: 'scoops-and-falloffs',
    status: 'vexflow-overlay',
    sources: ['f14eb48346cf6665021fc041a7a55204dba63610.png'],
    output: 'scoops-and-falloffs.svg',
    alt: 'A common-time melody with curved scoops into notes and descending fall-offs from notes.',
    width: 780,
    height: 210,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 45, y: 65, width: 690, time: 'C', notes: [{ rest: true, duration: 'q' }, { key: 'b/4', duration: 'q' }, { key: 'c/5', duration: 'q' }, { key: 'd/5', duration: 'q' }, { key: 'g/5', duration: 'q' }, { rest: true, duration: 'q' }, { key: 'a/5', duration: 'q' }, { rest: true, duration: 'q' }], formatWidth: 530 });
      overlay.path('M 185 135 Q 180 103 220 101', { fill: 'none', stroke: '#111', 'stroke-width': 2 });
      overlay.path('M 410 82 Q 435 105 450 130', { fill: 'none', stroke: '#111', 'stroke-width': 2 });
      overlay.path('M 575 78 Q 600 108 610 135', { fill: 'none', stroke: '#111', 'stroke-width': 2 });
      label(overlay, 'scoop', 205, 180, { fill: blue, 'text-anchor': 'middle' });
      label(overlay, 'fall-offs', 525, 180, { fill: blue, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'conjunct-disjunct-and-mixed-motion',
    status: 'vexflow-overlay',
    sources: ['6d2da02e6b304aa7421942d50f230b299f43e498.png'],
    output: 'conjunct-disjunct-and-mixed-motion.svg',
    alt: 'Three melodies: a conjunct melody moving mostly by step, a disjunct melody moving by leaps, and a melody mixing steps and leaps.',
    width: 860,
    height: 490,
    render({ VF, context, overlay }) {
      const rows = [
        { title: 'Conjunct', key: 'F', time: '4/4', music: 'b4:q. a4:8 b4:q c5:q | d5:q c5:q b4:q a4:q | b4:q a4:q g4:q f4:q | a4:q. g4:8 f4:q e4:q' },
        { title: 'Disjunct', key: 'D', time: 'C|', music: 'b3:q e4:h b3:q | e4:h. r:q | c4:q a4:h e4:q | a4:h. r:q' },
        { title: 'Mixed', key: 'Eb', time: '3/4', music: 'b3:8. c4:16 e4:q c4:q | d4:q b4:h | b3:8. c4:16 d4:q a4:q | g4:h.' },
      ];
      rows.forEach(({ title, key, time, music }, index) => {
        const y = index * 165;
        overlay.text(title, 2, y + 22, { 'font-size': 19 });
        drawStave(VF, context, { x: 0, y: y + 10, width: 855, key, time, notes: melody(music), beams: true, formatWidth: 700 });
      });
    },
  },
  {
    id: 'riddle-song-four-phrases',
    status: 'vexflow-overlay',
    sources: ['862a42a57ea9a762784f2ccd2d2068e021741fbb.png'],
    output: 'riddle-song-four-phrases.svg',
    alt: 'Four color-coded phrases of The Riddle Song, with each melodic phrase aligned to one sentence of lyrics.',
    width: 920,
    height: 600,
    render({ VF, context, overlay }) {
      const rows = [
        { y: 40, color: red, words: 'I gave my love a cherry that has no stone.' },
        { y: 180, color: '#29a9d6', words: 'I gave my love a chicken that has no bone.' },
        { y: 320, color: green, words: 'I gave my love a ring that has no end.' },
        { y: 460, color: pink, words: 'I gave my love a baby with no crying.' },
      ];
      const keys = ['g/4', 'g/4', 'g/4', 'g/4', 'a/4', 'c/5', 'd/5', 'c/5', 'b/4', 'a/4', 'g/4'];
      rows.forEach(({ y, color, words }) => {
        drawStave(VF, context, { x: 45, y, width: 830, key: 'G', time: '4/4', notes: keys.map((pitch, index) => ({ key: pitch, duration: index > 8 ? 'h' : 'q' })), formatWidth: 660 });
        label(overlay, words, 460, y + 125, { fill: color, 'font-size': 18, 'text-anchor': 'middle' });
      });
    },
  },
  {
    id: 'auld-lang-syne-antecedent-consequent',
    status: 'vexflow-overlay',
    sources: ['2ce337631ea22e3e00c8bf33981c83c0374e0759.png'],
    output: 'auld-lang-syne-antecedent-consequent.svg',
    alt: 'Antecedent and consequent phrases of Auld Lang Syne, showing parallel rhythm but different melody and chord endings.',
    width: 960,
    height: 370,
    render({ VF, context, overlay }) {
      const antecedent = [
        ...melody('a3:q | d4:q. d4:8 d4:q f4:q | e4:q. d4:8 e4:q f4:q | d4:q. d4:8 f4:q a4:q | b4:h.', { color: red }),
        ...melody('b4:q', { color: blue }),
      ];
      const consequent = melody('a4:q. f4:8 f4:q d4:q | e4:q. d4:8 e4:q f4:q | d4:q. b3:8 b3:q a3:q | d4:h.', { color: blue });
      overlay.text('Antecedent Phrase', 0, 20, { fill: red, 'font-size': 20 });
      const top = drawStave(VF, context, { x: 0, y: 40, width: 960, key: 'D', time: '4/4', notes: antecedent, formatWidth: 800 });
      overlay.text('Consequent Phrase', 0, 200, { fill: blue, 'font-size': 20 });
      const bottom = drawStave(VF, context, { x: 0, y: 220, width: 960, key: 'D', notes: consequent, formatWidth: 820, endBar: 'end' });
      const chord = (item, name, y) => overlay.text(name, noteX(item), y, { 'font-size': 19, 'font-weight': '700', 'text-anchor': 'middle' });
      overlay.text('Chords:', noteX(top.notes[2]) - 22, 58, { 'font-size': 19, 'font-weight': '700', 'text-anchor': 'end' });
      [[2, 'D'], [7, 'A7'], [12, 'D'], [17, 'G']].forEach(([index, name]) => chord(top.notes[index], name, 58));
      [[0, 'D'], [5, 'A7'], [10, 'Bm'], [12, 'Em7'], [13, 'A7'], [15, 'D']].forEach(([index, name]) => chord(bottom.notes[index], name, 238));
    },
  },
  {
    id: 'beethoven-fate-motif',
    status: 'vexflow-overlay',
    sources: ['61a817eace09793f5c3a9d046d4c08d0d04813fd.png'],
    output: 'beethoven-fate-motif.svg',
    alt: 'Beethoven’s four-note fate motif: three repeated short notes followed by a long lower note under a fermata.',
    width: 420,
    height: 170,
    render({ VF, context }) {
      drawStave(VF, context, {
        x: 0, y: 30, width: 420, key: 'Eb', time: '2/4', formatWidth: 240,
        notes: melody('r:8 g4:8 g4:8 g4:8 | e4:h@'), beamGroups: [[1, 3]],
      });
    },
  },
  {
    id: 'siegfried-leitmotif-phrase',
    status: 'vexflow-overlay',
    sources: ['f3e6ac40f066daf1d2f6aef9c8e8ac3afd0debec.png'],
    output: 'siegfried-leitmotif-phrase.svg',
    alt: 'Two bass-clef phrases based on Wagner’s Siegfried leitmotif, using dotted rhythms, leaps, flats, and slurs.',
    width: 880,
    height: 380,
    render({ VF, context, overlay }) {
      const top = [note(VF, { key: 'd/3', duration: 'q', dots: 1 }), note(VF, { key: 'g/3', duration: 'q', dots: 1 }), { key: 'g/3', duration: '8' }, { key: 'g/3', duration: 'q' }, note(VF, { key: 'bb/3', duration: 'q', dots: 1, accidental: 'b' }), { key: 'g/3', duration: 'q' }, { key: 'g/3', duration: '8' }, note(VF, { key: 'db/4', duration: 'h', dots: 1, accidental: 'b' })];
      const bottom = [note(VF, { key: 'd/3', duration: 'q', dots: 1 }), { key: 'db/3', duration: 'q', accidental: 'b' }, { key: 'c/3', duration: '8' }, note(VF, { key: 'g/3', duration: 'q', dots: 1 }), { key: 'g/3', duration: 'q' }, { key: 'g/3', duration: '8' }, note(VF, { key: 'a/3', duration: 'q', dots: 1 }), { key: 'a/3', duration: 'q' }, { key: 'ab/3', duration: 'q', accidental: 'b' }, { key: 'a/3', duration: 'q' }, note(VF, { key: 'd/4', duration: 'h', dots: 1 })];
      drawStave(VF, context, { x: 45, y: 45, width: 790, clef: 'bass', key: 'G', time: '6/8', notes: top, formatWidth: 620, beams: true });
      drawStave(VF, context, { x: 45, y: 220, width: 790, clef: 'bass', key: 'G', notes: bottom, formatWidth: 620, beams: true });
      curve(overlay, 220, 85, 330, 70, 20);
      curve(overlay, 260, 260, 350, 250, 20);
      curve(overlay, 430, 260, 515, 250, 20);
    },
  },
  {
    id: 'beethoven-ode-to-joy-theme',
    status: 'vexflow-overlay',
    sources: ['04f1d4ac48717164428426cac4f806a7c27c9e16.png'],
    output: 'beethoven-ode-to-joy-theme.svg',
    alt: 'The four phrases of Beethoven’s Ode to Joy theme, including its repeated opening phrases and varied concluding phrase.',
    width: 900,
    height: 530,
    render({ VF, context }) {
      const opening = 'e4:q e4:q f4:q g4:q | g4:q f4:q e4:q d4:q | c4:q c4:q d4:q e4:q |';
      const rows = [
        { music: `${opening} e4:q. d4:8 d4:h` },
        { music: `${opening} d4:q. c4:8 c4:h` },
        { music: 'd4:q d4:q e4:q c4:q | d4:q e4:8 f4:8 e4:q c4:q | d4:q e4:8 f4:8 e4:q d4:q | c4:q d4:q g3:h', beamGroups: [[6, 7], [12, 13]] },
        { music: `${opening} d4:q. c4:8 c4:h` },
      ];
      rows.forEach(({ music, beamGroups }, index) => {
        drawStave(VF, context, {
          x: 0, y: index * 128, width: 900, time: index === 0 ? '4/4' : undefined, formatWidth: index === 0 ? 780 : 800,
          notes: melody(music, { stemDirection: 1 }), beamGroups,
        });
      });
    },
  },
];
