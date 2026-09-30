import { drawStave, labelUnder, noteX, placeNotes } from '../figure-helpers.mjs';

// The same staff positions are read in each clef (steps above the bottom line).
const exerciseSteps = [0, 4, 5, 9, 7, 3, 6, -1, -3, 12, 2];
const clefBottomLine = { treble: ['e', 4], bass: ['g', 2], alto: ['f', 3] };
const letters = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

function exerciseKeys(clef) {
  const [letter, octave] = clefBottomLine[clef];
  return exerciseSteps.map((step) => {
    const index = letters.indexOf(letter) + step;
    return `${letters[((index % 7) + 7) % 7]}/${octave + Math.floor(index / 7)}`;
  });
}

// Ledger-line exercise: fourteen quarter notes at fixed staff positions,
// named differently in treble and bass clef.
const ledgerXs = [78, 133, 200, 258, 325, 383, 440, 518, 583, 645, 718, 778, 845, 905].map((x) => x / 1.45);
const ledgerPitches = {
  treble: ['b3', 'f3', 'g3', 'd3', 'a3', 'c4', 'e3', 'c6', 'e6', 'b5', 'f6', 'd6', 'g6', 'a5'],
  bass: ['d2', 'a1', 'b1', 'f1', 'c2', 'e2', 'g1', 'e4', 'g4', 'd4', 'a4', 'f4', 'b4', 'c4'],
};

function drawLedgerRow(VF, context, overlay, { y, clef, showClef = true, letters }) {
  placeNotes(VF, context, {
    x: 0, y, width: 655, clef: showClef ? clef : null, noteClef: clef, beginBar: 'none',
    items: ledgerPitches[clef].map((pitch, index) => ({ x: ledgerXs[index], music: `${pitch}:q`, extra: { stemDirection: index < 7 ? 1 : -1 } })),
  });
  if (!letters) return;
  ledgerPitches[clef].forEach((pitch, index) => overlay.text(pitch[0].toUpperCase(), ledgerXs[index], index < 7 ? y + letters[1] : y + letters[0], {
    'font-size': 15, 'text-anchor': 'middle', fill: '#e5251b',
  }));
}

function drawClefNameRows(VF, context, overlay, showAnswers) {
  [['treble', 0], ['bass', 155], ['alto', 310]].forEach(([clef, y]) => {
    const keys = exerciseKeys(clef);
    const { notes } = drawStave(VF, context, {
      x: 0, y, width: 900, clef, formatWidth: 760, notes: keys.map((key) => ({ key, duration: 'q' })),
    });
    if (showAnswers) notes.forEach((item, index) => overlay.text(keys[index][0].toUpperCase(), noteX(item), y + 142, {
      'font-size': 19, 'font-weight': '700', 'text-anchor': 'middle',
    }));
  });
}

const mnemonicBlue = '#1e5aa8';
const clefGlyphs = { treble: '\uE050', bass: '\uE062' };

// Large hand-drawn staff for the mnemonic figures: words sit on (and break)
// the lines, or sit in the spaces. The clef is the Bravura glyph scaled so one
// em spans four staff spaces, anchored on its reference line (G or F).
function drawMnemonicStaff(overlay, { top, spacing = 34, width = 800, clef, lineWords = [], spaceWords = [] }) {
  const size = 21;
  const wordWidth = (word) => word.length * size * 0.62;
  for (let line = 0; line < 5; line += 1) {
    const y = top + line * spacing;
    const word = lineWords[4 - line];
    if (word) {
      const [text, x] = word;
      overlay.line(line === 0 ? 10 : 0, y, x - 12, y, { stroke: '#111', 'stroke-width': 3 });
      if (line > 0) overlay.line(x + wordWidth(text) + 10, y, width - 5, y, { stroke: '#111', 'stroke-width': 3 });
    } else overlay.line(0, y, width, y, { stroke: '#111', 'stroke-width': 3 });
  }
  const anchor = clef === 'bass' ? top + spacing : top + spacing * 3;
  overlay.text(clefGlyphs[clef], 4, anchor, { 'font-family': 'Bravura', 'font-size': spacing * 3.5, fill: '#16302b' });
  lineWords.forEach(([text, x], index) => {
    const y = top + (4 - index) * spacing + 7;
    overlay.text(text[0], x, y, { 'font-size': size, 'font-weight': '700', fill: '#111' });
    overlay.text(text.slice(1), x + size * 0.72 + (text.length > 1 && text.length < 3 ? 4 : 0), y, { 'font-size': size, 'font-weight': '700', fill: mnemonicBlue });
  });
  spaceWords.forEach(([text, x], index) => {
    const y = top + (4 - index) * spacing - spacing / 2 + 7;
    overlay.text(text[0], x, y, { 'font-size': size, 'font-weight': '700', fill: '#111' });
    overlay.text(text.slice(1), x + size * 0.72, y, { 'font-size': size, 'font-weight': '700', fill: mnemonicBlue });
  });
}

export const definitions = [
  {
    id: 'orchestral-score-layout',
    sources: ['579422782a5ef1c8596ec806f11e71503cd314d1.png'],
    output: 'orchestral-score-layout.svg',
    alt: 'An orchestral score with labelled woodwind, brass, percussion, and string staves aligned in a system.',
    width: 920,
    height: 1020,
    render({ VF, context, overlay }) {
      const parts = [
        ['Flutes', 'treble'], ['Oboes', 'treble'], ['Clarinets in B♭', 'treble'], ['Bassoons', 'bass'],
        ['Horns in F', 'treble'], ['Trumpets in C', 'treble'], ['Timpani in G', 'bass'],
        ['Violin I', 'treble'], ['Violin II', 'treble'], ['Viola', 'alto'], ['Violoncello', 'bass'], ['Contrabass', 'bass'],
      ];
      parts.forEach(([label, clef], index) => {
        const y = 22 + index * 80;
        const hasPhrase = [2, 7, 8, 9, 10, 11].includes(index);
        drawStave(VF, context, {
          x: 180, y, width: 700, clef, key: 'D', time: index === 0 ? '3/4' : undefined,
          notes: hasPhrase
            ? ['d/4', 'e/4', 'f/4', 'a/4', 'g/4', 'e/4'].map((key) => ({ key, duration: 'q' }))
            : [{ rest: true, duration: 'w' }, { rest: true, duration: 'w' }, { rest: true, duration: 'w' }],
          formatWidth: 540,
        });
        overlay.text(label, 155, y + 52, { 'font-size': 15, 'font-weight': '700', 'text-anchor': 'end' });
      });
      overlay.line(174, 62, 174, 962, { stroke: '#111', 'stroke-width': 3 });
      overlay.text('All staves are read together from left to right', 520, 1000, { 'font-size': 17, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'treble-clef-mnemonics',
    sources: ['b9295f79fda01598db4bcb7cc6b5fa206bb65c1a.png'],
    output: 'treble-clef-mnemonics.svg',
    alt: 'Treble-clef line names E G B D F and space names F A C E with common mnemonic phrases.',
    width: 820,
    height: 440,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 55, y: 50, width: 700 });
      [['E', 190, 154], ['G', 295, 134], ['B', 400, 114], ['D', 505, 94], ['F', 610, 74]].forEach(([v, x, y]) => overlay.text(v, x, y, { 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' }));
      overlay.text('Treble-clef lines: “Every Good Boy Does Fine”', 410, 200, { fill: '#1769aa', 'font-size': 18, 'text-anchor': 'middle' });
      overlay.text('or “Every Good Boy Deserves Fudge”', 410, 228, { fill: '#1769aa', 'font-size': 17, 'text-anchor': 'middle' });
      drawStave(VF, context, { x: 55, y: 270, width: 700 });
      [['F', 235, 364], ['A', 350, 344], ['C', 465, 324], ['E', 580, 304]].forEach(([v, x, y]) => overlay.text(v, x, y, { 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' }));
      overlay.text('Treble-clef spaces spell “FACE”', 410, 425, { fill: '#1769aa', 'font-size': 18, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'bass-clef-mnemonics',
    sources: ['d0df5580a52bd5ff1c22982ff89e7ce408a5750a.png'],
    output: 'bass-clef-mnemonics.svg',
    alt: 'Bass-clef line names G B D F A and space names A C E G with common mnemonic phrases.',
    width: 800,
    height: 670,
    render({ overlay }) {
      drawMnemonicStaff(overlay, {
        top: 78, clef: 'bass',
        lineWords: [['Good', 238], ['Boys', 352], ['Do', 466], ['Fine', 570], ['Always', 680]],
      });
      overlay.text('Bass clef lines:\n"Good Boys Do Fine Always"\nor\n"Good Boys Deserve Fudge Always"', 270, 280, { fill: mnemonicBlue, 'font-size': 21, 'data-line-height': 29 });
      drawMnemonicStaff(overlay, {
        top: 432, clef: 'bass',
        spaceWords: [['All', 140], ['Cows', 276], ['Eat', 432], ['Grass', 573]],
      });
      overlay.text('Bass clef spaces:\n"All Cows Eat Grass"', 238, 628, { fill: mnemonicBlue, 'font-size': 21, 'data-line-height': 29 });
    },
  },
  {
    id: 'movable-g-and-f-clefs',
    sources: ['6a559902470af8de8f7a3e2b8ad222cecdcc9fa7.png'],
    output: 'movable-g-and-f-clefs.svg',
    alt: 'Historical G and F clefs placed on nonstandard staff lines with ascending pitch names.',
    width: 860,
    height: 390,
    render({ VF, context, overlay }) {
      drawStave(VF, context, { x: 45, y: 45, width: 770, clef: 'french' });
      labelUnder(overlay, ['G', 'A', 'B', 'C', 'D'], 210, 95, 150, { 'font-weight': '700' });
      overlay.text('etc.', 745, 67, { 'font-size': 16 });
      drawStave(VF, context, { x: 45, y: 220, width: 770, clef: 'baritone-f' });
      labelUnder(overlay, ['F', 'G', 'A', 'B', 'C'], 210, 95, 325, { 'font-weight': '700' });
      overlay.text('etc.', 745, 242, { 'font-size': 16 });
      overlay.text('The G and F clefs were once movable.', 430, 382, { 'font-size': 18, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'same-melody-treble-and-bass',
    sources: ['a69c707986504c5a27ee1c94ddbbb00d1101f4b7.png'],
    output: 'same-melody-treble-and-bass.svg',
    alt: 'The same melody written in treble and bass clefs, illustrating excessive ledger lines in each clef.',
    width: 980,
    height: 400,
    render({ VF, context, overlay }) {
      const pitches = ['c/5', 'e/5', 'g/5', 'a/5', 'g/5', 'e/5', 'c/5', 'd/5', 'e/5', 'g/5', 'f/5', 'e/5', 'd/5', 'c/5'];
      drawStave(VF, context, { x: 45, y: 45, width: 890, clef: 'treble', time: 'C', notes: pitches.map((key) => ({ key, duration: '8' })), formatWidth: 720, beams: true });
      drawStave(VF, context, { x: 45, y: 225, width: 890, clef: 'bass', time: 'C', notes: pitches.map((key) => ({ key, duration: '8' })), formatWidth: 720, beams: true });
      overlay.text('Treble clef', 80, 30, { 'font-size': 17, 'font-weight': '700' });
      overlay.text('Bass clef—the same sounding pitches require many ledger lines', 80, 210, { 'font-size': 17, 'font-weight': '700' });
    },
  },
  {
    id: 'middle-c-in-three-clefs',
    sources: ['e2897b454b02e02a65a9b8cd989a5187cbda5093.png'],
    output: 'middle-c-in-three-clefs.svg',
    alt: 'Middle C written in treble, bass, and alto clefs.',
    width: 820,
    height: 430,
    render({ VF, context, overlay }) {
      [['treble', 30, 'Treble: middle C is below the staff'], ['bass', 165, 'Bass: middle C is above the staff'], ['alto', 300, 'Alto: middle C is on the center line']].forEach(([clef, y, label]) => {
        drawStave(VF, context, { x: 65, y, width: 690, clef, notes: [{ key: 'c/4', duration: 'w' }], formatWidth: 250 });
        overlay.text(label, 420, y + 115, { 'font-size': 17, 'text-anchor': 'middle' });
      });
    },
  },
  {
    id: 'clef-note-name-practice',
    sources: ['17e780a24ae09def5583b27898930f3dd936bfa3.png'],
    output: 'clef-note-name-practice.svg',
    alt: 'Treble, bass, and alto staves with the same eleven note positions, for naming each note in each clef.',
    width: 900,
    height: 450,
    render({ VF, context, overlay }) { drawClefNameRows(VF, context, overlay, false); },
  },
  {
    id: 'clef-note-name-answers',
    sources: ['3087ad9e3af32de3f3c0f6278eca1ce3558cff12.png'],
    output: 'clef-note-name-answers.svg',
    alt: 'Treble, bass, and alto staves with the same eleven note positions, each note labelled with its letter name in that clef.',
    width: 900,
    height: 470,
    render({ VF, context, overlay }) { drawClefNameRows(VF, context, overlay, true); },
  },
  {
    id: 'ledger-note-practice',
    sources: ['9c39c637224c0bba225d33a4a11dfd0c9c0583bb.png'],
    output: 'ledger-note-practice.svg',
    alt: 'A staff with no clef and notes on ledger lines below and above it, to be named once a clef is chosen.',
    width: 655,
    height: 150,
    render({ VF, context, overlay }) {
      drawLedgerRow(VF, context, overlay, { y: 20, clef: 'treble', showClef: false });
    },
  },
  {
    id: 'ledger-note-practice-answers',
    sources: ['25011ac162a03037c0aaa44f2843334c4564072e.png'],
    output: 'ledger-note-practice-answers.svg',
    alt: 'Ledger-line notes below and above the staff named in treble clef (B F G D A C E, then C E B F D G A) and in bass clef (D A B F C E G, then E G D A F B C).',
    width: 655,
    height: 375,
    render({ VF, context, overlay }) {
      drawLedgerRow(VF, context, overlay, { y: 27, clef: 'treble', letters: [111, 151] });
      drawLedgerRow(VF, context, overlay, { y: 199, clef: 'bass', letters: [113, 160] });
    },
  },
];
