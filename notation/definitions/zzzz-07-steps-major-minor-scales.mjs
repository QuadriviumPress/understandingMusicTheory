import { drawIntervalRows, drawKeyboard, drawMeasures, drawPiano, drawStave, labelUnder, melody, note, noteX, placeNotes } from '../figure-helpers.mjs';

const RED = '#d32f2f';
const BLUE = '#1565c0';

function pitch(key, accidental, duration = 'w') {
  return accidental ? { key, duration, accidental } : { key, duration };
}

function scale(keys, accidentals = {}, duration = 'w') {
  return keys.map((key, index) => pitch(key, accidentals[index], duration));
}

// Ascending-then-descending A minor forms, written as in the source figures.
const aMinorUp = ['a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5'];
const aMinorDown = ['g/5', 'f/5', 'e/5', 'd/5', 'c/5', 'b/4', 'a/4'];
const aMinorForms = {
  natural: ['A Natural Minor', {}, {}],
  harmonic: ['A Harmonic Minor', { 6: '#' }, { 0: '(#)' }],
  melodic: ['A Melodic Minor', { 5: '#', 6: '#' }, { 0: 'n', 1: 'n' }],
  dorian: ['A Dorian Minor', { 5: '#' }, { 1: '(#)' }],
};

// Stacked staves, each with a title above it, written with the melody syntax.
function drawTitledRows(VF, context, overlay, rows, { width = 900, rowHeight = 130, titleSize = 18, top = 0 } = {}) {
  rows.forEach(({ title, music, key, clef = 'treble', time, beams }, index) => {
    const y = top + index * rowHeight;
    if (title) overlay.text(title, 4, y + 24, { 'font-size': titleSize });
    drawStave(VF, context, {
      x: 0, y: y + 6, width, clef, key, time, notes: melody(music), beams, formatWidth: width - 130,
    });
  });
}

function drawAMinorForms(VF, context, overlay, forms) {
  forms.forEach((form, index) => {
    const [title, up, down] = aMinorForms[form];
    const y = 8 + index * 162;
    overlay.text(title, 12, y + 22, { 'font-size': 19 });
    drawStave(VF, context, {
      x: 10, y: y + 22, width: 955,
      notes: [...scale(aMinorUp, up, 'q'), ...scale(aMinorDown, down, 'q')],
      formatWidth: 830,
    });
  });
}

function annotationArc(overlay, x1, x2, y, label, color = RED) {
  overlay.path(`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + 18} ${x2} ${y}`, {
    fill: 'none', stroke: color, 'stroke-width': 2,
  });
  if (label) overlay.text(label, (x1 + x2) / 2, y + 34, {
    fill: color, 'font-size': 14, 'text-anchor': 'middle',
  });
}

function drawPatternScale(VF, context, overlay, { y, clef = 'treble', notes, labels }) {
  drawStave(VF, context, { x: 30, y, width: 790, clef, notes, formatWidth: 650 });
  labelUnder(overlay, labels, 170, 82, y + 125, { 'font-size': 14, 'data-line-height': 17 });
  for (let i = 0; i < 7; i += 1) annotationArc(overlay, 139 + i * 82, 177 + i * 82, y + 83, '');
}

function drawScaleRow(VF, context, overlay, { y, title, clef = 'treble', notes, width = 720 }) {
  if (title) overlay.text(title, 22, y + 2, { 'font-size': 16 });
  drawStave(VF, context, { x: 65, y: y + 6, width, clef, notes, formatWidth: width - 125 });
}

// Scale-writing solution pages: numbered titles over staves of quarter notes.
function drawScaleSolutions(VF, context, overlay, rows, { width = 424, x = 58, spacing = 95 } = {}) {
  rows.forEach(({ title, clef = 'treble', music }, index) => {
    const top = index * spacing;
    overlay.text(title, 0, top + 30, { 'font-size': 17, fill: '#222' });
    drawStave(VF, context, { x, y: top + 10, width, clef, beginBar: 'none', endBar: 'none', formatWidth: width - 100, notes: melody(music) });
  });
}

function drawScaleWorksheet(VF, context, overlay, rows) {
  rows.forEach((row, index) => drawScaleRow(VF, context, overlay, { y: 22 + index * 126, ...row }));
}

function drawStartingNotes(VF, context, overlay, rows, columns = 4) {
  const cellWidth = 190;
  rows.forEach((row, index) => {
    const column = index % columns;
    const line = Math.floor(index / columns);
    const x = 25 + column * cellWidth;
    const y = 28 + line * 155;
    overlay.text(`${index + 1}.`, x, y + 5, { 'font-size': 16 });
    drawStave(VF, context, {
      x: x + 25, y: y + 8, width: 135, clef: row.clef ?? 'treble', notes: [row.note], formatWidth: 45,
    });
  });
}

function drawIntervalMeasures(VF, context, overlay, rows, showAnswers) {
  const labels = [
    ['3 half steps', '(1\u00bd steps)'], ['4 half steps', '(2 whole steps)'], ['8 half steps', '(4 whole steps)'], ['7 half steps', '(3\u00bd steps)'],
    ['5 half steps', '(2\u00bd steps)'], ['6 half steps', '(3 whole steps)'], ['7 half steps', '(3\u00bd whole steps)'], ['9 half steps', '(4\u00bd steps)'],
  ];
  rows.forEach((measures, rowIndex) => {
    const y = 30 + rowIndex * 210;
    measures.forEach((notes, measureIndex) => drawStave(VF, context, {
      x: 28 + measureIndex * 220, y, width: 220,
      clef: measureIndex === 0 ? (rowIndex === 0 ? 'treble' : 'bass') : null,
      time: measureIndex === 0 ? '4/4' : undefined,
      notes, formatWidth: measureIndex === 0 ? 95 : 130,
    }));
    if (showAnswers) measures.forEach((_, measureIndex) => {
      const answer = labels[rowIndex * 4 + measureIndex];
      overlay.text(`${answer[0]}\n${answer[1]}`, 138 + measureIndex * 220, y + 128, {
        'font-size': 15, 'text-anchor': 'middle', 'data-line-height': 19,
      });
    });
  });
}

function drawIntervalCompletion(VF, context, overlay, answers) {
  const rows = [
    { clef: 'treble', starts: [pitch('c/4'), pitch('c/5'), pitch('e/4'), pitch('b/4')], ends: [pitch('f/4'), pitch('b/4', 'b'), pitch('c/4'), pitch('d/4')] },
    { clef: 'treble', starts: [pitch('b/3', 'b'), pitch('c/5'), pitch('c/4'), pitch('b/4')], ends: [pitch('c/4', 'b'), pitch('b/4', 'b'), pitch('d/4', '#'), pitch('c/4')] },
    { clef: 'bass', starts: [pitch('d/3'), pitch('c/4'), pitch('e/3', 'b'), pitch('c/4')], ends: [pitch('a/3', '#'), pitch('a/3'), pitch('e/3'), pitch('d/3')] },
  ];
  const captions = [
    ['5 half steps higher', '1 whole step lower', '2 whole steps lower', '9 half steps lower'],
    ['1 whole step higher', '1 half step lower', '2 whole steps higher', '11 half steps lower'],
    ['3 whole steps higher', '3 half steps lower', '1 half step higher', '7 half steps lower'],
  ];
  rows.forEach((row, rowIndex) => {
    const y = 22 + rowIndex * 185;
    row.starts.forEach((start, measureIndex) => drawStave(VF, context, {
      x: 22 + measureIndex * 235, y, width: 235,
      clef: measureIndex === 0 ? row.clef : null,
      time: measureIndex === 0 ? '4/4' : undefined,
      notes: answers ? [start, row.ends[measureIndex]] : [start],
      formatWidth: measureIndex === 0 ? 110 : 145,
    }));
    labelUnder(overlay, captions[rowIndex], 140, 235, y + 125, { 'font-size': 14 });
  });
}

function drawMinorPatternDiagram(overlay) {
  overlay.text('Minor Scale Pattern:', 35, 40, { 'font-size': 19 });
  labelUnder(overlay, ['W', 'H', 'W', 'W', 'H', 'W', 'W'], 290, 66, 40, { 'font-size': 19 });
  overlay.text('Major Scale Pattern:', 35, 98, { 'font-size': 19 });
  labelUnder(overlay, ['W', 'W', 'H', 'W', 'W', 'W', 'H'], 356, 66, 98, { 'font-size': 19 });
  annotationArc(overlay, 273, 373, 48, '');
  annotationArc(overlay, 672, 768, 106, '');
  overlay.path('M 270 87 Q 245 115 295 124 Q 500 168 690 112', {
    fill: 'none', stroke: RED, 'stroke-width': 2, 'marker-end': 'url(#arrow)',
  });
  overlay.text('W = Whole\nStep', 85, 164, { 'font-size': 17, 'text-anchor': 'middle', 'data-line-height': 19 });
  overlay.text('H = Half\nStep', 210, 164, { 'font-size': 17, 'text-anchor': 'middle', 'data-line-height': 19 });
}

function drawTune(VF, context, overlay, { key, lines }) {
  // Each line is [measure, ...]; bars are single, with a double bar after the second measure and at the end of line 1.
  lines.forEach((measures, index) => {
    const y = 30 + index * 175;
    const notes = [];
    const firstNotes = [];
    measures.forEach((measure, m) => {
      firstNotes.push(notes.length);
      notes.push(...measure);
      if (m < measures.length - 1) notes.push({ bar: m === 1 ? 'double' : 'single' });
    });
    const result = drawStave(VF, context, {
      x: 30, y, width: 920, clef: 'treble', key, time: index === 0 ? '6/8' : undefined,
      notes, formatWidth: 755, beams: { groups: [new VF.Fraction(3, 8)] }, endBar: index === 0 ? 'double' : 'end',
    });
    [0, 2].forEach((measure, n) => overlay.text(String(index * 2 + n + 1), noteX(result.notes[firstNotes[measure]]) - 6, y - 2, {
      'font-size': 16, 'font-weight': '700', 'text-anchor': 'middle',
    }));
    return result;
  });
}

const majorWorksheetRows = [
  { title: '1. C major', notes: scale(['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5']) },
  { title: '2. G major', notes: scale(['g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5'], { 6: '#' }) },
  { title: '3. B flat major', notes: scale(['b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4'], { 0: 'b', 3: 'b', 7: 'b' }) },
  { title: '4. C sharp major', notes: scale(['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5'], { 0: '#', 1: '#', 2: '#', 3: '#', 4: '#', 5: '#', 6: '#', 7: '#' }) },
  { title: '5. F sharp major', notes: scale(['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5'], { 0: '#', 1: '#', 2: '#', 4: '#', 5: '#', 6: '#', 7: '#' }) },
  { title: '6. G flat major', notes: scale(['g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5'], { 0: 'b', 1: 'b', 2: 'b', 3: 'b', 4: 'b', 5: 'b', 7: 'b' }) },
  { title: '7. D major', clef: 'bass', notes: scale(['d/2', 'e/2', 'f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3'], { 2: '#', 6: '#' }) },
  { title: '8. D flat major', clef: 'bass', notes: scale(['d/2', 'e/2', 'f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3'], { 0: 'b', 1: 'b', 3: 'b', 4: 'b', 5: 'b', 7: 'b' }) },
];

const naturalMinorRows = [
  { title: '1. A minor', notes: scale(['a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5']) },
  { title: '2. G minor', notes: scale(['g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5'], { 2: 'b', 5: 'b' }) },
  { title: '3. B flat minor', notes: scale(['b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4'], { 0: 'b', 2: 'b', 3: 'b', 5: 'b', 6: 'b', 7: 'b' }) },
  { title: '4. E minor', notes: scale(['e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5'], { 1: '#' }) },
  { title: '5. F minor', clef: 'bass', notes: scale(['f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3'], { 2: 'b', 3: 'b', 5: 'b', 6: 'b' }) },
  { title: '6. F sharp minor', clef: 'bass', notes: scale(['f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3'], { 0: '#', 1: '#', 4: '#', 7: '#' }) },
];

const harmonicMinorRows = [
  { ...naturalMinorRows[0], title: '1. A harmonic minor', notes: scale(['a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5'], { 6: '#' }) },
  { ...naturalMinorRows[1], title: '2. G harmonic minor', notes: scale(['g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5'], { 2: 'b', 5: 'b', 6: '#' }) },
  { ...naturalMinorRows[2], title: '3. B flat harmonic minor', notes: scale(['b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4'], { 0: 'b', 2: 'b', 3: 'b', 5: 'b', 7: 'b' }) },
  { ...naturalMinorRows[3], title: '4. E harmonic minor', notes: scale(['e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5'], { 1: '#', 6: '#' }) },
  { ...naturalMinorRows[4], title: '5. F harmonic minor', notes: scale(['f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3'], { 2: 'b', 3: 'b', 5: 'b', 7: 'b' }) },
  { ...naturalMinorRows[5], title: '6. F sharp harmonic minor', notes: scale(['f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3'], { 0: '#', 1: '#', 4: '#', 6: '#', 7: '#' }) },
];

function melodicMinorRow(title, clef, ascending, descending, upAccidentals, downAccidentals) {
  return { title, clef, notes: [...scale(ascending, upAccidentals), ...scale(descending, downAccidentals)] };
}

const melodicMinorRows = [
  melodicMinorRow('1. A melodic minor', 'treble', ['a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5'], ['g/5', 'f/5', 'e/5', 'd/5', 'c/5', 'b/4', 'a/4'], { 5: '#', 6: '#' }, { 0: 'n', 1: 'n' }),
  melodicMinorRow('2. G melodic minor', 'treble', ['g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5'], ['f/5', 'e/5', 'd/5', 'c/5', 'b/4', 'a/4', 'g/4'], { 2: 'b', 6: '#' }, { 0: 'n', 1: 'b', 4: 'b' }),
  melodicMinorRow('3. B flat melodic minor', 'treble', ['b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4'], ['a/4', 'g/4', 'f/4', 'e/4', 'd/4', 'c/4', 'b/3'], { 0: 'b', 2: 'b', 3: 'b', 7: 'b' }, { 0: 'b', 1: 'b', 3: 'b', 4: 'b', 6: 'b' }),
  melodicMinorRow('4. E melodic minor', 'treble', ['e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5'], ['d/5', 'c/5', 'b/4', 'a/4', 'g/4', 'f/4', 'e/4'], { 1: '#', 5: '#', 6: '#' }, { 0: 'n', 1: 'n', 5: '#' }),
  melodicMinorRow('5. F melodic minor', 'bass', ['f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3'], ['e/3', 'd/3', 'c/3', 'b/2', 'a/2', 'g/2', 'f/2'], { 2: 'b', 3: 'b', 7: 'b' }, { 0: 'b', 1: 'b', 3: 'b', 4: 'b' }),
  melodicMinorRow('6. F sharp melodic minor', 'bass', ['f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3'], ['e/3', 'd/3', 'c/3', 'b/2', 'a/2', 'g/2', 'f/2'], { 0: '#', 1: '#', 4: '#', 5: '#', 6: '#', 7: '#' }, { 0: 'n', 1: 'n', 2: '#', 4: '#', 5: '#', 6: '#' }),
];

const identifyStepExercise = [
  { measures: [['d/4', 'f/4'], ['b/4', 'g/4'], ['c/4', ['g/4', '#']], [['e/5', 'b'], ['a/4', 'b']]], labels: ['3 half steps\n(1½ steps)', '4 half steps\n(2 whole steps)', '8 half steps\n(4 whole steps)', '7 half steps\n(3½ steps)'] },
  { clef: 'bass', measures: [['f/2', ['b/2', 'b']], ['b/3', 'f/3'], ['b/2', ['f/3', '#']], ['a/3', 'c/3']], labels: ['5 half steps\n(2½ steps)', '6 half steps\n(3 whole steps)', '7 half steps\n(3½ whole steps)', '9 half steps\n(4½ steps)'] },
];

const intervalStepExercise = [
  { measures: [['d/4', 'g/4'], ['c/5', ['b/4', 'b']], ['g/4', ['e/4', 'b']], ['a/4', 'c/4']], labels: ['5 half steps higher', '1 whole step lower', '2 whole steps lower', '9 half steps lower'] },
  { measures: [[['d/4', 'b'], ['e/4', 'b']], ['d/5', ['d/5', 'b'], ['c/5', '(#)']], ['e/4', ['g/4', '#']], ['b/4', 'c/4']], labels: ['1 whole step higher', '1 half step lower', '2 whole steps higher', '11 half steps lower'] },
  { clef: 'bass', measures: [['g/2', ['c/3', '#']], ['g/3', 'e/3'], [['c/3', 'b'], ['c/3', 'n']], ['e/3', 'a/2']], labels: ['3 whole steps higher', '3 half steps lower', '1 half step higher', '7 half steps lower'] },
];

// Seven-key keyboard (C to B) with windows cut into chosen black keys, as in the
// half-step and whole-step figures. `windows` maps black-key index to label.
function drawStepKeyboard(overlay, { labels, windows }) {
  const { white, black } = drawPiano(overlay, { x: 2, y: 0, whiteWidth: 41.6, whiteHeight: 325, blackWidth: 30, blackHeight: 192, letters: false, stroke: 4 });
  Object.entries(labels).forEach(([index, letter]) => overlay.text(letter, white[index], 294, { 'font-size': 17, 'text-anchor': 'middle', fill: '#333' }));
  Object.entries(windows).forEach(([index, letter]) => {
    overlay.path(`M ${black[index] - 16} 140 H ${black[index] + 16} V 175 H ${black[index] - 16} Z`, { fill: 'white', stroke: 'none' });
    overlay.text(letter, black[index], 166, { 'font-size': 17, 'text-anchor': 'middle', fill: '#333' });
  });
  return { white, black };
}

export const definitions = [
  {
    id: 'keyboard-half-step-examples',
    sources: ['d82a33357abdd647d475688799c560541ab4b976.png'],
    output: 'keyboard-half-step-examples.svg',
    status: 'svg-overlay',
    alt: 'Piano keyboard showing the half steps C to C sharp, E to F, and A to G sharp.',
    width: 300, height: 330,
    render({ overlay }) {
      drawStepKeyboard(overlay, { labels: { 0: 'C', 2: 'E', 3: 'F', 5: 'A' }, windows: { 0: 'C♯', 4: 'G♯' } });
      overlay.path('M 18 268 Q 4 210 30 158', { fill: 'none', stroke: RED, 'stroke-width': 2.2 });
      overlay.path('M 103 268 Q 125 250 148 268', { fill: 'none', stroke: RED, 'stroke-width': 2.2 });
      overlay.path('M 234 270 Q 244 210 222 160', { fill: 'none', stroke: RED, 'stroke-width': 2.2 });
    },
  },
  {
    id: 'staff-half-step-examples',
    sources: ['907a8fec9ebfdb3172252721a649c0f828e8dc95.png'],
    output: 'staff-half-step-examples.svg', status: 'vexflow-overlay',
    alt: 'Three notated half-step intervals: C to C sharp, E to F, and G sharp to A.',
    width: 900, height: 210,
    render({ VF, context, overlay }) {
      const pairs = [[pitch('c/4'), pitch('c/4', '#')], [pitch('e/4'), pitch('f/4')], [pitch('g/4', '#'), pitch('a/4')]];
      pairs.forEach((notes, index) => drawStave(VF, context, { x: 30 + index * 285, y: 35, width: 285, clef: index ? null : 'treble', time: index ? undefined : '8/4', notes, formatWidth: index ? 175 : 125 }));
      labelUnder(overlay, ['C\u2013C\u266f', 'E\u2013F', 'G\u266f\u2013A'], 165, 285, 175, { 'font-size': 16 });
    },
  },
  {
    id: 'ascending-chromatic-scale',
    sources: ['5fc8361206735d496da5e05f44513098a36d8b3f.png'],
    output: 'ascending-chromatic-scale.svg', status: 'vexflow-overlay',
    alt: 'Ascending chromatic scale from C to C, with every interval a half step.',
    width: 640, height: 130,
    render({ VF, context }) {
      drawStave(VF, context, {
        x: 0, y: 0, width: 640, formatWidth: 540,
        notes: scale(['c/4', 'c/4', 'd/4', 'd/4', 'e/4', 'f/4', 'f/4', 'g/4', 'g/4', 'a/4', 'a/4', 'b/4', 'c/5'], { 1: '#', 3: '#', 6: '#', 8: '#', 10: '#' }, 'q'),
      });
    },
  },
  {
    id: 'keyboard-whole-step-examples',
    sources: ['c052d75a73aff6b5e19b0f59781c5dfc6a342b8a.png'],
    output: 'keyboard-whole-step-examples.svg', status: 'svg-overlay',
    alt: 'Piano keyboard showing the whole steps C to D, E to F sharp, and G sharp to A sharp.',
    width: 300, height: 330,
    render({ overlay }) {
      drawStepKeyboard(overlay, { labels: { 0: 'C', 1: 'D', 2: 'E' }, windows: { 3: 'F♯', 4: 'G♯', 5: 'A♯' } });
      overlay.path('M 22 268 Q 45 250 67 268', { fill: 'none', stroke: RED, 'stroke-width': 2.2 });
      overlay.path('M 107 252 Q 118 190 152 153', { fill: 'none', stroke: RED, 'stroke-width': 2.2 });
      overlay.path('M 200 143 Q 222 128 245 143', { fill: 'none', stroke: RED, 'stroke-width': 2.2 });
    },
  },
  {
    id: 'staff-whole-step-examples',
    sources: ['67efd497927b2a2a0fb20a89f8078e2d7465faf9.png'],
    output: 'staff-whole-step-examples.svg', status: 'vexflow-overlay',
    alt: 'Three notated whole-step intervals: C to D, E to F sharp, and G sharp to A sharp.',
    width: 900, height: 210,
    render({ VF, context, overlay }) {
      const pairs = [[pitch('c/4'), pitch('d/4')], [pitch('e/4'), pitch('f/4', '#')], [pitch('g/4', '#'), pitch('a/4', '#')]];
      pairs.forEach((notes, index) => drawStave(VF, context, { x: 30 + index * 285, y: 35, width: 285, clef: index ? null : 'treble', time: index ? undefined : '8/4', notes, formatWidth: index ? 175 : 125 }));
      labelUnder(overlay, ['C\u2013D', 'E\u2013F\u266f', 'G\u266f\u2013A\u266f'], 165, 285, 175, { 'font-size': 16 });
    },
  },
  {
    id: 'ascending-whole-tone-scale',
    sources: ['f5abaf8d7b97faf6bf1cdfc22af3397be9807f33.png'],
    output: 'ascending-whole-tone-scale.svg', status: 'vexflow-overlay',
    alt: 'Ascending whole-tone scale from C to C using only whole steps.',
    width: 480, height: 130,
    render({ VF, context }) {
      drawStave(VF, context, {
        x: 0, y: 0, width: 480, formatWidth: 380,
        notes: scale(['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'c/5'], { 3: '#', 4: '#', 5: '#' }, 'q'),
      });
    },
  },
  {
    id: 'five-half-steps-c-to-f',
    sources: ['a377eac1f99e6e98dbe1d2c0947a7626c7386da0.png'],
    output: 'five-half-steps-c-to-f.svg', status: 'vexflow-overlay',
    alt: 'Chromatic notes from C to F, with red arcs numbering the five half steps between them.',
    width: 450,
    height: 135,
    render({ VF, context, overlay }) {
      const { notes } = drawStave(VF, context, { x: 0, y: -10, width: 450, formatWidth: 280, endBar: 'none', notes: melody('c4:w c#4:w d4:w d#4:w e4:w f4:w') });
      for (let i = 0; i < 5; i += 1) {
        const [x1, x2] = [noteX(notes[i]) + 4, noteX(notes[i + 1]) - 4];
        overlay.path(`M ${x1} 96 Q ${(x1 + x2) / 2} 108 ${x2} 96`, { fill: 'none', stroke: RED, 'stroke-width': 2 });
        overlay.text(String(i + 1), (x1 + x2) / 2, 128, { fill: RED, 'font-size': 14, 'text-anchor': 'middle' });
      }
    },
  },
  {
    id: 'identify-intervals-in-steps-practice',
    sources: ['accff92080af0b6693ce2be1cd6200a6dfcb4c3e.png'],
    output: 'identify-intervals-in-steps-practice.svg', status: 'vexflow-overlay',
    alt: 'Eight intervals in treble and bass clef for identifying the number of half steps and whole steps in each',
    width: 970,
    height: 360,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, identifyStepExercise.map(({ labels, ...row }) => row), { rowHeight: 190, labelOffset: 125 });
    },
  },
  {
    id: 'identify-intervals-in-steps-solutions',
    sources: ['00f13232da90fddc8e6cd6c5bf22411c54ba182f.png'],
    output: 'identify-intervals-in-steps-solutions.svg', status: 'vexflow-overlay',
    alt: 'Eight intervals in treble and bass clef, each labelled with its size in half steps and whole steps',
    width: 970,
    height: 395,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, identifyStepExercise, { rowHeight: 200, labelOffset: 125 });
    },
  },
  {
    id: 'complete-intervals-in-steps-practice',
    status: 'vexflow-overlay',
    sources: ['ed35597f1a11d4911bcffeb59b94b7aa1357cfd1.png'],
    output: 'complete-intervals-in-steps-practice.svg',
    alt: 'Twelve given notes with instructions such as five half steps higher, for writing a second note.',
    width: 970,
    height: 510,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, intervalStepExercise.map((row) => ({ ...row, measures: row.measures.map(([first]) => [first, { ghost: true }]) })), { rowHeight: 165, labelOffset: 122 });
    },
  },
  {
    id: 'complete-intervals-in-steps-solutions',
    status: 'vexflow-overlay',
    sources: ['e1166e2deee2765a28a25c97f18b7751aa6c4174.png'],
    output: 'complete-intervals-in-steps-solutions.svg',
    alt: 'Answers: each given note paired with the note the stated number of half or whole steps away.',
    width: 970,
    height: 510,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, intervalStepExercise, { rowHeight: 165, labelOffset: 122 });
    },
  },
  {
    id: 'major-scale-step-pattern-examples',
    sources: ['31c995861b2dffd208346e79492b348278fc3c21.png'],
    output: 'major-scale-step-pattern-examples.svg', status: 'vexflow-overlay',
    alt: 'C major, D major, and B flat major scales, each following the pattern whole, whole, half, whole, whole, whole, half.',
    width: 572,
    height: 300,
    render({ VF, context, overlay }) {
      const pattern = ['W', 'W', 'H', 'W', 'W', 'W', 'H'];
      const vee = (x, y) => overlay.path(`M ${x - 9} ${y - 5} L ${x} ${y + 5} L ${x + 9} ${y - 5}`, { fill: 'none', stroke: RED, 'stroke-width': 1.6 });
      [
        { y: -19, clef: 'treble', music: 'c4 d4 e4 f4 g4 a4 b4 c5', veeY: 76, words: true },
        { y: 103, clef: 'treble', music: 'd4 e4 f#4 g4 a4 b4 c#5 d5', veeY: 197, words: false },
        { y: 213, clef: 'bass', music: 'bb2 c3 d3 eb3 f3 g3 a3 bb3' },
      ].forEach(({ y, clef, music, veeY, words }) => {
        const { notes } = drawStave(VF, context, { x: 0, y, width: 572, clef, beginBar: 'none', endBar: 'none', formatWidth: 460, notes: melody(music) });
        if (!veeY) return;
        pattern.forEach((step, index) => {
          const x = (noteX(notes[index]) + noteX(notes[index + 1])) / 2 + 10;
          vee(x, veeY);
          const text = words ? `${step === 'W' ? 'Whole' : 'Half'}\nStep` : step;
          overlay.text(text, x, veeY + 26, { 'font-size': 15, 'text-anchor': 'middle', 'data-line-height': 20, fill: '#333' });
        });
      });
    },
  },
  {
    id: 'major-scale-starting-notes-practice',
    sources: ['5fe66d86c6389d14990425c15ae7fb3b3a57697a.png'],
    output: 'major-scale-starting-notes-practice.svg', status: 'vexflow-overlay',
    alt: 'Eight numbered staves each giving the first note of a major scale to write: F, G, A flat, B, F sharp, G flat, and in bass clef A and C flat.',
    width: 461,
    height: 180,
    render({ VF, context, overlay }) {
      [
        [0, -19, 'treble', 'f4', 49], [127, -19, 'treble', 'g4', 180], [249, -19, 'treble', 'ab4', 307], [369, -19, 'treble', 'b3', 424],
        [2, 72, 'treble', 'f#4', 62], [129, 72, 'treble', 'gb4', 187], [252, 72, 'bass', 'a2', 296], [371, 72, 'bass', 'cb3', 429],
      ].forEach(([x, y, clef, pitch, noteX], index) => {
        placeNotes(VF, context, { x, y, width: 91, clef, beginBar: 'none', items: [{ x: noteX, music: `${pitch}:q` }] });
        overlay.text(`${index + 1}.`, x, y + 29, { 'font-size': 11 });
      });
    },
  },
  {
    id: 'major-scale-writing-solutions',
    sources: ['33960a69fd3a1c138c9f46079f7a2c93120c758b.png'],
    output: 'major-scale-writing-solutions.svg', status: 'vexflow-overlay',
    alt: 'Ascending F, G, A flat, B, F sharp, and G flat major scales in treble clef and A and C flat major scales in bass clef.',
    width: 455, height: 710,
    render({ VF, context, overlay }) {
      [
        ['treble', 'f4 g4 a4 bb4 c5 d5 e5 f5'], ['treble', 'g4 a4 b4 c5 d5 e5 f#5 g5'], ['treble', 'ab4 bb4 c5 db5 eb5 f5 g5 ab5'],
        ['treble', 'b3 c#4 d#4 e4 f#4 g#4 a#4 b4'], ['treble', 'f#4 g#4 a#4 b4 c#5 d#5 e#5 f#5'], ['treble', 'gb4 ab4 bb4 cb5 db5 eb5 f5 gb5'],
        ['bass', 'a2 b2 c#3 d3 e3 f#3 g#3 a3'], ['bass', 'cb3 db3 eb3 fb3 gb3 ab3 bb3 cb4'],
      ].forEach(([clef, music], index) => {
        const y = index * 88;
        overlay.text(`${index + 1}.`, 4, y + 20, { 'font-size': 12 });
        drawStave(VF, context, { x: 5, y: y - 8, width: 450, clef, beginBar: 'none', endBar: 'none', formatWidth: 345, notes: melody(music) });
      });
    },
  },
  {
    id: 'enharmonic-f-sharp-g-flat-major-keyboard',
    sources: ['f01bba67e1e7c2db689d526b14cff7a4a3ff2731.png'],
    output: 'enharmonic-f-sharp-g-flat-major-keyboard.svg', status: 'svg-overlay',
    alt: 'Piano keyboard labeling the same keys with the enharmonic spellings of F sharp major (red) and G flat major (blue).',
    width: 450, height: 332,
    render({ overlay }) {
      const { white, black } = drawPiano(overlay, { x: 5, y: 2, start: 'F', count: 11, whiteWidth: 40, whiteHeight: 325, blackWidth: 30, blackHeight: 190, letters: false, stroke: 5 });
      // Each labelled black key has a white window with the sharp name over the flat name.
      const pair = (x, top, sharp, flat) => {
        overlay.text(sharp, x - 2, top + 22, { fill: RED, 'font-size': 16, 'text-anchor': 'middle' });
        overlay.line(x - 18, top + 42, x + 18, top + 26, { stroke: '#111', 'stroke-width': 1.5 });
        overlay.text(flat, x + 2, top + 49, { fill: BLUE, 'font-size': 16, 'text-anchor': 'middle' });
      };
      [[0, 'F♯', 'G♭'], [1, 'G♯', 'A♭'], [2, 'A♯', 'B♭'], [4, 'C♯', 'D♭'], [5, 'D♯', 'E♭'], [7, 'F♯', 'G♭']].forEach(([index, sharp, flat]) => {
        overlay.path(`M ${black[index] - 15} 85 H ${black[index] + 15} V 150 H ${black[index] - 15} Z`, { fill: 'white', stroke: 'none' });
        pair(black[index], 88, sharp, flat);
      });
      pair(white[3] - 5, 200, 'B', 'C♭');
      pair(white[7] - 12, 200, 'E♯', 'F');
    },
  },
  {
    id: 'row-row-row-your-boat-g-major',
    sources: ['69649de4d01e03b1a54bb17cfdf8d9c209999c25.png'],
    output: 'row-row-row-your-boat-g-major.svg', status: 'vexflow-overlay',
    alt: 'Row, Row, Row Your Boat notated in G major on two six-eight staves.',
    width: 980, height: 365,
    render({ VF, context, overlay }) {
      const dq = (key) => note(VF, { key, dots: 1 });
      const e = (key) => ({ key, duration: '8' });
      drawTune(VF, context, overlay, { key: 'G', lines: [
        [[dq('g/4'), dq('g/4')], [{ key: 'g/4' }, e('a/4'), dq('b/4')], [{ key: 'b/4' }, e('a/4'), { key: 'b/4' }, e('c/5')], [note(VF, { key: 'd/5', duration: 'h', dots: 1 })]],
        [['g/5', 'g/5', 'g/5', 'd/5', 'd/5', 'd/5'].map(e), ['b/4', 'b/4', 'b/4', 'g/4', 'g/4', 'g/4'].map(e), [{ key: 'd/5' }, e('c/5'), { key: 'b/4' }, e('a/4')], [note(VF, { key: 'g/4', duration: 'h', dots: 1 })]],
      ] });
    },
  },
  {
    id: 'row-row-row-your-boat-d-major',
    sources: ['a94f0c85403290b9f224235520bb523cac694b58.png'],
    output: 'row-row-row-your-boat-d-major.svg', status: 'vexflow-overlay',
    alt: 'Row, Row, Row Your Boat transposed to D major on two six-eight staves.',
    width: 980, height: 365,
    render({ VF, context, overlay }) {
      const dq = (key) => note(VF, { key, dots: 1 });
      const e = (key) => ({ key, duration: '8' });
      drawTune(VF, context, overlay, { key: 'D', lines: [
        [[dq('d/4'), dq('d/4')], [{ key: 'd/4' }, e('e/4'), dq('f/4')], [{ key: 'f/4' }, e('e/4'), { key: 'f/4' }, e('g/4')], [note(VF, { key: 'a/4', duration: 'h', dots: 1 })]],
        [['d/5', 'd/5', 'd/5', 'a/4', 'a/4', 'a/4'].map(e), ['f/4', 'f/4', 'f/4', 'd/4', 'd/4', 'd/4'].map(e), [{ key: 'a/4' }, e('g/4'), { key: 'f/4' }, e('e/4')], [note(VF, { key: 'd/4', duration: 'h', dots: 1 })]],
      ] });
    },
  },
  {
    id: 'natural-minor-scale-step-pattern-examples',
    sources: ['2777c8f46803b9ecab65f8d81f77ad2050678285.png'],
    output: 'natural-minor-scale-step-pattern-examples.svg', status: 'vexflow-overlay',
    alt: 'C minor, D minor, and B minor scales illustrating the whole-half-whole-whole-half-whole-whole pattern.',
    width: 850, height: 520,
    render({ VF, context, overlay }) {
      const labels = ['Whole\nStep', 'Half\nStep', 'Whole\nStep', 'Whole\nStep', 'Half\nStep', 'Whole\nStep', 'Whole\nStep'];
      drawPatternScale(VF, context, overlay, { y: 15, notes: scale(['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5'], { 2: 'b', 5: 'b', 6: 'b' }), labels });
      drawPatternScale(VF, context, overlay, { y: 180, notes: scale(['d/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5'], { 5: 'b' }), labels: ['W', 'H', 'W', 'W', 'H', 'W', 'W'] });
      drawPatternScale(VF, context, overlay, { y: 345, clef: 'bass', notes: scale(['b/2', 'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3'], { 1: '#', 4: '#' }), labels: [] });
    },
  },
  {
    id: 'natural-minor-starting-notes-practice',
    sources: ['ba0dba3f6286193381242d9b0711ead164b86d22.png'],
    output: 'natural-minor-starting-notes-practice.svg', status: 'vexflow-overlay',
    alt: 'Six starting notes for writing A, G, B flat, E, F, and F sharp natural minor scales.',
    width: 620, height: 420,
    render({ VF, context, overlay }) {
      drawStartingNotes(VF, context, overlay, [
        { note: pitch('a/4') }, { note: pitch('g/4') }, { note: pitch('b/3', 'b') },
        { note: pitch('e/4') }, { clef: 'bass', note: pitch('f/2') }, { clef: 'bass', note: pitch('f/2', '#') },
      ], 3);
    },
  },
  {
    id: 'natural-minor-scale-writing-solutions',
    sources: ['e97ebaee5739acf24c4d7dc6feccc27dc370c60f.png'],
    output: 'natural-minor-scale-writing-solutions.svg', status: 'vexflow-overlay',
    alt: 'Ascending A, G, B flat, E, F, and F sharp natural minor scales with accidentals.',
    width: 850, height: 790,
    render({ VF, context, overlay }) { drawScaleWorksheet(VF, context, overlay, naturalMinorRows); },
  },
  {
    id: 'relative-major-minor-patterns',
    sources: ['a8776d89f6a51e624c2db48e9c48bc0764ae48c7.png'],
    output: 'relative-major-minor-patterns.svg', status: 'svg-overlay',
    alt: 'Minor and major scale interval patterns aligned to show that relative keys use the same repeating sequence.',
    width: 830, height: 230,
    render({ overlay }) { drawMinorPatternDiagram(overlay); },
  },
  {
    id: 'c-major-c-minor-e-flat-major-comparison',
    sources: ['b0cd8d8b9bbd822479fb9d5033b13dec772f8974.png'],
    output: 'c-major-c-minor-e-flat-major-comparison.svg', status: 'vexflow-overlay',
    alt: 'C major with no sharps or flats, C minor with three flats, and E flat major with the same three-flat key signature.',
    width: 640, height: 355,
    render({ VF, context, overlay }) {
      drawTitledRows(VF, context, overlay, [
        { title: 'C major: no flats or sharps', music: 'c4 d4 e4 f4 g4 a4 b4 c5' },
        { title: 'C minor: three flats', key: 'Eb', music: 'c4 d4 e4 f4 g4 a4 b4 c5' },
        { title: 'E flat major: three flats', key: 'Eb', music: 'e4 f4 g4 a4 b4 c5 d5 e5' },
      ], { width: 640, rowHeight: 118, titleSize: 17 });
    },
  },
  {
    id: 'a-natural-harmonic-melodic-minor-comparison',
    sources: ['a1f2ff78adb5c4959eb1646d233b415623c18b62.png'],
    output: 'a-natural-harmonic-melodic-minor-comparison.svg', status: 'vexflow-overlay',
    alt: 'Ascending and descending A natural, harmonic, and melodic minor scales showing their differing sixth and seventh degrees.',
    width: 980, height: 500,
    render({ VF, context, overlay }) {
      drawAMinorForms(VF, context, overlay, ['natural', 'harmonic', 'melodic']);
    },
  },
  {
    id: 'harmonic-minor-scale-writing-solutions',
    sources: ['e1b491fc3b7d78fbc33815435de84ee7f561d5a6.png'],
    output: 'harmonic-minor-scale-writing-solutions.svg', status: 'vexflow-overlay',
    alt: 'Ascending A, G, B flat, E, F, and F sharp harmonic minor scales with raised seventh degrees.',
    width: 490, height: 580,
    render({ VF, context, overlay }) {
      drawScaleSolutions(VF, context, overlay, [
        { title: '1.  A  harmonic minor', music: 'a4 b4 c5 d5 e5 f5 g#5 a5' },
        { title: '2. G harmonic minor', music: 'g4 a4 bb4 c5 d5 eb5 f#5 g5' },
        { title: '3. B flat harmonic minor', music: 'bb3 c4 db4 eb4 f4 gb4 a4 b(b)4' },
        { title: '4. E harmonic minor', music: 'e4 f#4 g4 a4 b4 c5 d#5 e5' },
        { title: '5. F harmonic minor', clef: 'bass', music: 'f2 g2 ab2 bb2 c3 db3 e3 f3' },
        { title: '6. F sharp harmonic minor', clef: 'bass', music: 'f#2 g#2 a2 b2 c#3 d3 e#3 f(#)3' },
      ]);
    },
  },
  {
    id: 'melodic-minor-scale-writing-solutions',
    sources: ['f51253382ce0d354c87f28eccca901df1572a59d.png'],
    output: 'melodic-minor-scale-writing-solutions.svg', status: 'vexflow-overlay',
    alt: 'Ascending and descending A, G, B flat, E, F, and F sharp melodic minor scales with altered sixth and seventh degrees.',
    width: 1120, height: 790,
    render({ VF, context, overlay }) { drawScaleWorksheet(VF, context, overlay, melodicMinorRows.map((row) => ({ ...row, width: 990 }))); },
  },
  {
    id: 'dorian-minor-step-pattern',
    sources: ['6ea761be1de458aa09f079da4fad0c8242e99384.png'],
    output: 'dorian-minor-step-pattern.svg', status: 'vexflow-overlay',
    alt: 'Ascending D Dorian scale on the natural notes, labeled whole-half-whole-whole-whole-half-whole.',
    width: 560, height: 140,
    render({ VF, context, overlay }) {
      const { notes } = drawStave(VF, context, { x: 0, y: 0, width: 560, formatWidth: 440, notes: melody('d4 e4 f4 g4 a4 b4 c5 d5') });
      ['W', 'H', 'W', 'W', 'W', 'H', 'W'].forEach((step, index) => overlay.text(step, (noteX(notes[index]) + noteX(notes[index + 1])) / 2, 128, { 'font-size': 15, 'text-anchor': 'middle' }));
    },
  },
  {
    id: 'natural-minor-dorian-comparison',
    sources: ['cd98d77f2674afd1193634b92473e350a5a9c78e.png'],
    output: 'natural-minor-dorian-comparison.svg', status: 'vexflow-overlay',
    alt: 'D natural minor and D Dorian scales compared, differing only at the sixth degree: B flat versus B natural.',
    width: 900, height: 330,
    render({ VF, context, overlay }) {
      drawScaleRow(VF, context, overlay, { y: 10, title: 'Natural', notes: scale(['d/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5'], { 5: 'b' }), width: 770 });
      drawScaleRow(VF, context, overlay, { y: 165, title: 'Dorian', notes: scale(['d/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5']), width: 770 });
    },
  },
  {
    id: 'a-minor-types-with-dorian-comparison',
    sources: ['a9d8197d91fd07725f686061378aee0f88ed1d8f.png'],
    output: 'a-minor-types-with-dorian-comparison.svg', status: 'vexflow-overlay',
    alt: 'A natural, harmonic, melodic, and Dorian minor scales compared in ascending and descending form.',
    width: 980, height: 660,
    render({ VF, context, overlay }) {
      drawAMinorForms(VF, context, overlay, ['natural', 'harmonic', 'melodic', 'dorian']);
    },
  },
];
