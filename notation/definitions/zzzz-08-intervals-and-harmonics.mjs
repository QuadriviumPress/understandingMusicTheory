import { arrowLine, drawIntervalRows, drawMeasures, drawStave, melody, note, noteX, placeNotes } from '../figure-helpers.mjs';

const ink = '#111';
const blue = '#1769aa';
const red = '#c62828';

function title(overlay, value, x, y, attributes = {}) {
  overlay.text(value, x, y, {
    'font-size': 17,
    'font-weight': '700',
    'text-anchor': 'middle',
    ...attributes,
  });
}

function intervalChord(VF, low, high, accidentals = []) {
  return note(VF, { keys: [low, high], duration: 'w', accidentals });
}

function pairRow(VF, context, overlay, pairs, options = {}) {
  const { y = 35, labels = [], width = 980, x = 25, clef = 'treble', labelY = y + 145 } = options;
  const cellWidth = (width - x * 2) / pairs.length;
  pairs.forEach((pair, index) => {
    const cellX = x + index * cellWidth;
    drawStave(VF, context, {
      x: cellX,
      y,
      width: cellWidth + 1,
      clef: index === 0 ? clef : null,
      notes: [intervalChord(VF, pair[0], pair[1], pair[2] ?? [])],
      formatWidth: Math.max(45, cellWidth - 45),
    });
    if (labels[index]) title(overlay, labels[index], cellX + cellWidth / 2, labelY, { 'font-size': 15, 'font-weight': '400', 'data-line-height': 18 });
  });
}

function promptRow(VF, context, overlay, prompts, options = {}) {
  const { y = 35, width = 980, x = 25, clef = 'treble', solution = false } = options;
  const cellWidth = (width - x * 2) / prompts.length;
  prompts.forEach((item, index) => {
    const cellX = x + index * cellWidth;
    const notes = solution
      ? [intervalChord(VF, item.low, item.high, item.accidentals ?? [])]
      : [note(VF, { key: item.low, duration: 'w', accidental: item.accidentals?.[0] })];
    drawStave(VF, context, { x: cellX, y, width: cellWidth + 1, clef: index === 0 ? clef : null, notes, formatWidth: Math.max(45, cellWidth - 45) });
    if (!solution) overlay.line(cellX + cellWidth * 0.62, y + 70, cellX + cellWidth * 0.82, y + 70, { stroke: '#777', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
    title(overlay, item.label, cellX + cellWidth / 2, y + 145, { 'font-size': 14, 'font-weight': '400', 'data-line-height': 17 });
  });
}

function harmonicKeys(transpose = 0) {
  const chromatic = ['c/3', 'c/4', 'g/4', 'c/5', 'e/5', 'g/5', 'bb/5', 'c/6', 'd/6', 'e/6', 'f#/6', 'g/6', 'a/6', 'bb/6', 'b/6', 'c/7'];
  const order = ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'ab', 'a', 'bb', 'b'];
  if (!transpose) return chromatic;
  return chromatic.map((key) => {
    const [pitch, octaveText] = key.split('/');
    const normalized = pitch === 'bb' ? 'bb' : pitch;
    let index = order.indexOf(normalized);
    if (index < 0) index = order.indexOf(pitch[0]);
    const shifted = index + transpose;
    return `${order[(shifted + 120) % 12]}/${Number(octaveText) + Math.floor(shifted / 12)}`;
  });
}

function notesForKeys(keys, duration = 'q') {
  return keys.map((key) => {
    const pitch = key.split('/')[0];
    const accidental = pitch.length > 1 ? (pitch.slice(1) === 'b' ? 'b' : '#') : undefined;
    return { key, duration, accidental };
  });
}

function drawHarmonicSeries(VF, context, overlay, options = {}) {
  const { x = 35, y = 35, width = 1000, transpose = 0, heading, numbers = false } = options;
  const keys = harmonicKeys(transpose);
  if (heading) overlay.text(heading, x, y - 7, { 'font-size': 15, 'font-weight': '700' });
  drawStave(VF, context, { x, y, width, clef: 'treble', notes: notesForKeys(keys, 'q'), formatWidth: width - 125 });
  if (numbers) keys.forEach((_, index) => overlay.text(String(index + 1), x + 105 + index * ((width - 155) / 15), y + 135, { 'font-size': 12, 'text-anchor': 'middle' }));
}

const classifyIntervalExercise = [
  { measures: [['a/4', 'b/4'], ['c/5', 'a/4'], ['a/4', 'e/5'], ['f/4', 'c/4']], labels: ['Major Second', 'Minor Third', 'Perfect Fifth', 'Perfect Fourth'] },
  { measures: [['d/4', 'd/5'], ['d/5', ['f/4', '#']], ['e/5', 'e/5'], [['g/4', 'b'], 'f/5']], labels: ['Perfect Octave', 'Minor Sixth', 'Unison\n(Perfect prime)', 'Major Seventh'] },
  { clef: 'bass', measures: [[['a/2', 'b'], 'f/3'], ['e/3', ['f/2', '#']], ['c/3', 'e/3'], ['b/3', 'c/4']], labels: ['Major Sixth', 'Minor Seventh', 'Major Third', 'Minor Second'] },
];

const completeIntervalExercise = [
  { measures: [[['a/4', 'b'], ['e/5', 'b']], [['f/5', '#'], ['c/5', '#']], ['d/5', ['c/5', '#']], ['g/4', 'g/4']], labels: ['P5 higher', 'P4 lower', 'm2 lower', 'Pprime'] },
  { measures: [['d/5', ['f/5', '#']], ['a/5', 'b/4'], [['b/3', 'b'], ['b/4', 'b']], ['e/4', ['c/5', '#']]], labels: ['M3 higher', 'm7 lower', 'P 8ve higher', 'M6 higher'] },
  { clef: 'bass', measures: [['e/3', ['g/2', '#']], [['f/3', '#'], ['g/3', '#']], ['f/3', ['b/2', 'b']], [['e/3', 'b'], ['g/3', 'b']]], labels: ['m6 lower', 'M2 higher', 'P5 lower', 'm3 higher'] },
];

const augmentedDiminishedExercise = [
  {
    measures: [['d/4', ['d/5', '#']], [['d/5', 'b'], ['f/4', '#']], ['c/5', ['f/5', '#']], [['a/4', 'b'], ['g/4', '#']]],
    labels: ['Augmented Octave\nHigher', 'Diminished Sixth\nLower', 'Augmented Fourth\nHigher', 'Diminished Second\nLower'],
  },
  {
    clef: 'bass',
    measures: [[['a/2', 'b'], ['a/2', 'n']], ['g/3', ['a/2', '#']], ['c/3', ['e/3', '#']], ['c/4', ['f/3', '#']]],
    labels: ['Augmented Prime\nHigher', 'Diminished Seventh\nLower', 'Augmented Third\nHigher', 'Diminished Fifth\nLower'],
  },
];

const intervalNumberExercise = {
  measures: [['f/4', 'a/4'], ['d/5', 'g/4'], ['d/4', 'd/5'], ['b/4', 'c/5'], ['g/5', 'a/4'], ['b/4', 'e/5']],
  labels: ['Third', 'Fifth', 'Octave', 'Second', 'Seventh', 'Fourth'],
};

export const definitions = [
  {
    id: 'counting-written-intervals',
    status: 'vexflow-overlay',
    sources: ['8ecdfe8f4dbf66d814697cc5b8817d42ed89f3c5.png'],
    output: 'counting-written-intervals.svg',
    alt: 'Treble-clef B to D is counted across three staff positions; bass-clef A to F is counted across six.',
    width: 373,
    height: 265,
    render({ VF, context, overlay }) {
      // Each arrow points at one staff position between the two notes; steps count from the bottom line.
      const example = ({ y, clef, low, high, steps }) => {
        const stave = new VF.Stave(0, y, 370).addClef(clef).setEndBarType(VF.BarlineType.NONE).setBegBarType(VF.BarlineType.NONE);
        stave.setContext(context).draw();
        const bottom = stave.getYForLine(4);
        const yOf = (step) => bottom - step * 5;
        [low, high].forEach(([x, step]) => overlay.text('', x, yOf(step), { 'font-family': 'Bravura', 'font-size': 40, 'text-anchor': 'middle', fill: '#111' }));
        steps.forEach(([x, step], index) => {
          arrowLine(overlay, x, yOf(step) + 48, x, yOf(step) + 3, { head: 9, 'stroke-width': 1.3 });
          overlay.text(String(index + 1), x, bottom + 58, { 'font-size': 13, 'text-anchor': 'middle' });
        });
        overlay.text('Count:', steps[0][0] - (steps.length > 3 ? 12 : 42), bottom + 58, { 'font-size': 13, 'text-anchor': 'end' });
      };
      example({ y: -13, clef: 'treble', low: [127, 4], high: [200, 6], steps: [[140, 4], [167, 5], [193, 6]] });
      example({ y: 123, clef: 'bass', low: [93, 1], high: [260, 6], steps: [[107, 1], [139, 2], [167, 3], [195, 4], [223, 5], [252, 6]] });
    },
  },
  {
    id: 'simple-intervals-prime-through-octave',
    status: 'vexflow-overlay',
    sources: ['7e50de433d0a7c1b59dacfe13036ded4a3f0adf8.png'],
    output: 'simple-intervals-prime-through-octave.svg',
    alt: 'Eight written melodic intervals above C (C followed by the upper note), labelled prime, second, third, fourth, fifth, sixth, seventh, and octave.',
    width: 960,
    height: 150,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, [{
        measures: [['c/4', 'c/4'], ['c/4', 'd/4'], ['c/4', 'e/4'], ['c/4', 'f/4'], ['c/4', 'g/4'], ['c/4', 'a/4'], ['c/4', 'b/4'], ['c/4', 'c/5']],
        labels: ['Prime', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Octave'],
      }], { widths: [170, 113, 113, 113, 113, 113, 113, 113], labelOffset: 115, labelSize: 15, y: 0 });
    },
  },
  {
    id: 'compound-intervals-ninth-and-beyond',
    status: 'vexflow-overlay',
    sources: ['0bf05d9e775798258180a99a2ffd159ebd3e4e85.png'],
    output: 'compound-intervals-ninth-and-beyond.svg',
    alt: 'Compound intervals above E: a ninth, tenth, eleventh, and twelfth.',
    width: 640,
    height: 140,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, [{
        measures: [['e/4', 'f/5'], ['e/4', 'g/5'], ['e/4', 'a/5'], ['e/4', 'b/5']],
        labels: ['Ninth', 'Tenth', 'Eleventh', 'Twelfth, and so on...'],
      }], { widths: [185, 130, 130, 135], endBar: 'single', labelOffset: 118, y: 0 });
    },
  },
  {
    id: 'interval-number-practice',
    status: 'vexflow-overlay',
    sources: ['9111533eb14a4014b873e66548bccebb32e35bc3.png'],
    output: 'interval-number-practice.svg',
    alt: 'Six intervals in treble clef for naming by number',
    width: 662,
    height: 95,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, [{ measures: intervalNumberExercise.measures }], { y: -2, widths: [160, 95, 100, 108, 100, 99], labelOffset: 104, labelSize: 15 });
    },
  },
  {
    id: 'interval-size-by-half-steps',
    status: 'vexflow-overlay',
    sources: ['76aa06be5447ea944743e35c9d5967c60607a74a.png'],
    output: 'interval-size-by-half-steps.svg',
    alt: 'Six given notes with instructions to write a second lower, octave lower, fifth higher, third higher, sixth higher, and fourth lower.',
    width: 655,
    height: 150,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, [{
        measures: ['b/4', 'f/5', 'a/4', 'd/5', 'c/4', 'a/5'].map((key) => [key, { ghost: true }]),
        labels: ['Second\nLower', 'Octave\nLower', 'Fifth\nHigher', 'Third\nHigher', 'Sixth\nHigher', 'Fourth\nLower'],
      }], { y: -6, widths: [150, 96, 104, 110, 98, 97], labelOffset: 111, labelSize: 15 });
    },
  },
  {
    id: 'perfect-interval-examples',
    status: 'vexflow-overlay',
    sources: ['2a5a43eedddcfae83e15f9507150c98a9f0597d0.png', 'd194cd10d38499052d417650f1eb6085d4e3170f.png'],
    output: 'perfect-interval-examples.svg',
    alt: 'Examples of a perfect unison, octave, fourth, and fifth written above C.',
    width: 850,
    height: 220,
    render({ VF, context, overlay }) {
      pairRow(VF, context, overlay, [['c/4', 'c/4'], ['c/4', 'c/5'], ['c/4', 'f/4'], ['c/4', 'g/4']], { width: 850, labels: ['Unison', 'Octave', 'Perfect Fourth', 'Perfect Fifth'], labelY: 190 });
    },
  },
  {
    id: 'thirds-and-fifths-with-accidentals',
    status: 'vexflow-overlay',
    sources: ['02df34c31ca1f7c64cc2059d3a8fcfc91afed439.png'],
    output: 'thirds-and-fifths-with-accidentals.svg',
    alt: 'Melodic intervals above A: A up to C (three half steps) and A up to C-sharp (four half steps) are both thirds; A up to E (seven half steps) and A up to E-flat (six half steps) are both fifths.',
    width: 520,
    height: 235,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, [
        { measures: [['a/4', 'c/5'], ['a/4', ['c/5', '#']]], labels: ['Three Half Steps = A Third', 'Four Half Steps = A different Third'] },
        { measures: [['a/4', 'e/5'], ['a/4', ['e/5', 'b']]], labels: ['Seven Half Steps = A Fifth', 'Six Half Steps = A different Fifth'] },
      ], { rowHeight: 120, labelOffset: 100, labelSize: 13, widths: [270, 250], y: 0 });
    },
  },
  {
    id: 'major-and-minor-interval-examples',
    status: 'vexflow-overlay',
    sources: ['8efa51e8939876415c455e3c0b390e66fa04da32.png'],
    output: 'major-and-minor-interval-examples.svg',
    alt: 'Minor and major seconds, thirds, sixths, and sevenths above C.',
    width: 970,
    height: 330,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, [
        { measures: [['c/4', ['d/4', 'b']], ['c/4', 'd/4'], ['c/4', ['e/4', 'b']], ['c/4', 'e/4']], labels: ['Minor Second', 'Major Second', 'Minor Third', 'Major Third'] },
        { measures: [['c/4', ['a/4', 'b']], ['c/4', 'a/4'], ['c/4', ['b/4', 'b']], ['c/4', 'b/4']], labels: ['Minor Sixth', 'Major Sixth', 'Minor Seventh', 'Major Seventh'] },
      ], { rowHeight: 165, labelOffset: 122, widths: [268, 212, 238, 232] });
    },
  },
  {
    id: 'classify-major-minor-intervals-practice',
    status: 'vexflow-overlay',
    sources: ['353ee2d79e1b6c84699e438f7286e307474a23e6.png'],
    output: 'classify-major-minor-intervals-practice.svg',
    alt: 'Twelve unlabelled intervals in two treble staves and one bass staff, for naming each interval.',
    width: 970,
    height: 560,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, classifyIntervalExercise.map(({ labels, ...row }) => row), { rowHeight: 185 });
    },
  },
  {
    id: 'classify-major-minor-intervals-solutions',
    status: 'vexflow-overlay',
    sources: ['2a98cbbce6f7ff1fa2cfe1808a9be2b7997d16df.png'],
    output: 'classify-major-minor-intervals-solutions.svg',
    alt: 'Twelve intervals labelled: major second, minor third, perfect fifth, perfect fourth, perfect octave, minor sixth, unison, major seventh, major sixth, minor seventh, major third, and minor second.',
    width: 970,
    height: 560,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, classifyIntervalExercise, { rowHeight: 185 });
    },
  },
  {
    id: 'complete-intervals-practice',
    status: 'vexflow-overlay',
    sources: ['ce803b3272dee1a6280f68545024860164005f22.png'],
    output: 'complete-intervals-practice.svg',
    alt: 'Twelve given notes with interval names such as P5 higher, for writing the second note.',
    width: 970,
    height: 510,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, completeIntervalExercise.map((row) => ({ ...row, measures: row.measures.map(([first]) => [first, { ghost: true }]) })), { rowHeight: 165, labelOffset: 122 });
    },
  },
  {
    id: 'complete-intervals-solutions',
    status: 'vexflow-overlay',
    sources: ['9812d93de8f0b4b7ae1aea556a84993acf3c1aa5.png'],
    output: 'complete-intervals-solutions.svg',
    alt: 'Answers: each given note paired with the note forming the named interval.',
    width: 970,
    height: 510,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, completeIntervalExercise, { rowHeight: 165, labelOffset: 122 });
    },
  },
  {
    id: 'augmented-diminished-interval-practice',
    status: 'vexflow-overlay',
    sources: ['fb26939cb57d2a82f63dd722d29db73845b9e3ad.png'],
    output: 'augmented-diminished-interval-practice.svg',
    alt: 'Eight given notes with named augmented or diminished intervals and blanks for writing the second note.',
    width: 970,
    height: 390,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, augmentedDiminishedExercise.map((row) => ({
        ...row, measures: row.measures.map(([first]) => [first, { ghost: true }]),
      })));
    },
  },
  {
    id: 'augmented-diminished-interval-solutions',
    status: 'vexflow-overlay',
    sources: ['563ec9e172273ad08e28a9f222aec657339cbf73.png'],
    output: 'augmented-diminished-interval-solutions.svg',
    alt: 'Completed answers for eight named augmented and diminished intervals in treble and bass clefs.',
    width: 970,
    height: 390,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, augmentedDiminishedExercise);
    },
  },
  {
    id: 'interval-inversion-motion',
    status: 'vexflow-overlay',
    sources: ['57c3afee0d3d8890000a64ea020ceeb925b9cb44.png'],
    output: 'interval-inversion-motion.svg',
    alt: 'From F, down to C is a perfect fourth and up to C is a perfect fifth; from B, down to D is a major sixth and up to D is a minor third.',
    width: 682,
    height: 140,
    render({ VF, context, overlay }) {
      drawMeasures(VF, context, { x: 0, y: -13, widths: [343, 336], endBar: 'end', measures: [[], []] });
      placeNotes(VF, context, {
        x: 0, y: -13, width: 682, clef: null, beginBar: 'none',
        items: [
          { x: 86, music: 'c4:w', extra: { color: blue } }, { x: 174, music: 'f4:w' }, { x: 257, music: 'c5:w', extra: { color: red } },
          { x: 413, music: 'd4:w', extra: { color: blue } }, { x: 498, music: 'b4:w' }, { x: 571, music: 'd5:w', extra: { color: red } },
        ],
      });
      arrowLine(overlay, 155, 62, 122, 74, { stroke: blue, 'stroke-width': 1.5 });
      arrowLine(overlay, 196, 59, 236, 47, { stroke: red, 'stroke-width': 1.5 });
      arrowLine(overlay, 478, 55, 444, 70, { stroke: blue, 'stroke-width': 1.5 });
      arrowLine(overlay, 516, 50, 557, 39, { stroke: red, 'stroke-width': 1.5 });
      const text = (value, x, y, fill = '#333') => overlay.text(value, x, y, { 'font-size': 15, fill, 'data-line-height': 20 });
      overlay.text('From F', 181, 12, { 'font-size': 15, 'text-anchor': 'middle', fill: '#333' });
      overlay.text('From B', 490, 12, { 'font-size': 15, 'text-anchor': 'middle', fill: '#333' });
      text('Down to C :\nPerfect Fourth', 44, 111, blue); text('Up to C :\nPerfect Fifth', 225, 111, red);
      text('Down to D :\nMajor Sixth', 379, 111, blue); text('Up to D :\nMinor Third', 554, 113, red);
    },
  },
  {
    id: 'interval-inversion-examples',
    status: 'vexflow-overlay',
    sources: ['d04e2c7f45f72dbbf040f2b7409342189f0ee877.png'],
    output: 'interval-inversion-examples.svg',
    alt: 'A minor seventh, D up to C, inverts to a major second, C up to D: 9 minus 7 equals 2, and minor inverts to major.',
    width: 580,
    height: 110,
    render({ VF, context, overlay }) {
      const text = (value, x, y) => overlay.text(value, x, y, { 'font-size': 14, 'text-anchor': 'middle', fill: '#333' });
      placeNotes(VF, context, { x: 0, y: -1, width: 173, beginBar: 'none', items: [{ x: 63, music: 'c5:w' }, { x: 116, music: 'd4:w' }] });
      placeNotes(VF, context, { x: 360, y: -1, width: 218, beginBar: 'none', items: [{ x: 445, music: 'c4:w' }, { x: 498, music: 'd4:w' }] });
      text('Minor Seventh', 91, 13); text('Inversion is a Major Second', 479, 13);
      text('9 - 7 = 2', 264, 54); text('Minor inverts to major', 264, 75);
    },
  },
  {
    id: 'harmonic-series-one-through-sixteen',
    status: 'vexflow-overlay',
    sources: ['d7d88dada170cabb40a5168da677a7d94fdcb92d.png'],
    output: 'harmonic-series-one-through-sixteen.svg',
    alt: 'The first sixteen harmonics of a series on C, numbered 1 through 16: C, C, G, C, E, G, B flat, C, D, E, F sharp, G, A, B flat, B, C.',
    width: 760,
    height: 190,
    render({ VF, context, overlay }) {
      const number = (value, x, y) => overlay.text(String(value), x, y, { 'font-size': 16, 'text-anchor': 'middle' });
      placeNotes(VF, context, {
        x: 0, y: 72, width: 188, clef: 'bass', beginBar: 'none',
        items: [['c2', 52], ['c3', 83], ['g3', 121], ['c4', 171]].map(([pitch, x]) => ({ x, music: `${pitch}:w` })),
      });
      [52, 83, 121, 171].forEach((x, index) => number(index + 1, x - 12, 72));
      const upper = ['e4', 'g4', 'bb4', 'c5', 'd5', 'e5', 'f#5', 'g5', 'a5', 'bb5', 'bn5', 'c6'];
      const xs = [233, 277, 321, 367, 412, 461, 515, 558, 598, 643, 697, 744];
      placeNotes(VF, context, { x: 183, y: -7, width: 577, beginBar: 'none', items: upper.map((pitch, index) => ({ x: xs[index], music: `${pitch}:w` })) });
      [233, 277, 319, 364, 412, 460, 514, 560, 600, 646, 696, 744].forEach((x, index) => number(index + 5, x, 113));
    },
  },
  {
    id: 'bugle-calls-from-harmonic-series',
    status: 'vexflow-overlay',
    sources: ['b486203049c855e0c049ef8dbd7b63b77c827f07.png'],
    output: 'bugle-calls-from-harmonic-series.svg',
    alt: 'The bugle calls Assembly and Taps, written using only the pitches G, C, E, and G of the harmonic series.',
    width: 910,
    height: 545,
    render({ VF, context, overlay }) {
      const lines = [
        { y: 10, width: 820, time: 'C', music: 'g4:8. g4:16 | c5:8. g4:16 c5:8. e5:16 c5:q c5:8. c5:16 | e5:8. c5:16 e5:8. g5:16 e5:q c5:8. e5:16' },
        { y: 125, width: 605, music: 'g5:q e5:8. c5:16 g4:q g4:8. g4:16 | c5:q c5:8. c5:16 c5:q', endBar: 'end' },
        { y: 300, width: 905, time: 'C', music: 'g4:8. g4:16 | c5:h.@ g4:8. c5:16 | e5:h.@ g4:8 c5:8 | e5:q g4:8 c5:8 e5:q g4:8 c5:8 | e5:h.@ c5:8. e5:16' },
        { y: 415, width: 655, music: 'g5:h e5:q c5:q | g4:h. g4:8. g4:16 | c5:h.@', endBar: 'end' },
      ];
      overlay.text('Assembly', 0, 26, { 'font-size': 19, 'font-weight': '700' });
      overlay.text('Taps', 0, 312, { 'font-size': 19, 'font-weight': '700' });
      lines.forEach(({ y, width, time, music, endBar }) => drawStave(VF, context, {
        x: 0, y, width, time, endBar, formatWidth: width - (time ? 105 : 80), notes: melody(music), beams: true,
      }));
    },
  },
  {
    id: 'brass-valve-harmonic-series',
    status: 'vexflow-overlay',
    sources: ['72da008accbc59a9f87e758ae9df1cca1fec2cf4.png'],
    output: 'brass-valve-harmonic-series.svg',
    alt: 'Four staves: the harmonic series on C with no valves, on B with the second valve (a half step lower), on B flat with the first valve (a whole step lower), and the middle-register notes these three series provide.',
    width: 592,
    height: 550,
    render({ VF, context, overlay }) {
      const rows = [
        ['No valves', 'c3:w c4:w g4:w c5:w e5:w g5:w bb5:w c6:w'],
        ['2nd valve: Harmonic Series one half step lower', 'b2:w b3:w f#4:w b4:w d#5:w f#5:w a5:w b5:w'],
        ['1st valve: Harmonic Series one whole step lower', 'bb2:w bb3:w f4:w bb4:w d5:w f5:w ab5:w bb5:w'],
        ['Mid-range notes available using no valve, 2nd valve alone, or 1st valve alone', 'f4:w f#4:w g4:w bb4:w bn4:w c5:w d5:w d#5:w e5:w f5:w f#5:w g5:w'],
      ];
      rows.forEach(([heading, music], index) => {
        const y = [10, 153, 287, 427][index];
        overlay.text(heading, 6, y + 14, { 'font-size': 13 });
        drawStave(VF, context, { x: 5, y: y + 10, width: index === 3 ? 587 : 530, formatWidth: index === 3 ? 480 : 440, notes: melody(music) });
      });
    },
  },
  {
    id: 'combined-valves-harmonic-series',
    status: 'vexflow-overlay',
    sources: ['74be71ab69d9e91436d322a2526bb0cfe55ddf04.png'],
    output: 'combined-valves-harmonic-series.svg',
    alt: 'The harmonic series on A, produced with the first and second valves together, and the new midrange notes E, A, and C sharp it supplies; only G sharp is still missing.',
    width: 450,
    height: 340,
    render({ VF, context, overlay }) {
      overlay.text('A', 15, 22, { 'font-size': 15, 'font-weight': '700' });
      overlay.text('Harmonic Series', 32, 22, { 'font-size': 15 });
      drawStave(VF, context, { x: 0, y: 5, width: 450, formatWidth: 330, notes: melody('a2:w a3:w e4:w a4:w c#5:w e5:w g5:w a5:w') });
      overlay.text('New midrange notes:', 5, 176, { 'font-size': 15 });
      drawStave(VF, context, { x: 0, y: 160, width: 220, formatWidth: 110, notes: melody('e4:w a4:w c#5:w') });
      overlay.text('The only midrange note still missing is the G♯,\nwhich can be played by adding a third valve, and\nholding down the second and third valves at the same time.', 10, 290, { 'font-size': 14, 'data-line-height': 21 });
    },
  },
  {
    id: 'string-harmonics-nodes',
    status: 'svg-overlay',
    sources: ['48fcee2683006bd15bb81c5f8806c034e40f7993.png'],
    output: 'string-harmonics-nodes.svg',
    alt: 'Left: an open string vibrating in its first six standing-wave modes at the same time, with nodes marked. Below: a string touched lightly at its midpoint vibrates only in modes 2, 4, and 6, which have a node there, and sounds an octave higher.',
    width: 1008,
    height: 574,
    render({ overlay }) {
      const k = 2;
      const t = (value, x, y, attributes = {}) => overlay.text(value, x * k, y * k, { 'font-size': 11 * k, 'data-line-height': 14.5 * k, ...attributes });
      // Vertical standing wave with `lobes` half-waves between y1 and y2, drawn at x, bulging by sign * amp.
      const vwave = (x, y1, y2, lobes, sign, color, dashed = false, amp = 9) => {
        let d = '';
        for (let i = 0; i <= 80; i += 1) {
          const u = i / 80;
          const px = (x + sign * amp * Math.sin(lobes * Math.PI * u)) * k;
          const py = (y1 + (y2 - y1) * u) * k;
          d += `${i ? ' L' : 'M'} ${px.toFixed(1)} ${py.toFixed(1)}`;
        }
        overlay.path(d, { fill: 'none', stroke: color, 'stroke-width': 1.6, ...(dashed ? { 'stroke-dasharray': '9 7' } : {}) });
      };
      const hline = (x1, x2, y) => overlay.line(x1 * k, y * k, x2 * k, y * k, { stroke: '#555', 'stroke-width': 1.5 });
      t('Open strings:', 0, 44, { 'font-weight': '700' });
      t('the string vibrates\nat all its harmonics\nat the same time.', 0, 58);
      hline(118, 330, 2);
      hline(118, 330, 135);
      [137, 173, 205, 237, 270, 312].forEach((x, i) => {
        vwave(x, 2, 135, i + 1, -1, ink, false, i ? 9 : 10);
        vwave(x, 2, 135, i + 1, 1, red, false, i ? 9 : 10);
      });
      t('Nodes', 347, 40);
      [[335, 30, 318, 23], [335, 43, 318, 45]].forEach(([x1, y1, x2, y2]) => {
        arrowLine(overlay, x1 * k, y1 * k, x2 * k, y2 * k, { head: 8, 'stroke-width': 1.2 });
      });
      t('The open string can vibrate\nat all these frequencies\nat the same time.', 349, 72);
      t('Harmonics', 0, 175, { 'font-weight': '700' });
      t('When a string is touched\nlightly at a certain spot,\nonly the harmonics\nthat have a node\nexactly at that spot\ncan still vibrate.', 0, 188);
      hline(118, 330, 150);
      hline(118, 330, 285);
      [[173, 1], [237, 2], [312, 3]].forEach(([x, half]) => {
        vwave(x, 150, 218, half, -1, ink, true, 8);
        vwave(x, 150, 218, half, 1, red, true, 8);
        vwave(x, 218, 285, half, -1, ink, false, 8);
        vwave(x, 218, 285, half, 1, red, false, 8);
        overlay.circle(x * k, 218 * k, 3 * k, { fill: blue });
      });
      // Crossings (nodes) in the silenced upper halves.
      [[237, 184], [312, 172], [312, 195]].forEach(([x, y]) => {
        overlay.path(`M ${(x - 5) * k} ${(y - 5) * k} L ${(x + 5) * k} ${(y + 5) * k} M ${(x + 5) * k} ${(y - 5) * k} L ${(x - 5) * k} ${(y + 5) * k}`, { stroke: ink, 'stroke-width': 1.2 });
      });
      t('A string that is touched lightly\nexactly at its midpoint\ncan only vibrate at the\nfrequencies that have\na node there. So it will\nhave a "thinner" sound than\nthe open string. It will also\nsound one octave higher\nthan the open string.', 352, 168);
    },
  },
];
