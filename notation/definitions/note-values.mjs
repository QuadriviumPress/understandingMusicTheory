import { noteX } from '../figure-helpers.mjs';

export const definition = {
  id: 'note-values',
  sources: ['58f7babd6a79d85b58a149a716fd1b943e004d1d.png'],
  output: 'note-values.svg',
  alt: 'Whole, half, quarter, eighth, sixteenth, and thirty-second notes arranged from longest to shortest.',
  width: 920,
  height: 260,
  render({ VF, context, overlay }) {
    const stave = new VF.Stave(40, 75, 840).addClef('treble');
    stave.setContext(context).draw();
    const entries = [['w', 'Whole'], ['h', 'Half'], ['q', 'Quarter'], ['8', 'Eighth'], ['16', 'Sixteenth'], ['32', 'Thirty-second']];
    const notes = entries.map(([duration]) => new VF.StaveNote({ keys: ['b/4'], duration }));
    const voice = new VF.Voice({ num_beats: 8, beat_value: 4 }).setStrict(false).addTickables(notes);
    new VF.Formatter().joinVoices([voice]).format([voice], 700);
    voice.setStave(stave).draw(context, stave);
    entries.forEach(([, label], index) => overlay.text(`${label}\nnote`, noteX(notes[index]) + (index === 5 ? 18 : index === 4 ? -6 : 0), 205, { 'font-size': 14, 'text-anchor': 'middle', 'data-line-height': 18 }));
  },
};
