import { drawStave } from '../figure-helpers.mjs';

export const definition = {
  id: 'b-flat-in-every-octave',
  sources: ['4216daa4328f8456a887e88bd49184ab8697d084.png'],
  output: 'b-flat-in-every-octave.svg',
  alt: 'A treble staff with one flat in the key signature and B notes in three octaves, all of which are B flats.',
  width: 460,
  height: 190,
  render({ VF, context }) {
    drawStave(VF, context, {
      x: 0, y: 25, width: 460, key: 'F', formatWidth: 340,
      notes: ['b/4', 'b/5', 'b/3'].map((key) => ({ key, duration: 'w' })),
    });
  },
};
