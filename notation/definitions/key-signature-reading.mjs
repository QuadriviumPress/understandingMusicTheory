import { placeNotes } from '../figure-helpers.mjs';

const red = '#e5251b';
const blue = '#1f5fbf';

// A stave whose clef and key signature are drawn in red, as in the source.
function redSignatureStave(VF, context, { x, y, width, clef, key, items }) {
  const stave = new VF.Stave(x, y, width).addClef(clef).addKeySignature(key);
  stave.getModifiers().forEach((modifier) => {
    if (modifier instanceof VF.Clef || modifier instanceof VF.KeySignature) modifier.setStyle({ fillStyle: red, strokeStyle: red });
  });
  stave.setBegBarType(VF.BarlineType.NONE).setEndBarType(VF.BarlineType.NONE).setContext(context).draw();
  placeNotes(VF, context, { x, y, width, clef: null, noteClef: clef, beginBar: 'none', items });
}

export const definition = {
  id: 'key-signature-reading',
  sources: ['f55fb28bd8a6394d7cdcacddfa5cf7ce92c1ca53.png'],
  output: 'key-signature-reading.svg',
  alt: 'With two flats in treble clef, notes in the top space are E flat and notes on the fourth line are D natural; with three sharps in bass clef, notes in the top space are G sharp and notes on the fourth line are F sharp.',
  width: 664,
  height: 185,
  render({ VF, context, overlay }) {
    const text = (value, x, y, fill) => overlay.text(value, x, y, { 'font-size': 15, 'data-line-height': 20, fill });
    text('On this staff:', 6, 14, '#333'); text('On this staff:', 338, 14, '#333');
    redSignatureStave(VF, context, { x: 17, y: 46, width: 243, clef: 'treble', key: 'Bb', items: [{ x: 143, music: 'e5:w', extra: { color: blue } }, { x: 234, music: 'd5:w', extra: { color: blue } }] });
    redSignatureStave(VF, context, { x: 374, y: 46, width: 240, clef: 'bass', key: 'A', items: [{ x: 502, music: 'g3:w', extra: { color: blue } }, { x: 584, music: 'f3:w', extra: { color: blue } }] });
    text('Notes in top space\nare E flat', 6, 47, blue); text('Notes on fourth line\nare D Natural', 171, 42, blue);
    text('Notes in top space\nare G sharp', 340, 51, blue); text('Notes on fourth line\nare F sharp', 503, 40, blue);
    [[122, 59, 136, 82], [203, 76, 225, 93], [444, 66, 484, 89], [565, 70, 577, 89]].forEach(([x1, y1, x2, y2]) => overlay.line(x1, y1, x2, y2, { stroke: blue, 'stroke-width': 1.3 }));
    text('Treble\nClef', 0, 151, red); text('Key signature\nhas 2 flats', 64, 140, red);
    text('Bass\nClef', 358, 138, red); text('Key signature has\nthree sharps', 406, 141, red);
  },
};
