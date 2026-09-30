export const definition = {
  id: 'whole-rest-full-measure',
  sources: ['2749a1f9ce0ab7e901f61b6858a33354bba8033d.png'],
  output: 'whole-rest-full-measure.svg',
  alt: 'A whole rest fills a complete measure in six-eight time; in two-four time, a measure of two quarter notes (G and C) is followed by a measure containing a whole rest.',
  width: 820,
  height: 330,
  render({ VF, context, overlay }) {
    [['6/8', 55], ['2/4', 190]].forEach(([time, y]) => {
      const first = new VF.Stave(50, y, 350).addClef('treble').addTimeSignature(time);
      const second = new VF.Stave(400, y, 350);
      first.setContext(context).draw();
      second.setContext(context).draw();
      [first, second].forEach((stave, index) => {
        const ticks = time === '2/4' && index === 0
          ? [new VF.StaveNote({ keys: ['g/4'], duration: 'q' }).setStemDirection(1), new VF.StaveNote({ keys: ['c/5'], duration: 'q' }).setStemDirection(1)]
          : [new VF.StaveNote({ keys: ['b/4'], duration: 'wr' })];
        const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).setStrict(false)
          .addTickables(ticks);
        new VF.Formatter().joinVoices([voice]).format([voice], 180);
        voice.setStave(stave).draw(context, stave);
      });
    });
    overlay.text('A whole rest can represent one complete silent measure', 410, 315, { 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' });
  },
};
