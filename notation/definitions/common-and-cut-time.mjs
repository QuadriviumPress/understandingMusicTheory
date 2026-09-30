export const definition = {
  id: 'common-and-cut-time',
  sources: ['475b22aebf81fa1ea80faef5e6f79f78d2ffa09d.png'],
  output: 'common-and-cut-time.svg',
  alt: 'Common-time and cut-time symbols compared with four-four and two-two numerical time signatures.',
  width: 375,
  height: 230,
  render({ VF, context, overlay }) {
    const examples = [
      [0, -19, 'C', '"Common time"', 92, 95], [216, -19, '4/4', 'Four four time', 275, 95],
      [0, 84, 'C|', '" Cut time "', 78, 225], [216, 84, '2/2', 'Two two time', 275, 225],
    ];
    examples.forEach(([x, y, time, label, labelX, labelY]) => {
      const stave = new VF.Stave(x, y, 159).addClef('treble').addTimeSignature(time);
      stave.setBegBarType(VF.BarlineType.NONE).setEndBarType(VF.BarlineType.NONE).setContext(context).draw();
      overlay.text(label, labelX, labelY, { 'font-size': 14, 'text-anchor': 'middle', fill: '#333' });
    });
    overlay.text('=', 186, 95, { 'font-size': 14, 'text-anchor': 'middle', fill: '#333' });
    overlay.text('=', 189, 225, { 'font-size': 14, 'text-anchor': 'middle', fill: '#333' });
  },
};
