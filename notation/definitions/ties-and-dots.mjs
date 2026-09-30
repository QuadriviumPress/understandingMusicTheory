export const definition = {
  id: 'ties-and-dots',
  sources: ['78e448e0e53633bbab129e0a9338f671f7aeaf2a.png'],
  output: 'ties-and-dots.svg',
  alt: 'A four-four staff of five measures: a whole note A tied to a whole note A; a dotted half note F and a quarter note G tied to a half note G; two quarter notes A, the second tied to a whole note A.',
  width: 900,
  height: 250,
  render({ VF, context, overlay }) {
    const stave = new VF.Stave(45, 75, 810).addClef('treble').addTimeSignature('4/4');
    stave.setContext(context).draw();
    const n = (key, duration) => new VF.StaveNote({ keys: [key], duration, stemDirection: 1, autoStem: false });
    const bar = () => new VF.BarNote();
    const notes = [
      n('a/4', 'w'), bar(), n('a/4', 'w'), bar(),
      n('f/4', 'hd'), n('g/4', 'q'), bar(),
      n('g/4', 'h'), n('a/4', 'q'), n('a/4', 'q'), bar(),
      n('a/4', 'w'),
    ];
    VF.Dot.buildAndAttach([notes[4]], { all: true });
    const voice = new VF.Voice({ num_beats: 20, beat_value: 4 }).setStrict(false).addTickables(notes);
    new VF.Formatter().joinVoices([voice]).format([voice], 680);
    voice.setStave(stave).draw(context, stave);
    [[0, 2], [5, 7], [9, 11]]
      .forEach(([from, to]) => new VF.StaveTie({ firstNote: notes[from], lastNote: notes[to], firstIndexes: [0], lastIndexes: [0] }).setContext(context).draw());
    overlay.text('A tie combines adjacent durations; a dot adds half the note value', 450, 220, { 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' });
  },
};
