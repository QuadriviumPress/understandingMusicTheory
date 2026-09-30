import { drawMeasures, drawStave, labelUnder, melody, note, placeNotes } from '../figure-helpers.mjs';

function drawSymbolNote(overlay, x, y, value = 'quarter') {
  const hollow = value === 'whole' || value === 'half';
  overlay.ellipse(x, y, 10, 7, { fill: hollow ? 'white' : '#111', stroke: '#111', 'stroke-width': 2, transform: `rotate(-18 ${x} ${y})` });
  if (value !== 'whole') overlay.line(x + 9, y, x + 9, y - 48, { stroke: '#111', 'stroke-width': 3 });
  if (value === 'eighth') overlay.path(`M ${x + 9} ${y - 48} Q ${x + 34} ${y - 35} ${x + 18} ${y - 15}`, { fill: 'none', stroke: '#111', 'stroke-width': 3 });
}

// Key-signature pairs: [key, label, x, y, labelX, labelY]; solutions add the right-hand column.
function drawKeySignaturePairs(VF, context, overlay, showSolutions) {
  const entries = [
    ['B', 'B major', 0, -12, 70, 100], ['Bbm', 'B flat minor', 0, 102, 80, 214],
    ['Cb', showSolutions ? 'C flat major' : '', 288, -12, 380, 100], ['A#m', showSolutions ? 'A sharp minor' : '', 288, 102, 394, 214],
  ];
  entries.forEach(([key, label, x, y, labelX, labelY]) => {
    drawStave(VF, context, { x, y, width: 228, key: x === 0 || showSolutions ? key : undefined, beginBar: 'none', endBar: 'none' });
    if (label) overlay.text(label, labelX, labelY, { 'font-size': 15, 'text-anchor': 'middle', fill: '#333' });
  });
}

export const definitions = [
  {
    id: 'enharmonic-note-solutions',
    sources: ['fc80686dbb2a3da98305b51c5fbe0be7fe0df65f.png'],
    output: 'enharmonic-note-solutions.svg',
    alt: 'Enharmonic pairs on a treble staff: C sharp and D flat, F sharp and G flat, G sharp and A flat, A sharp and B flat.',
    width: 540,
    height: 95,
    render({ VF, context }) {
      drawMeasures(VF, context, {
        x: 0, y: -18, widths: [152, 124, 128, 126], spread: 0.7,
        measures: [['c#4', 'db4'], ['f#4', 'gb4'], ['g#4', 'ab4'], ['a#4', 'bb4']].map((pair) => melody(pair.map((pitch) => `${pitch}:w`).join(' '))),
      });
    },
  },
  {
    id: 'double-sharp-and-double-flat',
    sources: ['474e94deea43979f36c549e417e20be46265bcff.png'],
    output: 'double-sharp-and-double-flat.svg',
    alt: 'The double sharp and double flat symbols, shown on F double sharp and F double flat.',
    width: 330,
    height: 160,
    render({ VF, context, overlay }) {
      [['Double Sharp', '', 80], ['Double Flat', '', 268]].forEach(([title, glyph, x]) => {
        overlay.text(title, x, 18, { 'font-size': 13, 'font-weight': '700', 'text-anchor': 'middle' });
        overlay.text(glyph, x, 44, { 'font-family': 'Bravura', 'font-size': 28, 'text-anchor': 'middle', fill: '#111' });
      });
      drawMeasures(VF, context, {
        x: 0, y: 44, widths: [180, 150], endBar: 'none',
        measures: [[{ key: 'f/4', accidental: '##', duration: 'w' }], [{ key: 'f/4', accidental: 'bb', duration: 'w' }]],
      });
      overlay.text('"F double sharp"', 80, 152, { 'font-size': 13, 'text-anchor': 'middle', fill: '#333' });
      overlay.text('"F double flat"', 268, 152, { 'font-size': 13, 'text-anchor': 'middle', fill: '#333' });
    },
  },
  {
    id: 'enharmonic-major-scales',
    sources: ['78771163de17e6e1143aee5b2ceac299a8b11e63.png'],
    output: 'enharmonic-major-scales.svg',
    alt: 'The E flat major scale and the enharmonic D sharp major scale, which needs E sharp, F double sharp, B sharp, and C double sharp.',
    width: 470,
    height: 230,
    render({ VF, context }) {
      drawStave(VF, context, { x: 0, y: 0, width: 470, beginBar: 'none', endBar: 'none', formatWidth: 360, notes: melody('eb4 f4 g4 ab4 bb4 c5 d5 eb5') });
      drawStave(VF, context, { x: 0, y: 110, width: 470, beginBar: 'none', endBar: 'none', formatWidth: 360, notes: melody('d#4 e#4 f##4 g#4 a#4 b#4 c##5 d#5') });
    },
  },
  {
    id: 'enharmonic-key-signature-solutions',
    sources: ['1a40746eda2587a243368245b5d05212ff77bb72.png'],
    output: 'enharmonic-key-signature-solutions.svg',
    alt: 'B major and B flat minor key signatures with their enharmonic equivalents, C flat major and A sharp minor',
    width: 520,
    height: 225,
    render({ VF, context, overlay }) { drawKeySignaturePairs(VF, context, overlay, true); },
  },
  {
    id: 'note-anatomy',
    sources: ['1c0318c0e18cbf5f0a591a3d5d6fceb2bf48a3ac.png'],
    output: 'note-anatomy.svg',
    alt: 'Hollow and filled noteheads with arrows labelling the head, stem, flag, and augmentation dot.',
    width: 800,
    height: 300,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 250, y: 70, width: 180, clef: null, notes: [note(VF, { key: 'b/4', duration: 'h', dots: 1 })], formatWidth: 65 });
      drawStave(VF, context, { x: 500, y: 70, width: 180, clef: null, notes: [note(VF, { key: 'b/4', duration: '8', stemDirection: 1 })], formatWidth: 65 });
      overlay.text('head\n(not filled in)', 40, 145, { 'font-size': 17, 'data-line-height': 22 });
      overlay.line(175, 130, 292, 123, { stroke: '#111', 'stroke-width': 1.7 });
      overlay.text('dot', 294, 40, { fill: '#1769aa', 'font-size': 18, 'text-anchor': 'middle' });
      overlay.line(294, 48, 294, 112, { stroke: '#1769aa', 'stroke-width': 1.7 });
      overlay.text('stem', 465, 225, { fill: '#d32f2f', 'font-size': 18, 'text-anchor': 'middle' });
      overlay.line(415, 205, 283, 165, { stroke: '#d32f2f', 'stroke-width': 1.7 });
      overlay.line(515, 205, 541, 112, { stroke: '#d32f2f', 'stroke-width': 1.7 });
      overlay.text('flag', 715, 82, { 'font-size': 17 });
      overlay.line(705, 88, 553, 100, { stroke: '#111', 'stroke-width': 1.7 });
      overlay.text('head (filled in)', 650, 240, { 'font-size': 17 });
      overlay.line(640, 220, 545, 138, { stroke: '#111', 'stroke-width': 1.7 });
    },
  },
  {
    id: 'headless-and-slash-notes',
    sources: ['2277ff861fd1e5c40c62d2f7350ff845bd5c59c7.png'],
    output: 'headless-and-slash-notes.svg',
    alt: 'Headless (x) notes on a single line show rhythm without pitch; slash notes under a Gm chord symbol stand for the full G minor chord written out beside them.',
    width: 760,
    height: 262,
    render({ VF, context, overlay }) {
      overlay.line(0, 92, 242, 92, { stroke: '#111', 'stroke-width': 1.5 });
      drawStave(VF, context, {
        x: 30, y: 32, width: 180, clef: null, hideLines: true, padding: 0, noteStartX: 40, formatWidth: 110,
        notes: [{ keys: ['b/4/x2'], duration: 'q' }, { keys: ['b/4/x2'], duration: 'q' }, { keys: ['b/4/x2'], duration: '8' }, { keys: ['b/4/x2'], duration: '8' }].map((spec) => ({ ...spec, stemDirection: 1 })),
        beamGroups: [[2, 3]],
      });
      overlay.text('Headless notes have\ndefinite rhythm but not\ndefinite pitch.', 10, 190, { 'font-size': 17, 'data-line-height': 24, fill: '#222' });
      drawStave(VF, context, {
        x: 305, y: 22, width: 180, beginBar: 'none', endBar: 'none', formatWidth: 60,
        notes: Array.from({ length: 4 }, () => ({ keys: ['b/4/s'], duration: '8', stemDirection: 1 })), beamGroups: [[0, 3]],
      });
      overlay.text('Gm', 396, 13, { 'font-size': 16, 'font-weight': '700', 'text-anchor': 'middle' });
      overlay.text('=', 521, 88, { 'font-size': 22, 'font-weight': '700', 'text-anchor': 'middle' });
      drawStave(VF, context, {
        x: 555, y: 22, width: 190, beginBar: 'none', endBar: 'none', formatWidth: 80, beamGroups: [[0, 3]],
        notes: melody('(g3+d4+g4+bb4+d5+g5):8 (g3+d4+g4+bb4+d5+g5):8 (g3+d4+g4+bb4+d5+g5):8 (g3+d4+g4+bb4+d5+g5):8', { stemDirection: 1 }),
      });
      overlay.text('Notes with slashes instead of heads\nare a quick way to write an entire chord\nand may be easier for some instrumentalists\n(such as guitarists) to read.', 265, 185, { 'font-size': 17, 'data-line-height': 24, fill: '#222' });
    },
  },
  {
    id: 'fractional-note-values',
    sources: ['02b3dcafe15c45a0dd5bc1c2261ba0498de65c9f.png'],
    output: 'fractional-note-values.svg',
    alt: 'In four-four time, one whole note equals two half notes, four quarter notes, or eight eighth notes, and so on.',
    width: 640,
    height: 160,
    render({ VF, context, overlay }) {
      drawMeasures(VF, context, {
        x: 0, y: -10, widths: [141, 90, 126, 210], time: '4/4', spread: 0.85, beams: [[], [], [], [[4, 5], [6, 7]]],
        measures: [melody('b4:w'), melody('b4:h b4:h'), melody('b4 b4 b4 b4'), melody('b4:8 b4:8 b4:8 b4:8 b4:8 b4:8 b4:8 b4:8')],
      });
      overlay.text('. . .', 604, 55, { 'font-size': 18, 'text-anchor': 'middle' });
      const text = (value, x, y) => overlay.text(value, x, y, { 'font-size': 16, 'data-line-height': 21, fill: '#333' });
      text('One\nwhole\nnote', 70, 98); text('Two\nhalf\nnotes', 159, 101); text('Four\nquarter\nnotes', 248, 104); text('Eight\neighth\nnotes', 381, 101); text('And\nso on ...', 581, 116);
      [139, 218, 346, 548].forEach((x) => overlay.text('=', x, 120, { 'font-size': 16, 'text-anchor': 'middle', fill: '#333' }));
    },
  },
  {
    id: 'flags-and-beams-equivalence',
    sources: ['e62d54293b2496a82a5aa78702e98cc70a128ea2.png'],
    output: 'flags-and-beams-equivalence.svg',
    alt: 'Flagged sixteenth notes shown equal to the same notes beamed in groups, and a flagged eighth-and-sixteenth rhythm equal to the same rhythm beamed.',
    width: 640,
    height: 215,
    render({ VF, context, overlay }) {
      const flagged = (y, music) => drawStave(VF, context, { x: 0, y, width: 280, endBar: 'none', formatWidth: 190, notes: melody(music, { stemDirection: 1 }) });
      const beamed = (y, music, beamGroups) => drawStave(VF, context, { x: 354, y, width: 285, endBar: 'none', formatWidth: 190, notes: melody(music, { stemDirection: 1 }), beamGroups });
      flagged(-19, 'a4:16 a4:16 a4:16 a4:16 a4:16 a4:16 a4:16 a4:16');
      beamed(-19, 'a4:16 a4:16 a4:16 a4:16 a4:16 a4:16 a4:16 a4:16', [[0, 3], [4, 7]]);
      flagged(93, 'f4:8 f4:16 f4:16 f4:16 f4:8 f4:16');
      beamed(93, 'f4:8 f4:16 f4:16 f4:16 f4:8 f4:16', [[0, 2], [3, 5]]);
      [42, 154].forEach((y) => overlay.text('=', 321, y, { 'font-size': 22, 'font-weight': '700', 'text-anchor': 'middle' }));
    },
  },
  {
    id: 'note-value-equations',
    sources: ['a4e3c4299b4df0cbc42338cbce821ba91aa2dea2.png'],
    output: 'note-value-equations.svg',
    alt: 'Three duration equations: one whole equals two halves, a half plus two quarters equals a whole, and four eighths equal a half.',
    width: 780,
    height: 430,
    render({ overlay }) {
      const rows = [
        { y: 85, left: [['whole', 155]], right: [['half', 430], ['half', 515]], text: '1 whole note = 2 half notes' },
        { y: 210, left: [['half', 125], ['quarter', 210], ['quarter', 270]], right: [['whole', 485]], text: '1 half note + 2 quarter notes = 1 whole note' },
        { y: 335, left: [['eighth', 95], ['eighth', 155], ['eighth', 215], ['eighth', 275]], right: [['half', 485]], text: '4 eighth notes = 1 half note' },
      ];
      rows.forEach(({ y, left, right, text }) => {
        left.forEach(([value, x]) => drawSymbolNote(overlay, x, y, value));
        overlay.text('=', 365, y + 7, { 'font-size': 27, 'text-anchor': 'middle' });
        right.forEach(([value, x]) => drawSymbolNote(overlay, x, y, value));
        overlay.text(text, 365, y + 52, { 'font-size': 16, 'text-anchor': 'middle' });
      });
    },
  },
];
