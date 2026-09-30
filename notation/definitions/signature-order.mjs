export const definition = {
  id: 'signature-order',
  sources: ['d50860c797fd51831afff0c564476d8e63f8143b.png'],
  output: 'signature-order.svg',
  alt: 'A treble clef followed by a two-sharp key signature and a three-four time signature.',
  width: 620,
  height: 230,
  render({ VF, context, overlay }) {
    const stave = new VF.Stave(60, 75, 500).addClef('treble').addKeySignature('D').addTimeSignature('3/4');
    stave.setContext(context).draw();
    overlay.text('Clef', 82, 195, { 'font-size': 18, 'text-anchor': 'middle' });
    overlay.text('Key signature', 170, 35, { fill: '#1769aa', 'font-size': 18, 'text-anchor': 'middle' });
    overlay.text('Time signature', 285, 195, { fill: '#b3261e', 'font-size': 18, 'text-anchor': 'middle' });
  },
};
