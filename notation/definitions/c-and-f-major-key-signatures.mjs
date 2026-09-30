export const definition = {
  id: 'c-and-f-major-key-signatures',
  sources: ['8859d5d2572195fac36408d32de9539a6f696b09.png'],
  output: 'c-and-f-major-key-signatures.svg',
  alt: 'C major has no sharps or flats; F major has one flat in its key signature.',
  width: 450,
  height: 112,
  render({ VF, context, overlay }) {
    new VF.Stave(0, -2, 215).addClef('treble').setEndBarType(VF.BarlineType.DOUBLE).setContext(context).draw();
    const fMajor = new VF.Stave(215, -2, 235).setBegBarType(VF.BarlineType.NONE).setEndBarType(VF.BarlineType.NONE);
    fMajor.addKeySignature('F').setContext(context).draw();
    overlay.text('C major', 45, 15, { 'font-size': 14 });
    overlay.text('F major', 227, 15, { 'font-size': 14 });
  },
};
