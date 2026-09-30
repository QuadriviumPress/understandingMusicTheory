import { drawRhythmEquation } from '../figure-helpers.mjs';

export const definition = {
  id: 'dotted-note-equations',
  sources: ['b2f53b8fe81baba62a2f0351451a7587266069df.png'],
  output: 'dotted-note-equations.svg',
  alt: 'A dotted whole note equals a whole plus a half note; a dotted half equals a half plus a quarter; a dotted quarter equals a quarter plus an eighth.',
  width: 150,
  height: 170,
  render({ VF, context, overlay }) {
    [['f4:w.', 'f4:w', 'f4:h', 30], ['f4:h.', 'f4:h', 'f4:q', 88], ['f4:q.', 'f4:q', 'f4:8', 144]].forEach(([dotted, first, second, headY]) => {
      drawRhythmEquation(VF, context, overlay, [
        { x: 9, music: dotted }, { x: 44, text: '=', size: 18 }, { x: 72, music: first }, { x: 102, text: '+', size: 18 }, { x: 131, music: second },
      ], { headY });
    });
  },
};
