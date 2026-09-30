import { drawStave, drawMeasures, melody, noteX } from '../figure-helpers.mjs';

function wholeNoteStave(VF, context, y) {
  const stave = new VF.Stave(55, y, 790).addClef('treble').addTimeSignature('C');
  stave.setContext(context).draw();
  const notes = Array.from({ length: 5 }, () => new VF.StaveNote({ keys: ['c/5'], duration: 'w' }));
  const voice = new VF.Voice({ num_beats: 20, beat_value: 4 }).setStrict(false).addTickables(notes);
  new VF.Formatter().joinVoices([voice]).format([voice], 630);
  voice.setStave(stave).draw(context, stave);
}

export const definitions = [
  {
    id: 'tempo-and-meter-examples',
    sources: ['5a8209d773fa3b65be50ec156c652a8d8389e5c1.png'],
    output: 'tempo-and-meter-examples.svg',
    alt: 'Examples showing how tempo markings combine with four-four, cut, and six-eight time (quarter note = 88, half note = 120, dotted quarter = 80, and eighth note = 148).',
    width: 900,
    height: 470,
    render({ VF, context, overlay }) {
      const rows = [['4/4', '♩ = 88', 'Four-four time: 88 quarter-note beats per minute'], ['C|', '𝅗𝅥 = 120', 'Cut time: 120 half-note beats per minute'], ['6/8', '♩. = 80', 'Six-eight time: about 80 dotted-quarter beats per minute'], ['6/8', '♪ = 148', 'Six-eight time: 148 eighth notes per minute']];
      rows.forEach(([time, tempo, explanation], index) => {
        const y = 35 + index * 105;
        const stave = new VF.Stave(45, y, 210).addClef('treble').addTimeSignature(time);
        stave.setContext(context).draw();
        overlay.text(tempo, 275, y + 38, { 'font-size': 19 });
        overlay.text(explanation, 395, y + 38, { 'font-size': 17 });
      });
    },
  },
  {
    id: 'repeat-barlines',
    sources: ['b4c37691fafd379d87d5be52dc7271c4a6364cba.png'],
    output: 'repeat-barlines.svg',
    alt: 'Two staves in cut time. The first has four measures (C, two A half notes, G, C) ending in a repeat sign that returns to the beginning. The second has two measures, then a repeat-begin sign, two measures (G and A half notes; B and G half notes) and a repeat-end sign, with a brace marking the repeated measures.',
    width: 900,
    height: 330,
    render({ VF, context, overlay }) {
      const first = new VF.Stave(50, 55, 800).addClef('treble').addTimeSignature('C|');
      first.setEndBarType(VF.Barline.type.REPEAT_END).setContext(context).draw();
      const second = new VF.Stave(50, 185, 800).addClef('treble').addTimeSignature('C|');
      second.setEndBarType(VF.Barline.type.REPEAT_END).setContext(context).draw();
      const n = (key, duration, stem) => new VF.StaveNote({ keys: [key], duration, stemDirection: stem, autoStem: false });
      const bar = (type = VF.Barline.type.SINGLE) => new VF.BarNote(type);
      const drawRow = (stave, items) => {
        const voice = new VF.Voice({ num_beats: 16, beat_value: 4 }).setStrict(false).addTickables(items);
        new VF.Formatter().joinVoices([voice]).format([voice], 640);
        voice.setStave(stave).draw(context, stave);
      };
      drawRow(first, [n('c/5', 'w', 1), bar(), n('a/4', 'h', 1), n('a/4', 'h', 1), bar(), n('g/4', 'w', 1), bar(), n('c/5', 'w', 1)]);
      const repeatStart = bar(VF.Barline.type.REPEAT_BEGIN);
      drawRow(second, [n('c/5', 'w', 1), bar(), n('d/5', 'h', -1), n('c/5', 'h', -1), repeatStart,
        n('g/4', 'h', 1), n('a/4', 'h', 1), bar(), n('b/4', 'h', -1), n('g/4', 'h', 1)]);
      const braceX = repeatStart.getAbsoluteX() + 6;
      const mid = (braceX + 850) / 2;
      overlay.path(`M ${braceX} 262 Q ${braceX} 274 ${braceX + 14} 274 H ${mid - 10} Q ${mid} 274 ${mid} 282 Q ${mid} 274 ${mid + 10} 274 H ${846 - 14} Q 846 274 846 262`, { fill: 'none', stroke: '#111', 'stroke-width': 2 });
      overlay.text('Go all the way back to the beginning and repeat once.', 450, 160, { 'font-size': 18, 'text-anchor': 'middle' });
      overlay.text('Repeat (once) only the measures in between the repeat dots.', 450, 305, { 'font-size': 18, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'dynamic-vocabulary',
    sources: ['f2b61cfd8801b8d1548d9d7df76190770472186e.png'],
    output: 'dynamic-vocabulary.svg',
    alt: 'Dynamic markings from mezzo forte to fortissississimo and from mezzo piano to pianissississimo, with their Italian names, meanings, and pronunciations.',
    width: 985,
    height: 690,
    render({ overlay }) {
      const rows = [
        ['', 30, 'mezzo forte', 'medium loud  (pronounced "MET-soh FOR-tay")'],
        ['', 92, 'forte', 'loud ("FOR-tay")'],
        ['', 153, 'fortissimo', 'very loud ("for-TISS-im-oh")'],
        ['', 215, 'fortisissimo', 'very, very loud ("FOR-tiss-SISS-im-oh")'],
        ['', 272, 'and so on...'],
        ['', 400, 'mezzo piano', 'medium quiet ("MET-soh PYAN-oh")'],
        ['', 460, 'piano', 'quiet ("PYAN-oh")'],
        ['', 530, 'pianissimo', 'very quiet ("PEE-an-ISS-im-oh")', 522],
        ['', 600, 'pianississimo', 'very, very quiet ("PEE-an-iss-ISS-im-oh")', 583],
        ['', 670, 'and so on...', undefined, 645],
      ];
      const bold = { 'font-size': 22, 'font-weight': '700' };
      rows.forEach(([glyph, y, term, meaning, textY = y]) => {
        overlay.text(glyph, 4, y + 8, { 'font-family': 'Bravura', 'font-size': 58, fill: '#111' });
        overlay.text(term, 178, textY, bold);
        if (meaning) {
          overlay.text('=', 356, textY, { ...bold, 'text-anchor': 'middle' });
          overlay.text(meaning, 432, textY, bold);
        }
      });
    },
  },
  {
    id: 'gradual-dynamics',
    sources: ['0da96940e079272e14f867fb6afe50aab934db38.png'],
    output: 'gradual-dynamics.svg',
    alt: 'Three ways to write a gradual change from piano to forte and back: cresc. and decresc., cresc. and dim., and crescendo and decrescendo hairpins.',
    width: 546,
    height: 350,
    render({ VF, context, overlay }) {
      const dynamic = (glyph, x, y) => overlay.text(glyph, x, y, { 'font-family': 'Bravura', 'font-size': 32, 'text-anchor': 'middle', fill: '#111' });
      const word = (value, x, y) => overlay.text(value, x, y, { 'font-family': 'Georgia, serif', 'font-style': 'italic', 'font-weight': '700', 'font-size': 14, 'text-anchor': 'middle' });
      const dash = (x, y) => overlay.line(x - 5, y - 5, x + 5, y - 5, { stroke: '#111', 'stroke-width': 1.5 });
      [[-27, 'decresc.'], [93, 'dim.'], [218, null]].forEach(([y, fall]) => {
        drawMeasures(VF, context, { x: 0, y, widths: [148, 94, 91, 109, 104], time: 'C', measures: Array.from({ length: 5 }, () => melody('a4:w')) });
        const textY = y + 117;
        dynamic('', 83, textY); dynamic('', 275, textY); dynamic('', 488, textY);
        if (fall) {
          word('cresc.', 156, textY); dash(204, textY); dash(242, textY);
          word(fall, fall === 'dim.' ? 361 : 373, textY); dash(425, textY); dash(458, textY);
        } else {
          overlay.path(`M 246 ${textY - 12} L 98 ${textY - 7} L 246 ${textY - 2}`, { fill: 'none', stroke: '#111', 'stroke-width': 1.6 });
          overlay.path(`M 321 ${textY - 12} L 467 ${textY - 7} L 321 ${textY - 2}`, { fill: 'none', stroke: '#111', 'stroke-width': 1.6 });
        }
      });
    },
  },
  {
    id: 'tie-example',
    sources: ['22b5ae512ec83d6deb1ceb4ddee6e040e09b7d52.png'],
    output: 'tie-example.svg',
    alt: 'Two half notes, G and E above the staff and in the top space, joined by a tie before the barline.',
    width: 720,
    height: 230,
    render({ VF, context, overlay }) {
      const stave = new VF.Stave(55, 65, 610).addClef('treble').addTimeSignature('C');
      stave.setContext(context).draw();
      const notes = [new VF.StaveNote({ keys: ['g/5'], duration: 'h' }).setStemDirection(-1), new VF.StaveNote({ keys: ['e/5'], duration: 'h' }).setStemDirection(-1)];
      const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).setStrict(false).addTickables(notes);
      new VF.Formatter().joinVoices([voice]).format([voice], 430);
      voice.setStave(stave).draw(context, stave);
      new VF.StaveTie({ firstNote: notes[0], lastNote: notes[1], firstIndexes: [0], lastIndexes: [0] }).setContext(context).draw();
      overlay.text('Tie: sustain the first note through the second', 360, 205, { 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' });
    },
  },
  {
    id: 'articulation-sampler',
    sources: ['7c179b36f452ae1939fc4bfc193fb62e59a75154.png'],
    output: 'articulation-sampler.svg',
    alt: 'A three-four passage of D quarter notes marked with staccato and tenuto (portato), slurred staccato, accents combined with staccato and tenuto, and marcato.',
    width: 660,
    height: 170,
    render({ VF, context, overlay }) {
      const marks = [['a.', 'a-'], ['a.', 'a-'], ['a.', 'a-'], ['a.'], ['a.'], ['a.'], ['a.', 'a>'], ['a-', 'a>'], []];
      const quarters = marks.map((articulations) => ({ key: 'd/5', duration: 'q', articulations }));
      const { notes } = drawStave(VF, context, {
        x: 0, y: 30, width: 660, time: '3/4', formatWidth: 540,
        notes: [...quarters.slice(0, 3), { bar: 'single' }, ...quarters.slice(3, 6), { bar: 'single' }, ...quarters.slice(6)],
      });
      const [x1, x2] = [noteX(notes[4]), noteX(notes[6])];
      overlay.path(`M ${x1 - 6} 50 Q ${(x1 + x2) / 2} 26 ${x2 + 6} 50`, { fill: 'none', stroke: '#111', 'stroke-width': 2.2 });
      overlay.text('marcato...', 578, 55, { 'font-size': 15, 'font-style': 'italic', 'font-weight': '700', 'font-family': 'Georgia, serif' });
    },
  },
];
