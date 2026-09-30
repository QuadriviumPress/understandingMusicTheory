import { drawStave } from '../figure-helpers.mjs';

export const definition = {
  id: 'enharmonic-key-signatures',
  sources: ['cbfa55d933eebda424353b4e388f6efa93374438.png'],
  output: 'enharmonic-key-signatures.svg',
  alt: 'The E flat major key signature, with three flats, beside the enharmonic D sharp major key signature, with two double sharps and five sharps.',
  width: 440,
  height: 95,
  render({ VF, context }) {
    drawStave(VF, context, { x: 0, y: -12, width: 190, key: 'Eb', beginBar: 'none', endBar: 'none' });
    drawStave(VF, context, { x: 250, y: -12, width: 190, key: ['C#', ['##', '##', '#', '#', '#', '#', '#']], beginBar: 'none', endBar: 'none' });
  },
};
