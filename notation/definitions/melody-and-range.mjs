import { drawMeasures, melody, noteX } from '../figure-helpers.mjs';

export const definitions = [
  {
    id: 'melodic-contour',
    sources: ['c32e677198a253273e91fa742ab010574fb28de7.png'],
    output: 'melodic-contour.svg',
    alt: 'A melody that rises from C to a high C and then falls to A, with a red curve tracing its contour.',
    width: 320,
    height: 88,
    render({ VF, context, overlay }) {
      const measures = drawMeasures(VF, context, {
        x: 0, y: -28, widths: [75, 102, 66, 75], spread: 0.8,
        measures: [melody('c4'), melody('c4 e4 g4'), melody('c5:h.'), melody('a4:h.')],
      });
      // The contour rises from below the second C to the high C and falls towards the final A.
      const [start, peak, end] = [noteX(measures[1].notes[0]) - 22, noteX(measures[2].notes[0]), noteX(measures[3].notes[0]) - 10];
      overlay.path(`M ${start} 64 Q ${peak - 25} -12 ${end} 42`, { fill: 'none', stroke: '#e5251b', 'stroke-width': 2.6 });
    },
  },
  {
    id: 'vocal-range-example',
    sources: ['402dd0fcd9295e3f332d3afc3f834bb36322a789.png'],
    output: 'vocal-range-example.svg',
    alt: 'Two whole notes from low C to high G connected by a red line to illustrate musical range.',
    width: 680,
    height: 260,
    render({ VF, context, overlay }) {
      const stave = new VF.Stave(55, 60, 570).addClef('treble');
      stave.setContext(context).draw();
      const notes = [new VF.StaveNote({ keys: ['c/4'], duration: 'w' }), new VF.StaveNote({ keys: ['g/5'], duration: 'w' })];
      const voice = new VF.Voice({ num_beats: 8, beat_value: 4 }).setStrict(false).addTickables(notes);
      new VF.Formatter().joinVoices([voice]).format([voice], 390);
      voice.setStave(stave).draw(context, stave);
      overlay.line(190, 175, 480, 85, { stroke: '#d32f2f', 'stroke-width': 4 });
      overlay.text('Range from low C to high G', 340, 230, { 'font-size': 19, 'font-weight': '700', 'text-anchor': 'middle' });
    },
  },
];
