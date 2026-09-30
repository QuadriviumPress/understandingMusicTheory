export const definition = {
  id: 'c-clefs',
  sources: ['64c29809ac6c72db4b257c2f609c46335c115990.png'],
  output: 'c-clefs.svg',
  alt: 'Five C clefs—soprano, mezzo-soprano, alto, tenor, and baritone—on one staff, each centred on a different line that it marks as middle C, with a middle C whole note after each.',
  width: 900,
  height: 300,
  render({ overlay }) {
    const lines = [170, 143.25, 116.5, 89.75, 63];
    lines.forEach((y) => overlay.line(0, y, 900, y, { stroke: '#333', 'stroke-width': 2 }));
    const clefs = [
      [20, 110, 'Soprano\nClef', 45, 250], [205, 290, 'Mezzo Soprano\nClef', 230, 237], [378, 458, 'Alto\nClef', 405, 215],
      [550, 632, 'Tenor\nClef', 568, 205], [720, 802, 'Baritone\nClef', 760, 192],
    ];
    clefs.forEach(([clefX, noteX, label, labelX, labelY], index) => {
      const y = lines[index];
      overlay.text('', clefX, y, { 'font-family': 'Bravura', 'font-size': 66, fill: '#111' });
      overlay.text('', noteX, y, { 'font-family': 'Bravura', 'font-size': 66, fill: '#111', 'text-anchor': 'middle' });
      overlay.text(label, labelX, labelY, { 'font-size': 22, 'text-anchor': 'middle', 'data-line-height': 30 });
    });
  },
};
