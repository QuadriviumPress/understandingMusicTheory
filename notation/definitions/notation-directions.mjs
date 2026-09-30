export const definition = {
  id: 'notation-directions',
  sources: ['00081e8549fa81c9cc33f0859bf191fb238b07bf.png'],
  output: 'notation-directions.svg',
  alt: 'A staff in 4/4 labelled with tempo (Allegro, quarter note = 120), one measure containing a half rest, a quarter rest, and a quarter note, rests, accented notes, and dynamic markings (p and a crescendo).',
  width: 760,
  height: 240,
  render({ VF, context, overlay }) {
    const stave = new VF.Stave(40, 92, 670).addClef('treble').addTimeSignature('4/4');
    stave.setContext(context).draw();
    const notes = [
      new VF.StaveNote({ keys: ['b/4'], duration: 'wr' }),
      new VF.BarNote(),
      new VF.StaveNote({ keys: ['d/5'], duration: 'hr' }),
      new VF.StaveNote({ keys: ['b/4'], duration: 'qr' }),
      new VF.StaveNote({ keys: ['g/4'], duration: 'q' }),
      new VF.BarNote(),
      new VF.StaveNote({ keys: ['c/5'], duration: 'q' }),
      new VF.StaveNote({ keys: ['d/5'], duration: 'q' }),
      new VF.StaveNote({ keys: ['e/5'], duration: 'q' }).addModifier(new VF.Articulation('a>').setPosition(VF.Modifier.Position.ABOVE), 0),
      new VF.StaveNote({ keys: ['f/5'], duration: 'q' }).addModifier(new VF.Articulation('a>').setPosition(VF.Modifier.Position.ABOVE), 0),
    ];
    const voice = new VF.Voice({ num_beats: 12, beat_value: 4 }).setStrict(false).addTickables(notes);
    new VF.Formatter().joinVoices([voice]).format([voice], 540);
    voice.draw(context, stave);
    overlay.text('Allegro', 66, 40, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('Tempo markings', 66, 20, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('♩ = 120', 70, 62, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('One measure', 323, 44, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.path('M 218 72 Q 323 28 429 72', { fill: 'none', stroke: '#111', 'stroke-width': 3 });
    overlay.text('Rests', 290, 128, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('Accents', 620, 56, { fill: '#1769aa', 'text-anchor': 'middle' });
    overlay.text('Dynamic markings', 495, 220, { fill: '#b3261e', 'text-anchor': 'middle' });
    overlay.text('p', 410, 185, { fill: '#b3261e', 'font-style': 'italic', 'font-size': 26 });
    overlay.path('M 458 187 L 638 190 L 458 193', { fill: 'none', stroke: '#b3261e', 'stroke-width': 2 });
  },
};
