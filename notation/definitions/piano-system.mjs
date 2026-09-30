import { noteX } from '../figure-helpers.mjs';

export const definition = {
  id: 'piano-system',
  sources: ['4bf971ff8e9d7002fb3539c064b9a8d2ca601677.png'],
  output: 'piano-system.svg',
  alt: 'A vocal staff in D major with the lyric "Where have you been all the day," above two braced piano staves (treble and bass) in common time, all joined by a line at the left and the piano staves joined at the right barline.',
  width: 820,
  height: 480,
  render({ VF, context, overlay }) {
    const vocal = new VF.Stave(260, 50, 500).addClef('treble').addKeySignature('D').addTimeSignature('C');
    const rightHand = new VF.Stave(260, 175, 500).addClef('treble').addKeySignature('D').addTimeSignature('C');
    const leftHand = new VF.Stave(260, 285, 500).addClef('bass').addKeySignature('D').addTimeSignature('C');
    [vocal, rightHand, leftHand].forEach((stave) => stave.setContext(context).draw());
    new VF.StaveConnector(rightHand, leftHand).setType(VF.StaveConnector.type.BRACE).setContext(context).draw();
    new VF.StaveConnector(vocal, leftHand).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(context).draw();
    new VF.StaveConnector(rightHand, leftHand).setType(VF.StaveConnector.type.SINGLE_RIGHT).setContext(context).draw();
    const drawVoice = (stave, specs, beamGroups = [], clef = 'treble') => {
      const notes = specs.map(([key, duration, stem]) => new VF.StaveNote({
        keys: [key], clef, duration, stemDirection: stem ?? 1, autoStem: false,
      }));
      const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).setStrict(false).addTickables(notes);
      new VF.Formatter().joinVoices([voice]).format([voice], 380);
      const beams = beamGroups.map(([from, to]) => new VF.Beam(notes.slice(from, to)));
      voice.draw(context, stave);
      beams.forEach((beam) => beam.setContext(context).draw());
      return notes;
    };
    const vocalNotes = drawVoice(vocal, [['f/4', '8'], ['f/4', '8'], ['f/4', '8'], ['f/4', '8'], ['f/4', '8'], ['e/4', '8'], ['d/4', 'q']]);
    drawVoice(rightHand, [['b/4', 'qr'], ['f/3', '8'], ['a/3', '8'], ['d/4', '8'], ['f/4', '8'], ['a/4', '8'], ['d/5', '8']], [[1, 3], [3, 7]]);
    drawVoice(leftHand, [['d/2', '8'], ['a/2', '8'], ['d/3', 'h', -1], ['f/3', 'q', -1]], [[0, 2]], 'bass');
    ['Where', 'have', 'you', 'been', 'all', 'the', 'day,'].forEach((word, index) => {
      overlay.text(word, noteX(vocalNotes[index]), 155, { 'font-size': 14, 'text-anchor': 'middle' });
    });
    overlay.text('Vocal line', 112, 110, { 'font-size': 20 });
    overlay.text('The two staves of a piano part\n(left hand and right hand)\nare usually also connected\nby a brace.', 12, 235, { 'font-size': 15 });
    overlay.text('Staves that are to be played at the same time\nare connected at least by a line at the end.\nThey may also be connected at each bar line.', 280, 428, { 'font-size': 16 });
  },
};
