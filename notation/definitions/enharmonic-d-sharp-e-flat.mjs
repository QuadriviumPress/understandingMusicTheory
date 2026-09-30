import { placeNotes } from '../figure-helpers.mjs';

export const definition = {
  id: 'enharmonic-d-sharp-e-flat',
  sources: ['83d12745a48c3a3f1f65ab8b3f003a09c8a1e460.png'],
  output: 'enharmonic-d-sharp-e-flat.svg',
  alt: 'D sharp and E flat written differently on a treble staff although they sound the same on a piano.',
  width: 200,
  height: 95,
  render({ VF, context }) {
    placeNotes(VF, context, { x: 0, y: -8, width: 200, items: [{ x: 75, music: 'd#4:w' }, { x: 140, music: 'eb4:w' }] });
  },
};
