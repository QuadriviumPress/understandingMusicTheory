import { drawMeasures } from '../figure-helpers.mjs';

export const definition = {
  id: 'key-signature-accidentals',
  sources: ['d5fbd204f80fa9fe24ff054c8d36e40421292834.png'],
  output: 'key-signature-accidentals.svg',
  alt: 'In D major every C is C sharp in any octave unless an accidental such as a natural sign changes it.',
  width: 500,
  height: 128,
  render({ VF, context, overlay }) {
    drawMeasures(VF, context, {
      x: 0, y: 8, widths: [155, 98, 105, 105], key: 'D', time: 'C',
      measures: [[{ key: 'c/5', duration: 'w' }], [{ key: 'c/4', duration: 'w' }], [{ key: 'c/6', duration: 'w' }], [{ key: 'c/5', duration: 'w', accidental: 'n' }]],
    });
    const text = (value, x, y) => overlay.text(value, x, y, { 'font-size': 14, 'text-anchor': 'middle', fill: '#333' });
    text('(C sharp)', 110, 33); text('(C sharp)', 199, 118); text('(C sharp)', 289, 12); text('(accidental C natural)', 427, 37);
  },
};
