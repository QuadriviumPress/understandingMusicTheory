import { drawMeasures, noteX } from '../figure-helpers.mjs';

export const definition = {
  id: 'accidental-symbols',
  sources: ['7bdb702ae46b9f046bc9e058e4fb2172d4d4a597.png'],
  output: 'accidental-symbols.svg',
  alt: 'Sharp, natural, and flat symbols shown above a staff with D-sharp, D-natural, and D-flat notes.',
  width: 820,
  height: 400,
  render({ VF, context, overlay }) {
    [['Sharp Symbol', '♯', 160], ['Natural Symbol', '♮', 465], ['Flat Symbol', '♭', 740]].forEach(([label, symbol, x]) => {
      overlay.text(label, x, 45, { 'font-size': 21, 'font-weight': '700', 'text-anchor': 'middle' });
      overlay.text(symbol, x, 125, { 'font-size': 64, 'text-anchor': 'middle' });
    });
    const measures = drawMeasures(VF, context, {
      x: 0, y: 170, widths: [330, 245, 245], key: 'Bb', time: '4/4',
      measures: [['#'], ['n'], ['b']].map(([accidental]) => [{ key: 'd/5', duration: 'w', accidental }]),
    });
    ['D sharp', 'D natural', 'D flat'].forEach((label, index) => {
      overlay.text(label, noteX(measures[index].notes[0]), 196, { 'font-size': 20, 'text-anchor': 'middle' });
    });
    overlay.text('Key\nsignature:\n2 flats\n(B flat major)', 48, 300, { 'font-size': 19, 'data-line-height': 28 });
  },
};
