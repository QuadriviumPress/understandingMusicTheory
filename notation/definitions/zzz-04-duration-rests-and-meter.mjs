import { arrowLine, drawMeasures, drawRhythmEquation, drawStave, labelUnder, melody, note, noteX } from '../figure-helpers.mjs';

function box(overlay, x, y, width = 150, height = 78) {
  overlay.path(`M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`, { fill: 'none', stroke: '#555', 'stroke-width': 1.5 });
}

function drawSymbolNote(overlay, x, y, value = 'quarter', color = '#111') {
  const hollow = value === 'whole' || value === 'half';
  overlay.ellipse(x, y, 9, 6, { fill: hollow ? 'white' : color, stroke: color, 'stroke-width': 2, transform: `rotate(-18 ${x} ${y})` });
  if (value !== 'whole') overlay.line(x + 8, y, x + 8, y - 42, { stroke: color, 'stroke-width': 2.5 });
  if (value === 'eighth') overlay.path(`M ${x + 8} ${y - 42} Q ${x + 30} ${y - 30} ${x + 16} ${y - 12}`, { fill: 'none', stroke: color, 'stroke-width': 2.5 });
}

function renderDurationWorksheet(overlay, answers = false) {
  const red = '#d32f2f';
  const cells = [
    { x: 35, y: 45, symbol: 'whole', prompt: '1 whole = ____ quarters', answer: '4 quarter notes' },
    { x: 485, y: 45, symbol: 'half', prompt: '1 half = ____ quarters', answer: '2 quarter notes' },
    { x: 35, y: 210, symbol: 'whole', prompt: '1 whole = ____ eighths', answer: '8 eighth notes' },
    { x: 485, y: 210, symbol: 'half', prompt: '1 half = 1 quarter + ____ eighths', answer: '2 eighth notes' },
    { x: 35, y: 375, symbol: 'sixteenths', prompt: '4 sixteenths = 1 ____', answer: 'quarter note' },
    { x: 485, y: 375, symbol: 'mixed', prompt: '4 eighths + 1 half = 1 ____', answer: 'whole note' },
  ];
  cells.forEach(({ x, y, symbol, prompt, answer }) => {
    if (symbol === 'sixteenths') [x + 15, x + 55, x + 95, x + 135].forEach((sx) => drawSymbolNote(overlay, sx, y + 55, 'quarter'));
    else if (symbol === 'mixed') [x + 5, x + 55, x + 105, x + 155].forEach((sx) => drawSymbolNote(overlay, sx, y + 55, 'quarter'));
    else drawSymbolNote(overlay, x + 35, y + 55, symbol);
    overlay.text('=', x + 100, y + 60, { 'font-size': 25, 'text-anchor': 'middle' });
    box(overlay, x + 135, y, 220, 95);
    if (answers) {
      overlay.text(answer, x + 245, y + 58, { fill: red, 'font-size': 17, 'font-weight': '700', 'text-anchor': 'middle' });
    }
    overlay.text(prompt, x + 180, y + 135, { 'font-size': 16, 'font-weight': '700', 'text-anchor': 'middle' });
  });
}

export const definitions = [
  {
    id: 'note-duration-practice',
    sources: ['1f026bcc116aef253d1c52649ca5cfcf53b691e2.png'],
    output: 'note-duration-practice.svg',
    alt: 'A worksheet with empty boxes and blanks for completing equivalent note-duration equations.',
    width: 940,
    height: 570,
    render({ overlay }) { renderDurationWorksheet(overlay, false); },
  },
  {
    id: 'note-duration-practice-solutions',
    sources: ['e420035b374f956c2c7e871076450ff828a83e6f.png'],
    output: 'note-duration-practice-solutions.svg',
    alt: 'Completed note-duration equations showing equivalent quarter, eighth, half, and whole-note values.',
    width: 940,
    height: 570,
    render({ overlay }) { renderDurationWorksheet(overlay, true); },
  },
  {
    id: 'tempo-changes-actual-duration',
    sources: ['1da6a0c9f0312bd0155dbc94725a1e8649cc66d5.png'],
    output: 'tempo-changes-actual-duration.svg',
    alt: 'The same notes in slow three-four and fast two-two meter, showing that tempo affects actual duration.',
    width: 900,
    height: 420,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 45, y: 50, width: 540, time: '3/4', notes: [{ key: 'c/5', duration: 'h' }, { key: 'd/5', duration: 'q' }, { key: 'e/5', duration: 'h' }, { key: 'f/5', duration: 'q' }], formatWidth: 360 });
      overlay.text('Largo', 100, 36, { fill: '#1769aa', 'font-size': 18, 'font-style': 'italic' });
      overlay.text('Beats are slow and long', 650, 105, { fill: '#1769aa', 'font-size': 17 });
      overlay.text('A quarter note gets one beat', 650, 145, { fill: '#c62828', 'font-size': 17 });
      drawStave(VF, context, { x: 45, y: 245, width: 540, time: '2/2', notes: [{ key: 'c/5', duration: 'h' }, { key: 'd/5', duration: 'q' }, { key: 'e/5', duration: 'h' }, { key: 'f/5', duration: 'q' }], formatWidth: 360 });
      overlay.text('Allegro', 100, 231, { fill: '#1769aa', 'font-size': 18, 'font-style': 'italic' });
      overlay.text('Beats are fast and short', 650, 300, { fill: '#1769aa', 'font-size': 17 });
      overlay.text('A half note gets one beat', 650, 340, { fill: '#c62828', 'font-size': 17 });
      overlay.text('Relative note values stay the same, but their duration in seconds changes.', 450, 405, { 'font-size': 17, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'stem-direction-and-voices',
    sources: ['e99ec8a03615fb0497f77b5299866549ca529fb6.png'],
    output: 'stem-direction-and-voices.svg',
    alt: 'Examples of stem direction for single notes, beamed notes, chords, separate parts, and multiple rhythms.',
    width: 980,
    height: 630,
    render({ VF, context, overlay }) {
      const examples = [
        { x: 35, y: 45, title: 'Single notes', notes: [{ key: 'c/4', stemDirection: 1 }, { key: 'e/4', stemDirection: 1 }, { key: 'g/4', stemDirection: 1 }, { key: 'b/4', stemDirection: -1 }, { key: 'd/5', stemDirection: -1 }] },
        { x: 510, y: 45, title: 'Notes on a beam', notes: ['c/4', 'e/4', 'g/4', 'b/4', 'd/5'].map((key) => ({ key, duration: '8' })), beams: true },
        { x: 35, y: 245, title: 'Notes in chords', notes: [['c/4', 'e/4'], ['d/4', 'f/4'], ['e/4', 'g/4']].map((keys) => ({ keys, duration: 'h' })) },
        { x: 510, y: 245, title: 'Separate parts', notes: [{ keys: ['c/4', 'e/4'], duration: 'q', stemDirection: 1 }, { keys: ['b/3', 'd/4'], duration: 'q', stemDirection: -1 }, { key: 'g/4', duration: 'h', stemDirection: 1 }] },
      ];
      examples.forEach(({ x, y, title, notes, beams }) => {
        overlay.text(title, x + 210, y - 12, { 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' });
        drawStave(VF, context, { x, y, width: 435, time: x === 35 ? '4/4' : undefined, notes, formatWidth: 290, beams });
      });
      overlay.text('Multiple rhythms in one part', 490, 442, { 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' });
      drawStave(VF, context, { x: 140, y: 465, width: 700, time: '2/4', notes: [
        { keys: ['c/4', 'e/4', 'g/4'], duration: 'h' }, { rest: true, duration: '8' }, { key: 'b/4', duration: '16' }, { key: 'c/5', duration: '16' }, { rest: true, duration: 'q' },
      ], formatWidth: 500, beams: true });
    },
  },
  {
    id: 'rest-duration-practice',
    sources: ['516221c98846357d9645c78d9c218df3ad872ef8.png'],
    output: 'rest-duration-practice.svg',
    alt: 'A two-staff exercise asking for rests matching the note durations on the upper staff.',
    width: 1000,
    height: 330,
    render({ VF, context, overlay }) {
      const durations = ['h', 'q', 'q', 'w', 'q', '8', '8', 'q', '16', '16', '8', 'h'];
      drawStave(VF, context, { x: 40, y: 45, width: 920, time: '4/4', notes: durations.map((duration) => ({ key: 'b/4', duration })), formatWidth: 760, beams: true });
      drawStave(VF, context, { x: 40, y: 205, width: 920, time: '4/4', notes: [{ rest: true, duration: 'h' }, { rest: true, duration: 'q' }, { rest: true, duration: 'q' }], formatWidth: 180 });
      overlay.text('Write matching rests in the blank measures.', 500, 190, { 'font-size': 18, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'rest-duration-practice-solutions',
    sources: ['d7543f40076f23c7dd430a0b2d4c88e279a6d708.png'],
    output: 'rest-duration-practice-solutions.svg',
    alt: 'Completed two-staff exercise pairing each written note duration with an equivalent rest.',
    width: 1000,
    height: 330,
    render({ VF, context }) {
      const durations = ['h', 'q', 'q', 'w', 'q', '8', '8', 'q', '16', '16', '8', 'h'];
      drawStave(VF, context, { x: 40, y: 45, width: 920, time: '4/4', notes: durations.map((duration) => ({ key: 'b/4', duration })), formatWidth: 760, beams: true });
      drawStave(VF, context, { x: 40, y: 205, width: 920, time: '4/4', notes: durations.map((duration) => ({ rest: true, duration })), formatWidth: 760 });
    },
  },
  {
    id: 'simultaneous-rhythms-with-rests',
    sources: ['983c61f990d02147ab4473508cb516532e871057.png'],
    output: 'simultaneous-rhythms-with-rests.svg',
    alt: 'Two examples using rests to clarify simultaneous upper and lower rhythms on a single staff.',
    width: 920,
    height: 450,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 45, y: 45, width: 830, time: '6/8', notes: [
        note(VF, { key: 'c/5', duration: 'q', dots: 1 }), { rest: true, duration: '8' }, { key: 'd/5', duration: '8' }, { key: 'e/5', duration: 'q' },
      ], formatWidth: 610, beams: true });
      drawStave(VF, context, { x: 45, y: 180, width: 830, clef: null, notes: ['c/4', 'e/4', 'g/4', 'c/4', 'e/4', 'g/4'].map((key) => ({ key, duration: '8', stemDirection: 1 })), formatWidth: 610, beams: true });
      overlay.text('Upper and lower rhythms remain visually distinct.', 460, 325, { 'font-size': 18, 'text-anchor': 'middle' });
      drawStave(VF, context, { x: 170, y: 335, width: 580, time: '2/4', notes: [
        { keys: ['c/4', 'e/4', 'g/4'], duration: 'h' }, { rest: true, duration: '8' }, { key: 'c/5', duration: '16' }, { key: 'd/5', duration: '16' }, { rest: true, duration: 'q' },
      ], formatWidth: 390, beams: true });
    },
  },
  {
    id: 'four-four-measure-equivalents',
    sources: ['1c02351a802600540e0111b6209222fb77641a53.png'],
    output: 'four-four-measure-equivalents.svg',
    alt: 'Four-four measures filled by four quarters, two halves, one whole note, and two quarters with four eighths; the top number gives four beats per measure and the quarter note gets one beat.',
    width: 790,
    height: 228,
    render({ VF, context, overlay }) {
      drawMeasures(VF, context, {
        x: 0, y: 41, widths: [257, 114, 72, 245], time: '4/4', spread: 0.8, beams: [[], [], [], [[1, 2], [4, 5]]],
        measures: [melody('g4 g4 g4 g4'), melody('g4:h g4:h'), melody('g4:w'), melody('g4:q g4:8 g4:8 g4:q g4:8 g4:8')],
      });
      overlay.text('4 beats in a measure', 7, 23, { 'font-size': 16 });
      arrowLine(overlay, 33, 33, 67, 69);
      arrowLine(overlay, 46, 196, 68, 150);
      overlay.text('A quarter note  gets one beat', 12, 219, { 'font-size': 16 });
      overlay.text('4 quarters =  two halves   = one whole = 2 quarters and four eighths = and so on', 123, 176, { 'font-size': 16 });
    },
  },
  {
    id: 'three-eight-measure-combinations',
    sources: ['946da6e7a6efd927bc8b1a37b8b0c03a26d94b6d.png'],
    output: 'three-eight-measure-combinations.svg',
    alt: 'Five different rhythmic combinations that each fill one measure of three-eight time.',
    width: 1040,
    height: 280,
    render({ VF, context, overlay }) {
      const groups = [
        Array.from({ length: 3 }, () => ({ key: 'c/5', duration: '8' })),
        Array.from({ length: 6 }, () => ({ key: 'c/5', duration: '16' })),
        [{ key: 'c/5', duration: 'q' }, { key: 'c/5', duration: '8' }],
        [note(VF, { key: 'c/5', duration: 'q', dots: 1 })],
        [{ key: 'c/5', duration: '8' }, { key: 'c/5', duration: '16' }, { key: 'c/5', duration: '16' }],
      ];
      groups.forEach((notes, index) => drawStave(VF, context, { x: 25 + index * 200, y: 55, width: 190, clef: index === 0 ? 'treble' : null, time: index === 0 ? '3/8' : undefined, notes, formatWidth: 100, beams: true }));
      labelUnder(overlay, ['3 eighths', '6 sixteenths', '1 quarter\n+ 1 eighth', 'dotted quarter', '2 eighths\n+ 2 sixteenths'], 120, 200, 220, { 'data-line-height': 20 });
    },
  },
  {
    id: 'time-signature-practice-solutions',
    sources: ['08d3f79041cd4535ab484cde32f313555b39adcd.png'],
    output: 'time-signature-practice-solutions.svg',
    alt: 'Example completed measures in two-four, three-eight, and six-four time signatures.',
    width: 1020,
    height: 560,
    render({ VF, context, overlay }) {
      const rows = [
        { y: 35, time: '2/4', notes: [{ key: 'c/5', duration: 'q' }, { key: 'd/5', duration: 'q' }, note(VF, { key: 'e/5', duration: 'q', dots: 1 }), { key: 'f/5', duration: '8' }, ...Array.from({ length: 4 }, () => ({ key: 'g/5', duration: '8' }))] },
        { y: 205, time: '3/8', notes: [note(VF, { key: 'c/5', duration: 'q', dots: 1 }), ...Array.from({ length: 3 }, () => ({ key: 'd/5', duration: '8' })), { key: 'e/5', duration: 'q' }, { key: 'f/5', duration: '8' }] },
        { y: 375, time: '6/4', notes: [{ key: 'c/5', duration: 'w' }, { key: 'd/5', duration: 'h' }, note(VF, { key: 'e/5', duration: 'h', dots: 1 }), ...Array.from({ length: 3 }, () => ({ key: 'f/5', duration: 'q' }))] },
      ];
      rows.forEach(({ y, time, notes }) => drawStave(VF, context, { x: 45, y, width: 930, time, notes, formatWidth: 740, beams: true }));
      overlay.text('These are examples; many other correct combinations are possible.', 510, 548, { 'font-size': 18, 'text-anchor': 'middle' });
    },
  },
];
