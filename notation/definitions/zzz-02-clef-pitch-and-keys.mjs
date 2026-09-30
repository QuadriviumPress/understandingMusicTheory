import { arrowLine, curvedArrow, drawKeyboard, drawMeasures, drawPiano, drawStave, keyLabel, labelUnder } from '../figure-helpers.mjs';

const worksheetRed = '#e5251b';
const worksheetBlue = '#1f5fbf';
const worksheetGlyphs = { treble: '\uE050', bass: '\uE062', whole: '\uE0A2' };

// Staff positions are counted in steps from the bottom line (0 = bottom line).
const worksheetAnswers = {
  treble: {
    lines: ['E', 'G', 'B', 'D', 'F'], spaces: ['F', 'A', 'C', 'E'], below: ['C', 'A', 'F'], above: ['E', 'C', 'A'],
    names: ['F', 'B', 'E', 'A', 'C', 'E', 'G', 'G', 'F', 'D', 'D'], written: [5, 2, 1, 6, 7, 3, 4],
  },
  bass: {
    lines: ['G', 'B', 'D', 'F', 'A'], spaces: ['A', 'C', 'E', 'G'], below: ['E', 'C', 'A'], above: ['G', 'E', 'C'],
    names: ['A', 'D', 'G', 'C', 'E', 'G', 'B', 'B', 'A', 'F', 'F'], written: [3, 7, 6, 4, 5, 1, 2],
  },
};

// Recreates the source worksheet page (drawn at twice the original PNG size).
function renderClefWorksheet({ overlay }, answerClef) {
  const answers = worksheetAnswers[answerClef];
  const staffLine = { stroke: '#333', 'stroke-width': 1.8 };
  const text = (value, x, y, attributes = {}) => overlay.text(value, x, y, { 'font-size': 21, 'data-line-height': 29, ...attributes });
  const staff = (top, x1, x2, spacing = 14.25) => {
    for (let line = 0; line < 5; line += 1) overlay.line(x1, top + line * spacing, x2, top + line * spacing, staffLine);
    return (step) => top + 4 * spacing - step * spacing / 2;
  };
  const clef = (x, positionOf) => {
    if (!answerClef) return;
    overlay.text(worksheetGlyphs[answerClef], x, positionOf(answerClef === 'treble' ? 2 : 6), { 'font-family': 'Bravura', 'font-size': 57, fill: worksheetRed });
  };
  const whole = (x, y, fill = '#111') => overlay.text(worksheetGlyphs.whole, x, y, { 'font-family': 'Bravura', 'font-size': 57, fill, 'text-anchor': 'middle' });
  const circle = (x, y, letter) => {
    overlay.circle(x, y, 17, { fill: 'white', stroke: worksheetBlue, 'stroke-width': 2 });
    if (letter) overlay.text(letter, x, y + 7, { fill: worksheetRed, 'font-size': 19, 'text-anchor': 'middle' });
  };

  overlay.text('Clef Practice', 498, 32, { 'font-family': 'Georgia, serif', 'font-size': 30, 'font-weight': '700', 'text-anchor': 'middle' });
  text('Practice writing your clef symbol on this staff. Write at least eight clef symbols', 0, 118);
  const practice = staff(157, 0, 946);
  [8, 125, 240, 353, 465, 570, 695, 810].forEach((x) => clef(x, practice));

  text('Write the letter names of the lines in your staff:', 2, 290);
  text('Write the letter names of the spaces:', 538, 287);
  [[38, 444], [63, 420], [88, 397], [113, 374], [138, 347]].forEach(([x, y], index) => {
    overlay.line(x, y, 467, y, staffLine);
    circle(x, y - 7, answers?.lines[index]);
  });
  [443, 418, 394, 371, 347].forEach((y) => overlay.line(540, y, 946, y, staffLine));
  [[592, 430], [686, 407], [776, 382], [884, 358]].forEach(([x, y], index) => circle(x, y, answers?.spaces[index]));

  text('Write the letter names of the three ledger lines below\nand the three ledger lines above your staff.', 0, 517);
  staff(610, 310, 700);
  [681, 695, 709].forEach((y) => overlay.line(312, y, 330, y, staffLine));
  [567, 581, 595].forEach((y) => overlay.line(677, y, 695, y, staffLine));
  [[658, 683], [691, 691], [723, 699]].forEach(([y, target], index) => {
    overlay.line(254, y + (index - 1) * 5, 292, target, { stroke: worksheetBlue, 'stroke-width': 2 });
    circle(240, y, answers?.below[index]);
  });
  [[547, 567], [580, 580], [612, 594]].forEach(([y, target], index) => {
    overlay.line(742, y + (1 - index) * 5, 710, target, { stroke: worksheetBlue, 'stroke-width': 2 });
    circle(757, y, answers?.above[index]);
  });

  text('Write your clef symbol at the beginning of this line.\nThen write the correct letter name above each note.', 8, 775);
  const named = staff(862, 0, 946);
  clef(8, named);
  [[92, 1], [173, 4], [256, 7], [330, 3], [403, 5], [476, 0], [568, 2], [652, 9], [734, 8], [818, 6], [895, -1]].forEach(([x, step], index) => {
    whole(x, named(step));
    if (answers) overlay.text(answers.names[index], x, 842, { fill: worksheetRed, 'font-size': 21, 'text-anchor': 'middle' });
  });

  text('Write your clef symbol at the beginning of this line.\nThen write a note in the staff for each letter below the staff.', 0, 993);
  const written = staff(1062, 0, 946);
  clef(8, written);
  [[72, 'C', 82], [213, 'G', 212], [347, 'F', 352], [487, 'D', 488], [626, 'E', 628], [766, 'A', 768], [906, 'B', 905]].forEach(([x, letter, noteX], index) => {
    text(letter, x, 1167, { 'text-anchor': 'middle' });
    if (answers) whole(noteX, written(answers.written[index]), worksheetRed);
  });
}

export const definitions = [
  {
    id: 'clef-practice-worksheet',
    sources: ['6e59466f91e61d128e62b1b0d8447df01788fb69.png'],
    output: 'clef-practice-worksheet.svg',
    alt: 'A clef worksheet with blank staves for writing clefs, naming lines and spaces, and identifying notes.',
    width: 946,
    height: 1180,
    render(args) { renderClefWorksheet(args); },
  },
  {
    id: 'treble-clef-practice-answers',
    sources: ['f24f3bff15f4753276f6263917a6eb58c3924ed2.png'],
    output: 'treble-clef-practice-answers.svg',
    alt: 'Completed clef worksheet showing treble-clef symbols and pitch-name answers.',
    width: 946,
    height: 1180,
    render(args) { renderClefWorksheet(args, 'treble'); },
  },
  {
    id: 'bass-clef-practice-answers',
    sources: ['cb8a1669129bb78cc53eb4d1435d1a704d569e88.png'],
    output: 'bass-clef-practice-answers.svg',
    alt: 'Completed clef worksheet showing bass-clef symbols and pitch-name answers.',
    width: 946,
    height: 1180,
    render(args) { renderClefWorksheet(args, 'bass'); },
  },
  {
    id: 'piano-natural-notes',
    sources: ['d9bb1aa306154dd4ae19d956f60214da91569c09.png'],
    output: 'piano-natural-notes.svg',
    alt: 'Two octaves of piano keys with the natural notes C D E F G A B labelled on the white keys.',
    width: 760,
    height: 300,
    render({ overlay }) {
      drawKeyboard(overlay, { x: 55, y: 35, whiteWidth: 46, whiteHeight: 220, whiteKeys: 14, labels: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'] });
      overlay.text('Natural notes are the white keys', 380, 288, { 'font-size': 19, 'font-weight': '700', 'text-anchor': 'middle' });
    },
  },
  {
    id: 'half-and-whole-steps-keyboard',
    sources: ['45208895ad6be8fb4640e26efd4788b7b8e78f9a.png'],
    output: 'half-and-whole-steps-keyboard.svg',
    alt: 'A piano keyboard showing that E to F is a half step with no note between, while G to A is a whole step with G sharp or A flat between.',
    width: 550,
    height: 480,
    render({ overlay }) {
      const { white, black } = drawPiano(overlay, { x: 55, y: 0, whiteWidth: 40.7, whiteHeight: 320, blackWidth: 30, blackHeight: 190, letters: false, stroke: 4 });
      ['E', 'F', 'G', 'A'].forEach((letter, index) => overlay.text(letter, white[index + 2], 293, { 'font-size': 18, 'text-anchor': 'middle', fill: '#333' }));
      overlay.path(`M ${black[4] - 15} 95 H ${black[4] + 15} V 160 H ${black[4] - 15} Z`, { fill: 'white', stroke: 'none' });
      overlay.text('G♯', black[4], 124, { 'font-size': 18, 'text-anchor': 'middle', fill: '#e5251b' });
      overlay.text('A♭', black[4], 152, { 'font-size': 18, 'text-anchor': 'middle', fill: '#1f5fbf' });
      [[2, 3, 170], [4, 5, 258]].forEach(([a, b, x]) => {
        overlay.line(white[a], 310, x - 6, 358, { stroke: '#111', 'stroke-width': 1.4 });
        overlay.line(white[b], 310, x + 6, 358, { stroke: '#111', 'stroke-width': 1.4 });
      });
      const text = (value, x) => overlay.text(value, x, 380, { 'font-size': 19, 'data-line-height': 29, fill: '#222' });
      text('E natural and F natural\nare one half step apart;\nthere is no note\nbetween them.', 0);
      text('G natural and A natural\nare one whole step apart;\nthe note between them\ncan be called G sharp or A flat.', 250);
    },
  },
  {
    id: 'enharmonic-black-key-example',
    sources: ['1cb4dee12c597c2cdb3d2c11db504a01d045ac37.png'],
    output: 'enharmonic-black-key-example.svg',
    alt: 'G sharp and A flat are the same black key; E sharp and F natural are the same white key.',
    width: 510,
    height: 365,
    render({ VF, context, overlay }) {
      const red = '#f0624a';
      const blue = '#2f6fbf';
      drawMeasures(VF, context, {
        x: 0, y: -16, widths: [175, 107, 108, 118], time: '4/4', endBar: 'single',
        measures: [
          [{ key: 'g/4', accidental: '#', duration: 'w', color: red }], [{ key: 'a/4', accidental: 'b', duration: 'w', color: blue }],
          [{ key: 'e/4', accidental: '#', duration: 'w', color: red }], [{ key: 'f/4', accidental: 'n', duration: 'w', color: blue }],
        ],
      });
      [['G sharp', 116, red], ['=', 164, '#555'], ['A flat', 205, blue], ['E sharp', 342, red], ['=', 384, '#555'], ['F natural', 429, blue]].forEach(([text, x, fill]) => {
        overlay.text(text, x, 90, { 'font-size': 14, 'text-anchor': 'middle', fill });
      });
      const { white, black } = drawPiano(overlay, { x: 88, y: 140, whiteWidth: 28, whiteHeight: 220, blackWidth: 20, blackHeight: 128 });
      keyLabel(overlay, 'G♯', black[4], 226, red);
      keyLabel(overlay, 'A♭', black[4], 246, blue);
      overlay.text('E♯', white[2] + 12, 296, { 'font-size': 14, 'text-anchor': 'middle', fill: red });
      curvedArrow(overlay, white[2], 318, white[2], 300, white[2] + 5, 294, red);
      curvedArrow(overlay, white[4] - 4, 320, white[4] - 8, 262, black[4] - 6, 238, red);
      curvedArrow(overlay, white[5] + 4, 320, white[5] + 8, 262, black[4] + 6, 250, blue);
    },
  },
  {
    id: 'double-accidental-equivalence',
    sources: ['fc98d4be7671f4ac93df2eafee35a17db51d68bb.png'],
    output: 'double-accidental-equivalence.svg',
    alt: 'G double sharp sounds the same as A natural, and C double flat sounds the same as B flat, shown on a staff and on a keyboard.',
    width: 600,
    height: 425,
    render({ VF, context, overlay }) {
      [['Double Sharp Symbol', '', 138], ['Double Flat Symbol', '', 424]].forEach(([title, glyph, x]) => {
        overlay.text(title, x, 24, { 'font-size': 14, 'font-weight': '700', 'text-anchor': 'middle' });
        overlay.text(glyph, x, 66, { 'font-family': 'Bravura', 'font-size': 40, 'text-anchor': 'middle', fill: '#111' });
      });
      drawMeasures(VF, context, {
        x: 0, y: 56, widths: [188, 142, 128, 142], time: '4/4',
        measures: [[{ key: 'g/4', accidental: '##', duration: 'w' }], [{ key: 'a/4', duration: 'w' }], [{ key: 'c/5', accidental: 'bb', duration: 'w' }], [{ key: 'b/4', accidental: 'b', duration: 'w' }]],
      });
      overlay.text('G double sharp and A natural\nsound the same.', 94, 158, { 'font-size': 13, 'data-line-height': 19, fill: '#333' });
      overlay.text('C double flat and B flat\nsound the same.', 382, 154, { 'font-size': 13, 'data-line-height': 19, fill: '#333' });
      const red = '#e5251b';
      const blue = '#1f5fbf';
      const { white, black } = drawPiano(overlay, { x: 270, y: 200, start: 'F', whiteWidth: 27.7, whiteHeight: 220, blackWidth: 20, blackHeight: 128 });
      keyLabel(overlay, 'B♭', black[2], 254, blue);
      keyLabel(overlay, 'G♯', black[1] - 2, 306, red);
      keyLabel(overlay, 'C♭♭', black[2] + 1, 304, blue, 13);
      overlay.text('G𝄪', white[2] - 4, 346, { 'font-size': 13, 'text-anchor': 'middle', fill: red });
      overlay.text('C♭', white[3] + 3, 344, { 'font-size': 13, 'text-anchor': 'middle', fill: blue });
      curvedArrow(overlay, white[1] - 4, 376, white[1] - 6, 330, black[1] - 4, 314, red);
      curvedArrow(overlay, white[2] - 8, 336, white[2] - 14, 322, black[1] + 4, 312, red);
      curvedArrow(overlay, white[4] - 2, 378, white[4], 350, white[3] + 8, 348, blue);
      curvedArrow(overlay, white[3] + 12, 332, white[3] + 12, 312, black[2] + 10, 306, blue);
    },
  },
  {
    id: 'key-signature-naming-rules',
    sources: ['20d859609bbee3a5785ae335555a3c2f7054744b.png'],
    output: 'key-signature-naming-rules.svg',
    alt: 'Naming keys from key signatures: the last sharp E sharp gives F sharp major and the last sharp C sharp gives D major; the second-to-last flat E flat gives E flat major and A flat gives A flat major.',
    width: 408,
    height: 377,
    render({ VF, context, overlay }) {
      [[83, 'treble', 'F#', 'Eb'], [179, 'bass', 'D', 'Ab']].forEach(([y, clef, sharps, flats]) => {
        drawStave(VF, context, { x: 0, y, width: 213, clef, key: sharps, beginBar: 'none', endBar: 'double' });
        drawStave(VF, context, { x: 213, y, width: 195, clef: null, key: flats, beginBar: 'none', endBar: 'none' });
      });
      const text = (value, x, y) => overlay.text(value, x, y, { 'font-size': 15, 'data-line-height': 19.5, fill: '#333' });
      text('Last sharp is E sharp;\nkey is F sharp major\n(one half step higher\nthan E sharp)', 0, 12);
      text('Second-to-last\nflat is E flat;\nkey is E flat major', 228, 19);
      text('Last sharp is C sharp;\nkey is D major\n(one half step higher\nthan C sharp)', 5, 312);
      text('Second-to-last\nflat is A flat;\nkey is A flat major', 236, 319);
      arrowLine(overlay, 101, 72, 101, 111, { 'stroke-width': 1.3 });
      arrowLine(overlay, 238, 72, 238, 110, { 'stroke-width': 1.3 });
      arrowLine(overlay, 53, 305, 53, 262, { 'stroke-width': 1.3 });
      arrowLine(overlay, 248, 305, 248, 263, { 'stroke-width': 1.3 });
    },
  },
  {
    id: 'key-signature-writing-practice',
    sources: ['d64908821c909af8dd493167ab6281e4ae6aa542.png'],
    output: 'key-signature-writing-practice.svg',
    alt: 'A blank treble staff divided into five sections for writing key signatures with 3 flats, 4 sharps, 5 flats, 5 sharps, and 7 sharps.',
    width: 652,
    height: 85,
    render({ VF, context, overlay }) {
      drawMeasures(VF, context, { x: 0, y: -33, widths: [141, 119, 122, 131, 139], endBars: ['double', 'double', 'double', 'double', 'double'], measures: [[], [], [], [], []] });
      [['3 flats', 65], ['4 sharps', 176], ['5 flats', 289], ['5 sharps', 417], ['7 sharps', 548]].forEach(([text, x]) => overlay.text(text, x, 73, { 'font-size': 15, 'text-anchor': 'middle', fill: '#333' }));
    },
  },
  {
    id: 'piano-sharp-flat-note-names',
    sources: ['74beea27ad30018569811de3fdca3702b5f1328a.png'],
    output: 'piano-sharp-flat-note-names.svg',
    alt: 'A piano octave labelling white keys with natural notes and black keys with both sharp and flat names.',
    width: 850,
    height: 360,
    render({ overlay }) {
      drawKeyboard(overlay, { x: 230, y: 45, whiteWidth: 62, whiteHeight: 260, whiteKeys: 7, labels: ['C♮', 'D♮', 'E♮', 'F♮', 'G♮', 'A♮', 'B♮'], blackLabels: { 0: 'C♯\nD♭', 1: 'D♯\nE♭', 3: 'F♯\nG♭', 4: 'G♯\nA♭', 5: 'A♯\nB♭' } });
      overlay.text('Black keys:\nsharp or flat names', 40, 80, { fill: '#c62828', 'font-size': 17, 'data-line-height': 23 });
      overlay.text('White keys:\nnatural-note names', 40, 275, { 'font-size': 17, 'data-line-height': 23 });
    },
  },
];
