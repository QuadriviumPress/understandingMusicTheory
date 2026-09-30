import { noteX } from '../figure-helpers.mjs';

export const definition = {
  id: 'staff-anatomy',
  sources: ['e9c7307b9a2752128fb6dbf906ddb725735750df.png'],
  output: 'staff-anatomy.svg',
  alt: 'A labelled staff showing clef, key and time signatures, a note in a space (A) and a note on a line (B), a ledger-line legend, a bar line, a double bar line, and a heavy double bar line.',
  width: 760,
  height: 220,
  render({ VF, context, overlay }) {
    const stave = new VF.Stave(48, 62, 650);
    stave.addClef('treble').addKeySignature('D').addTimeSignature('4/4');
    stave.setEndBarType(VF.Barline.type.NONE).setContext(context).draw();
    const notes = [
      new VF.StaveNote({ keys: ['a/4'], duration: 'w' }),
      new VF.StaveNote({ keys: ['b/4'], duration: 'w' }),
    ];
    const voice = new VF.Voice({ num_beats: 8, beat_value: 4 }).setStrict(false);
    voice.addTickables(notes);
    new VF.Formatter().joinVoices([voice]).format([voice], 380);
    // noteX is stave-relative before drawing; the stave content starts about 158px in.
    [256, 429].forEach((target, index) => notes[index].setXShift(target - 158 - noteX(notes[index])));
    voice.draw(context, stave);
    overlay.line(350, 62, 350, 142, { stroke: '#b3261e', 'stroke-width': 2 });
    overlay.line(507, 62, 507, 142, { stroke: '#b3261e', 'stroke-width': 2 });
    overlay.line(514, 62, 514, 142, { stroke: '#b3261e', 'stroke-width': 2 });
    overlay.line(690, 62, 690, 142, { stroke: '#b3261e', 'stroke-width': 2 });
    overlay.line(697, 62, 697, 142, { stroke: '#b3261e', 'stroke-width': 5 });
    overlay.ellipse(640, 24, 7, 4.5, { fill: 'none', stroke: '#1769aa', 'stroke-width': 2.5 });
    overlay.line(630, 34, 650, 34, { stroke: '#1769aa', 'stroke-width': 1.5 });
    overlay.text('Ledger lines', 662, 30, { fill: '#1769aa', 'font-size': 15 });
    overlay.text('Clef symbol', 42, 170, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('Key signature', 134, 25, { fill: '#1769aa', 'text-anchor': 'middle' });
    overlay.text('Time signature', 205, 170, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('Note in a space', 262, 25, { fill: '#1769aa', 'text-anchor': 'middle' });
    overlay.text('Note on a line', 435, 25, { fill: '#1769aa', 'text-anchor': 'middle' });
    overlay.text('Bar line', 350, 170, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('Double bar line', 500, 170, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('Heavy double bar line', 655, 170, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('Music on a staff is read from left to right', 380, 210, { 'font-weight': '700', 'text-anchor': 'middle' });
  },
};
