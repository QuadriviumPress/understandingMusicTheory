import { arrowLine, drawNamedStaff } from '../figure-helpers.mjs';

const columns = [120, 181, 237, 290, 340, 395, 447, 503, 560, 612, 664, 719, 770];

export const definition = {
  id: 'treble-pitch-names',
  sources: ['847e7d248b6177b8cf0144658beed19346001782.png'],
  output: 'treble-pitch-names.svg',
  alt: 'A treble clef staff labelled with ascending note names from C below the staff through A above it.',
  width: 900,
  height: 260,
  render({ overlay }) {
    overlay.text('Treble Clef\nSymbol', 8, 20, { 'font-size': 19, 'data-line-height': 25 });
    drawNamedStaff(overlay, {
      top: 77, clef: 'treble',
      entries: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'].map((letter, index) => ({ letter, x: columns[index], step: index - 2 })),
    });
    overlay.text('etc.', 6, 252, { 'font-size': 19 });
    arrowLine(overlay, 88, 224, 52, 240);
    overlay.text('etc.', 862, 38, { 'font-size': 19 });
    arrowLine(overlay, 808, 46, 846, 34);
  },
};
