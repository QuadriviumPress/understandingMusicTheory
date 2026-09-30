import { arrowLine, drawMeasures, drawRhythmEquation, drawStave, labelUnder, melody, note, noteX } from '../figure-helpers.mjs';

const red = '#d32f2f';

// Worksheet laid out at the original 440 x 260 pixel scale. Each entry: equation items, then
// the text runs, then the red answer (shown only in the solutions).
const durationRows = [
  { headY: 30, items: [{ x: 33, music: 'f4:w' }, { x: 65, text: '=' }, { box: [83, 190], top: 8, bottom: 52 }],
    answer: { headY: 45, items: [{ x: 99, music: 'f4:q f4:q f4:q f4:q', spacing: 24 }] } },
  { headY: 34, items: [{ x: 254, music: 'f4:h' }, { x: 283, text: '=' }, { box: [320, 428], top: 10, bottom: 54 }],
    answer: { headY: 45, items: [{ x: 350, music: 'f4:q f4:q', spacing: 32 }] } },
  { headY: 126, items: [{ x: 18, music: 'f4:w' }, { x: 40, text: '=' }, { box: [54, 229], top: 99, bottom: 145 }],
    answer: { headY: 132, items: [{ x: 64, music: 'f4:8 f4:8 f4:8 f4:8', beam: true, spacing: 21 }, { x: 145, music: 'f4:8 f4:8 f4:8 f4:8', beam: true, spacing: 21 }] } },
  { headY: 126, items: [{ x: 250, music: 'f4:h' }, { x: 282, text: '=' }, { box: [316, 424], top: 99, bottom: 143 }],
    answer: { headY: 133, items: [{ x: 340, music: 'f4:q' }, { x: 381, music: 'f4:8 f4:8', beam: true, spacing: 24 }] } },
  { headY: 220, items: [{ x: 3, music: 'f4:16 f4:16 f4:16 f4:16', beam: true, spacing: 23 }, { x: 90, text: '=' }, { box: [110, 193], top: 188, bottom: 233 }],
    answer: { headY: 220, items: [{ x: 150, music: 'f4:q' }] } },
  { headY: 220, items: [{ x: 212, music: 'f4:8 f4:8 f4:8 f4:8', beam: true, spacing: 22 }, { x: 307, music: 'f4:h' }, { x: 336, text: '=' }, { box: [361, 435], top: 187, bottom: 232 }],
    answer: { headY: 212, items: [{ x: 398, music: 'f4:w' }] } },
];

const durationText = [
  [[1, 75, '1 whole ='], [124, 75, 'quarters'], [233, 75, '1 half ='], [368, 75, 'quarters']],
  [[6, 166, '1 whole ='], [111, 166, 'eighths'], [216, 166, '1 half ='], [265, 166, '1 quarter +'], [369, 166, 'eighths']],
  [[4, 250, '4 sixteenths ='], [108, 250, '1'], [217, 252, '4 eighths + 1 half ='], [357, 252, '1']],
];
const durationBlanks = [[89, 119, 77], [333, 363, 77], [76, 106, 168], [333, 363, 168], [119, 185, 253], [368, 440, 255]];
const durationAnswers = [[104, 73, '4'], [348, 73, '2'], [91, 165, '8'], [348, 165, '2'], [152, 249, 'quarter'], [403, 251, 'whole']];

function renderDurationWorksheet(VF, context, overlay, answers = false) {
  durationRows.forEach(({ headY, items, answer }) => {
    drawRhythmEquation(VF, context, overlay, items, { headY });
    if (answers) answer.items.forEach((item) => drawRhythmEquation(VF, context, overlay, [{ ...item, color: red }], { headY: answer.headY }));
  });
  durationText.flat().forEach(([x, y, text]) => overlay.text(text, x, y, { 'font-size': 12, 'font-weight': '700' }));
  durationBlanks.forEach(([x1, x2, y]) => overlay.line(x1, y, x2, y, { stroke: '#666', 'stroke-width': 1 }));
  if (answers) durationAnswers.forEach(([x, y, text]) => overlay.text(text, x, y, { fill: red, 'font-size': 12, 'font-weight': '700', 'text-anchor': 'middle' }));
}

const restWidths = [230, 84, 180, 200, 200, 100];
const restNoteMeasures = ['f4:h f4:q f4:q', 'f4:w', 'f4:q f4:8 f4:8 f4:h', 'f4:16 f4:16 f4:8 f4:h f4:q', 'f4:16 f4:8 f4:16 f4:q f4:h', 'f4:w'];

export const definitions = [
  {
    id: 'note-duration-practice',
    sources: ['1f026bcc116aef253d1c52649ca5cfcf53b691e2.png'],
    output: 'note-duration-practice.svg',
    alt: 'A worksheet with empty boxes and blanks for completing equivalent note-duration equations.',
    width: 440,
    height: 262,
    render({ VF, context, overlay }) { renderDurationWorksheet(VF, context, overlay, false); },
  },
  {
    id: 'note-duration-practice-solutions',
    sources: ['e420035b374f956c2c7e871076450ff828a83e6f.png'],
    output: 'note-duration-practice-solutions.svg',
    alt: 'Completed note-duration equations showing equivalent quarter, eighth, half, and whole-note values.',
    width: 440,
    height: 262,
    render({ VF, context, overlay }) { renderDurationWorksheet(VF, context, overlay, true); },
  },
  {
    id: 'tempo-changes-actual-duration',
    sources: ['1da6a0c9f0312bd0155dbc94725a1e8649cc66d5.png'],
    output: 'tempo-changes-actual-duration.svg',
    alt: 'Largo in three-four, where the quarter note gets one beat and beats are slow and long, and Allegro in two-two, where the half note gets one beat and beats are fast and short; a half note is twice a quarter note on both staves, but a half note in the fast piece is much shorter than one in the slow piece.',
    width: 900,
    height: 420,
    render({ VF, context, overlay }) {
      const blue = '#1769aa';
      const red = '#c62828';
      drawMeasures(VF, context, {
        x: 10, y: 27, widths: [305, 200], time: '3/4', spread: 0.7,
        measures: [melody('f4:h a4:q'), [...melody('c5:h', { stemDirection: -1 }), ...melody('f5:q', { stemDirection: -1 })]],
      });
      overlay.text('Largo', 76, 42, { fill: blue, 'font-size': 16, 'font-style': 'italic', 'font-weight': '700' });
      overlay.text('Beats are slow and long', 200, 18, { fill: blue, 'font-size': 15 });
      arrowLine(overlay, 190, 16, 152, 34, { stroke: blue, head: 9 });
      arrowLine(overlay, 172, 168, 118, 138, { stroke: red, head: 9 });
      overlay.text('Quarter note gets one beat', 170, 182, { fill: red, 'font-size': 15 });
      drawMeasures(VF, context, {
        x: 10, y: 252, widths: [312, 211], time: '2/2', spread: 0.7,
        measures: [
          [...melody('c5:h b4:q', { stemDirection: -1 }), ...melody('a4:q', { stemDirection: 1 })],
          [...melody('g4:h', { stemDirection: 1 }), ...melody('c5:q', { stemDirection: -1 }), ...melody('g4:q', { stemDirection: 1 })],
        ],
      });
      overlay.text('Allegro', 66, 267, { fill: blue, 'font-size': 16, 'font-style': 'italic', 'font-weight': '700' });
      overlay.text('Beats are fast and short', 203, 250, { fill: blue, 'font-size': 15 });
      arrowLine(overlay, 192, 250, 154, 268, { stroke: blue, head: 9 });
      arrowLine(overlay, 132, 402, 86, 360, { stroke: red, head: 9 });
      overlay.text('Half notes get one beat', 135, 415, { fill: red, 'font-size': 15 });
      ['On both staves,', 'a half note is twice as long', 'as a quarter note.', 'But', 'a half note on the second staff', 'will be a lot shorter than', 'a half note on the first staff.']
        .forEach((line, index) => overlay.text(line, 572, 118 + index * 30, { 'font-size': 14 }));
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
      const bar = { bar: 'single' };
      const up = (keys, duration = 'q') => ({ keys, duration, stemDirection: 1 });
      const down = (keys, duration = 'q') => ({ keys, duration, stemDirection: -1 });
      const examples = [
        { x: 35, y: 45, title: 'Single notes', key: 'F', time: 'C', notes: [up(['c/4']), bar, up(['f/4']), up(['a/4']), { keys: ['c/5'], duration: 'q', dots: 1, stemDirection: -1 }, down(['f/5'], '8')] },
        { x: 510, y: 45, title: 'Notes on a beam', time: '2/4', notes: [...['c/4', 'f/4', 'g/4', 'a/4'].map((key) => up([key], '16')), ...['b/4', 'g/5'].map((key) => down([key], '8'))], beamGroups: [[0, 3], [4, 5]] },
        { x: 35, y: 245, title: 'Notes in chords', key: 'G', time: 'C', notes: [up(['a/3', 'd/4', 'g/4'], 'h'), up(['d/4', 'b/4', 'd/5'], 'h'), bar, down(['g/4', 'b/4', 'g/5'], 'h'), down(['a/4', 'd/5', 'f/5'], 'h')] },
        { x: 510, y: 245, title: 'Separate parts', key: 'F', time: '3/4', notes: [up(['f/4', 'a/4']), up(['e/4', 'g/4']), up(['d/4', 'f/4']), bar, down(['e/4']), down(['g/4']), down(['c/4'])] },
      ];
      examples.forEach(({ x, y, title, key, time, notes, beamGroups }) => {
        overlay.text(title, x + 210, y - 12, { 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' });
        drawStave(VF, context, { x, y, width: 435, key, time, notes, formatWidth: 290, beamGroups });
      });
      overlay.text('Multiple rhythms in one part', 490, 442, { 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' });
      drawStave(VF, context, { x: 140, y: 465, width: 700, key: 'Eb', time: '2/4', notes: [
        { keys: ['c/4', 'e/4', 'g/4'], duration: 'h' }, { rest: true, duration: '8' }, { key: 'b/4', duration: '16' }, { key: 'c/5', duration: '16' }, { rest: true, duration: 'q' },
      ], formatWidth: 500, beams: true });
    },
  },
  {
    id: 'rest-duration-practice',
    sources: ['516221c98846357d9645c78d9c218df3ad872ef8.png'],
    output: 'rest-duration-practice.svg',
    alt: 'A two-staff exercise in four-four time. The upper staff has six measures of F notes: half, quarter, quarter; whole; quarter, two eighths, half; two sixteenths and an eighth, half, quarter; sixteenth, eighth, sixteenth, quarter, half; whole. The lower staff has only the first measure filled, with a half rest and two quarter rests, and five blank measures to complete.',
    width: 1000,
    height: 330,
    render({ VF, context, overlay }) {
      drawMeasures(VF, context, {
        x: 20, y: 45, widths: restWidths, time: '4/4', spread: 0.8, beams: [[], [], [[1, 2]], [[0, 2]], [[0, 2]], []],
        measures: restNoteMeasures.map((text) => melody(text)),
      });
      drawMeasures(VF, context, {
        x: 20, y: 205, widths: restWidths, time: '4/4', spread: 0.8,
        measures: [melody('r:h r:q r:q'), [], [], [], [], []],
      });
      overlay.text('Write matching rests in the blank measures.', 500, 190, { 'font-size': 18, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'rest-duration-practice-solutions',
    sources: ['d7543f40076f23c7dd430a0b2d4c88e279a6d708.png'],
    output: 'rest-duration-practice-solutions.svg',
    alt: 'One four-four staff of six measures of rests matching the note durations of the exercise: half rest and two quarter rests; whole rest; quarter rest and two eighth rests then half rest; two sixteenth rests, eighth rest, half rest, quarter rest; sixteenth rest, eighth rest, sixteenth rest, quarter rest, half rest; whole rest.',
    width: 1000,
    height: 150,
    render({ VF, context }) {
      drawMeasures(VF, context, {
        x: 20, y: 40, widths: restWidths, time: '4/4', spread: 0.8,
        measures: ['r:h r:q r:q', 'r:w', 'r:q r:8 r:8 r:h', 'r:16 r:16 r:8 r:h r:q', 'r:16 r:8 r:16 r:q r:h', 'r:w'].map((text) => melody(text)),
      });
    },
  },
  {
    id: 'simultaneous-rhythms-with-rests',
    sources: ['983c61f990d02147ab4473508cb516532e871057.png'],
    output: 'simultaneous-rhythms-with-rests.svg',
    alt: 'Two examples using rests to clarify simultaneous upper and lower rhythms on a single staff.',
    width: 920,
    height: 380,
    render({ VF, context, overlay }) {
      // Two voices share each measure: upper stems up, lower stems down.
      const sixEight = [
        { upper: [{ keys: ['e/5'], duration: 'q', dots: 1 }, { keys: ['c/5'], duration: '8' }, { rest: true, duration: '8' }, { keys: ['g/5'], duration: '8' }],
          lower: ['c/4', 'e/4', 'g/4', 'c/4', 'e/4', 'g/4'] },
        { upper: [{ rest: true, duration: 'q' }, { keys: ['e/5'], duration: '8' }, { keys: ['g/5'], duration: 'q', dots: 1 }],
          lower: ['c/4', 'e/4', 'g/4', 'c/4', 'e/4', 'g/4'] },
      ];
      sixEight.forEach(({ upper, lower }, index) => {
        const stave = new VF.Stave(45 + index * 400, 70, index ? 380 : 420);
        if (index === 0) stave.addClef('treble').addTimeSignature('6/8');
        stave.setContext(context).draw();
        const upperNotes = upper.map((item) => note(VF, { ...item, stemDirection: 1 }));
        const lowerNotes = lower.map((key) => note(VF, { key, duration: '8', stemDirection: -1 }));
        const voices = [upperNotes, lowerNotes].map((notes) => new VF.Voice({ num_beats: 6, beat_value: 8 }).setStrict(false).addTickables(notes));
        new VF.Formatter().joinVoices(voices).format(voices, index ? 280 : 300);
        const beams = [[1, 2], [4, 5]].map(([from, to]) => new VF.Beam(lowerNotes.slice(from, to + 1)));
        voices.forEach((voice) => voice.setStave(stave).draw(context, stave));
        beams.forEach((beam) => beam.setContext(context).draw());
      });
      drawStave(VF, context, { x: 170, y: 260, width: 580, time: '2/4', notes: [
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
        Array.from({ length: 3 }, () => ({ key: 'g/4', duration: '8' })),
        Array.from({ length: 6 }, () => ({ key: 'g/4', duration: '16' })),
        [{ key: 'g/4', duration: 'q' }, { key: 'g/4', duration: '8' }],
        [note(VF, { key: 'g/4', duration: 'q', dots: 1 })],
        [{ key: 'g/4', duration: '8' }, { key: 'g/4', duration: '16' }, { key: 'g/4', duration: '16' }, { key: 'g/4', duration: '8' }],
      ];
      const beamGroups = [[[0, 2]], [[0, 5]], [], [], [[0, 3]]];
      groups.forEach((notes, index) => drawStave(VF, context, { x: 25 + index * 200, y: 55, width: 190, clef: index === 0 ? 'treble' : null, time: index === 0 ? '3/8' : undefined, notes, formatWidth: 100, beamGroups: beamGroups[index] }));
      [220, 420, 620, 820].forEach((x) => overlay.text('=', x, 224, { 'font-size': 18, 'text-anchor': 'middle' }));
      labelUnder(overlay, ['3 eighths', '6 sixteenths', '1 quarter\n+ 1 eighth', 'dotted quarter', '2 eighths\n+ 2 sixteenths'], 120, 200, 220, { 'data-line-height': 20 });
    },
  },
  {
    id: 'time-signature-practice-solutions',
    sources: ['08d3f79041cd4535ab484cde32f313555b39adcd.png'],
    output: 'time-signature-practice-solutions.svg',
    alt: 'Example completed measures of A notes in two-four (five measures), three-eight (five measures), and six-four (four measures) time signatures.',
    width: 1020,
    height: 560,
    render({ VF, context, overlay }) {
      const rows = [
        { y: 35, time: '2/4', widths: [273, 172, 190, 256, 96], beams: [[], [], [[0, 1]], [[0, 1], [2, 4]], []],
          measures: ['a4:q a4:q', 'a4:q. a4:8', 'a4:8 a4:8 a4:q', 'a4:8 a4:8 a4:16 a4:16 a4:8', 'a4:h'] },
        { y: 205, time: '3/8', widths: [209, 166, 182, 215, 203], beams: [[], [[0, 2]], [], [[0, 3]], []],
          measures: ['a4:q.', 'a4:8 a4:8 a4:8', 'a4:q a4:8', 'a4:16 a4:16 a4:8. a4:16', 'a4:8 a4:q'] },
        { y: 375, time: '6/4', widths: [275, 162, 269, 269], beams: [[], [], [], [[2, 3]]],
          measures: ['a4:w a4:h', 'a4:h. a4:h.', 'a4:q a4:q a4:q a4:q a4:h', 'a4:h a4:q a4:8 a4:8 a4:h'] },
      ];
      rows.forEach(({ y, time, widths, beams, measures }) => drawMeasures(VF, context, { x: 20, y, widths, time, spread: 0.8, beams, measures: measures.map((text) => melody(text)) }));
      overlay.text('These are examples; many other correct combinations are possible.', 510, 548, { 'font-size': 18, 'text-anchor': 'middle' });
    },
  },
];
