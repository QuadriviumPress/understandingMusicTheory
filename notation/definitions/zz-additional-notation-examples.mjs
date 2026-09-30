import { arrowLine, drawIntervalRows, drawNamedStaff, drawStave, melody, noteX, placeNotes } from '../figure-helpers.mjs';

function staveNote(VF, keys, duration = 'w', accidentals = []) {
  const note = new VF.StaveNote({ keys: Array.isArray(keys) ? keys : [keys], duration });
  accidentals.forEach((accidental, index) => {
    if (accidental) note.addModifier(new VF.Accidental(accidental), index);
  });
  return note;
}

function drawVoice(VF, context, stave, notes, formatWidth) {
  const voice = new VF.Voice({ num_beats: notes.length * 4, beat_value: 4 })
    .setStrict(false)
    .addTickables(notes);
  new VF.Formatter().joinVoices([voice]).format([voice], formatWidth);
  voice.setStave(stave).draw(context, stave);
  return notes;
}

function drawInterval(VF, context, { x, y, width = 185, clef = 'treble', keys, accidentals = [] }) {
  const stave = new VF.Stave(x, y, width).addClef(clef);
  stave.setContext(context).draw();
  drawVoice(VF, context, stave, keys.map((key, index) => staveNote(VF, key, 'w', [accidentals[index]])), width - 95);
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

const intervalNumberExercise = {
  measures: [['f/4', 'a/4'], ['d/5', 'g/4'], ['d/4', 'd/5'], ['b/4', 'c/5'], ['g/5', 'a/4'], ['b/4', 'e/5']],
  labels: ['Third', 'Fifth', 'Octave', 'Second', 'Seventh', 'Fourth'],
};

export const definitions = [
  {
    id: 'bass-pitch-names',
    sources: ['d602c16ca85ac9a1dec4202c752714bcb05c3124.png'],
    output: 'bass-pitch-names.svg',
    alt: 'A bass clef staff labelled with ascending note names from E below the staff through C above it.',
    width: 900,
    height: 260,
    render({ overlay }) {
      const columns = [120, 181, 237, 290, 340, 390, 445, 503, 560, 608, 664, 719, 770];
      overlay.text('Bass Clef\nSymbol', 8, 20, { 'font-size': 19, 'data-line-height': 25 });
      drawNamedStaff(overlay, {
        top: 77, clef: 'bass',
        entries: ['E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'].map((letter, index) => ({ letter, x: columns[index], step: index - 2 })),
      });
      overlay.text('etc.', 6, 252, { 'font-size': 19 });
      arrowLine(overlay, 88, 224, 52, 240);
      overlay.text('etc.', 862, 38, { 'font-size': 19 });
      arrowLine(overlay, 808, 46, 846, 34);
    },
  },
  {
    id: 'legato-example',
    sources: ['146dfa0726ec0516d4e0257c74b5778ccba89008.png'],
    output: 'legato-example.svg',
    alt: 'A three-four passage marked with tenuto lines over each note, then under each note, then with the word legato.',
    width: 435,
    height: 85,
    render({ VF, context, overlay }) {
      drawStave(VF, context, {
        x: 0, y: -13, width: 435, time: '3/4', formatWidth: 330,
        notes: [
          ...melody('d5 d5 d5', { articulations: ['a-'] }), { bar: 'single' },
          ...melody('g4 g4 g4', { articulations: ['a-'], articulationBelow: true }), { bar: 'single' },
          ...melody('d5 d5 d5'),
        ],
      });
      overlay.text('legato', 330, 15, { 'font-family': 'Georgia, serif', 'font-style': 'italic', 'font-weight': '700', 'font-size': 14, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'enharmonic-key-signature-practice',
    sources: ['2d5aa7cd858822a99a24ca70fa009235bc626daa.png'],
    output: 'enharmonic-key-signature-practice.svg',
    alt: 'B major and B flat minor key signatures beside blank staves for writing their enharmonic equivalents',
    width: 520,
    height: 225,
    render({ VF, context, overlay }) { drawKeySignaturePairs(VF, context, overlay, false); },
  },
  {
    id: 'five-key-signatures',
    sources: ['67b0b986ffc1cbcda11f6d128a847ab6c2455b65.png'],
    output: 'five-key-signatures.svg',
    alt: 'Key signatures for E flat major, E major, D flat major, B major, and C sharp major.',
    width: 790,
    height: 128,
    render({ VF, context, overlay }) {
      let x = 0;
      [['Eb', 162, 'E flat major', 96], ['E', 150, 'E major', 208], ['Db', 146, 'D flat major', 372], ['B', 159, 'B major', 502], ['C#', 166, 'C sharp major', 686]].forEach(([key, width, label, labelX], index) => {
        drawStave(VF, context, { x, y: -12, width, clef: index ? null : 'treble', key, beginBar: 'none', endBar: 'double' });
        overlay.text(label, labelX, 118, { 'font-size': 17, 'text-anchor': 'middle', fill: '#333' });
        x += width;
      });
    },
  },
  {
    id: 'octave-naming-systems',
    sources: ['7dc996aef1a319a54ddbb2ad45e04dfb293c039e.png'],
    output: 'octave-naming-systems.svg',
    alt: 'Six octaves of C labelled with common, Helmholtz, and scientific octave names.',
    width: 980,
    height: 360,
    render({ VF, context, overlay }) {
      const bass = new VF.Stave(55, 55, 405).addClef('bass');
      const treble = new VF.Stave(460, 55, 465).addClef('treble');
      bass.setContext(context).draw();
      treble.setContext(context).draw();
      const low = ['c/1', 'c/2', 'c/3'].map((key) => staveNote(VF, key));
      const high = ['c/4', 'c/5', 'c/6'].map((key) => staveNote(VF, key));
      drawVoice(VF, context, bass, low, 260);
      drawVoice(VF, context, treble, high, 320);
      const xs = [170, 285, 400, 575, 710, 845];
      const rows = [
        ['Say:', ['“Contra”', '“Great”', '“Small”', '“One-line”', '“Two-line”', '“Three-line”']],
        ['Helmholtz:', ['CC', 'C', 'c', 'c¹', 'c²', 'c³']],
        ['Scientific:', ['C₁', 'C₂', 'C₃', 'C₄', 'C₅', 'C₆']],
      ];
      rows.forEach(([heading, values], row) => {
        const y = 245 + row * 46;
        overlay.text(heading, 25, y, { 'font-size': 17, 'font-weight': '700' });
        values.forEach((value, index) => overlay.text(value, xs[index], y, { 'font-size': 17, 'text-anchor': 'middle' }));
      });
    },
  },
  {
    id: 'enharmonic-interval-pairs',
    sources: ['99d68c0293627fcea7ee6bed18af4d5b5eeda47e.png', '41cd0fba81c5164971645814179ff8ee1586a587.png'],
    output: 'enharmonic-interval-pairs.svg',
    alt: 'A major third compared with a diminished fourth, and a minor second compared with an augmented prime.',
    width: 460,
    height: 262,
    render({ VF, context, overlay }) {
      const text = (value, x, y) => overlay.text(value, x, y, { 'font-size': 13, 'text-anchor': 'middle', fill: '#333' });
      [[0, ['g4', 'b4'], ['g4', 'cb5'], 'Major third', 'Diminished fourth'], [130, ['b4', 'c5'], ['b4', 'b#4'], 'Minor Second', 'Augmented prime']].forEach(([y, left, right, leftLabel, rightLabel]) => {
        placeNotes(VF, context, { x: 0, y: y - 10, width: 145, items: [{ x: 62, music: `${left[0]}:w` }, { x: 100, music: `${left[1]}:w` }] });
        placeNotes(VF, context, { x: 310, y: y - 10, width: 145, items: [{ x: 370, music: `${right[0]}:w` }, { x: 415, music: `${right[1]}:w` }] });
        text(leftLabel, 76, y + 110); text('sounds the same as', 223, y + 110); text(rightLabel, 387, y + 110);
      });
    },
  },
  {
    id: 'augmented-and-diminished-intervals',
    sources: ['4db15424aa05d5a4b5a3841d69ffeffbbc34f162.png'],
    output: 'augmented-and-diminished-intervals.svg',
    alt: 'Augmented and diminished intervals above G: augmented prime, diminished second, augmented third, diminished sixth, augmented seventh, diminished octave, augmented fourth, and diminished fifth.',
    width: 970,
    height: 310,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, [
        {
          measures: [['g/4', ['g/4', '#']], ['g/4', ['a/4', 'bb']], ['g/4', ['b/4', '#']], ['g/4', ['e/5', 'bb']]],
          labels: ['Augmented Prime', 'Diminished Second', 'Augmented Third', 'Diminished Sixth'],
        },
        {
          measures: [['g/4', ['f/5', '##']], ['g/4', ['g/5', 'b']], ['g/4', ['c/5', '#']], ['g/4', ['d/5', 'b']]],
          labels: ['Augmented Seventh', 'Diminished Octave', 'Augmented Fourth', 'Diminished Fifth'],
        },
      ], { rowHeight: 160, labelOffset: 124 });
    },
  },
  {
    id: 'enharmonic-chords-and-intervals',
    sources: ['b5c853589275412d74aa8b6c3cbedd069a6294b3.png'],
    output: 'enharmonic-chords-and-intervals.svg',
    alt: 'Enharmonic pairs: a diminished fourth and a major third, a minor seventh and an augmented sixth, C sharp minor and D flat minor chords, and an E diminished seventh chord respelled as a G diminished seventh.',
    width: 575,
    height: 290,
    render({ VF, context, overlay }) {
      const text = (value, x, y) => overlay.text(value, x, y, { 'font-size': 13, 'text-anchor': 'middle', fill: '#333' });
      placeNotes(VF, context, { x: 0, y: -3, width: 243, items: [{ x: 67, music: '(c4+fb4):w' }, { x: 163, music: '(c4+e4):w' }] });
      text('Diminished fourth', 82, 113); text('Major third', 197, 113);
      placeNotes(VF, context, { x: 293, y: -3, width: 244, items: [{ x: 363, music: '(g4+f5):w' }, { x: 460, music: '(g4+e#5):w' }] });
      text('Minor seventh', 357, 113); text('Augmented sixth', 487, 113);
      placeNotes(VF, context, { x: 0, y: 122, width: 247, clef: 'bass', items: [{ x: 67, music: '(c#3+e3+g#3):w' }, { x: 160, music: '(db3+fb3+ab3):w' }] });
      text('C sharp minor', 75, 238); text('D flat minor', 181, 238);
      placeNotes(VF, context, {
        x: 300, y: 122, width: 247, clef: 'bass',
        items: [{ x: 373, music: '(e2+g2+bb2+db3):w' }, { x: 427, music: '(fb2+g2+bb2+db3):w' }, { x: 490, music: '(g2+bb2+db3+fb3):w' }],
      });
      text('E diminished minor seventh', 365, 238); text('respelled (E becomes F flat)', 467, 258); text('= G diminished seventh', 492, 278);
    },
  },
  {
    id: 'approximate-vocal-ranges',
    sources: ['f16500ce77df4e1782cd94f61ad8ed4b0b584405.png'],
    output: 'approximate-vocal-ranges.svg',
    alt: 'Approximate ranges for soprano, mezzo-soprano, alto, tenor, baritone, and bass voices.',
    width: 660,
    height: 420,
    render({ VF, context, overlay }) {
      const rows = [
        { y: 10, clef: 'treble', pitches: ['c/4', 'b/5', 'a/3', 'g/5', 'g/3', 'd/5'], labels: ['Soprano', 'Mezzo Soprano', 'Alto'] },
        { y: 215, clef: 'bass', pitches: ['c/3', 'g/4', 'g/2', 'e/4', 'f/2', 'd/4'], labels: ['Tenor', 'Baritone', 'Bass'] },
      ];
      rows.forEach(({ y, clef, pitches, labels }) => {
        const { notes } = drawStave(VF, context, {
          x: 0, y, width: 660, clef, notes: pitches.map((key) => ({ key, duration: 'w' })), formatWidth: 530,
        });
        labels.forEach((label, index) => {
          const low = notes[index * 2];
          const high = notes[index * 2 + 1];
          overlay.line(noteX(low) + 14, low.getYs()[0] - 8, noteX(high) - 14, high.getYs()[0] + 18, { stroke: '#e0522b', 'stroke-width': 2 });
          overlay.text(label, (noteX(low) + noteX(high)) / 2, Math.max(low.getYs()[0], y + 90) + 34, { 'font-size': 17, 'text-anchor': 'middle' });
        });
      });
    },
  },
  {
    id: 'interval-number-answers',
    status: 'vexflow-overlay',
    sources: ['ffb90bf82bdbce7380d5bddb01b62ab9084d239b.png'],
    output: 'interval-number-answers.svg',
    alt: 'Six intervals in treble clef labelled third, fifth, octave, second, seventh, and fourth',
    width: 662,
    height: 112,
    render({ VF, context, overlay }) {
      drawIntervalRows(VF, context, overlay, [intervalNumberExercise], { y: -2, widths: [160, 95, 100, 108, 100, 99], labelOffset: 104, labelSize: 15 });
    },
  },
];
