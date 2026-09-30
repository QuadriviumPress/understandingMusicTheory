import { drawMeasures, drawStave, melody, noteX } from '../figure-helpers.mjs';

const ink = '#222';
const red = '#d32f2f';
const blue = '#1769aa';
const tubeBlue = '#1565c0';

function sinePath(x, y, width, amplitude, cycles, phase = 0, samples = 96) {
  const points = [];
  for (let index = 0; index <= samples; index += 1) {
    const progress = index / samples;
    points.push(`${index ? 'L' : 'M'} ${(x + progress * width).toFixed(1)} ${(y - amplitude * Math.sin(progress * cycles * Math.PI * 2 + phase)).toFixed(1)}`);
  }
  return points.join(' ');
}

function wave(overlay, x, y, width, amplitude, cycles, attributes = {}, phase = 0) {
  overlay.path(sinePath(x, y, width, amplitude, cycles, phase), {
    fill: 'none', stroke: ink, 'stroke-width': 2.4, ...attributes,
  });
}

function arrow(overlay, x1, y1, x2, y2, attributes = {}) {
  const stroke = attributes.stroke ?? ink;
  const strokeWidth = attributes['stroke-width'] ?? 2;
  overlay.line(x1, y1, x2, y2, { stroke, 'stroke-width': strokeWidth, ...attributes });
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = 9;
  const spread = Math.PI / 7;
  overlay.line(x2, y2, x2 - length * Math.cos(angle - spread), y2 - length * Math.sin(angle - spread), { stroke, 'stroke-width': strokeWidth });
  overlay.line(x2, y2, x2 - length * Math.cos(angle + spread), y2 - length * Math.sin(angle + spread), { stroke, 'stroke-width': strokeWidth });
}

function doubleArrow(overlay, x1, y1, x2, y2, attributes = {}) {
  arrow(overlay, x1, y1, x2, y2, attributes);
  arrow(overlay, x2, y2, x1, y1, attributes);
}

function tube(overlay, x, y, width, height = 44) {
  overlay.path(`M ${x + width} ${y} H ${x + 13} Q ${x} ${y + height / 2} ${x + 13} ${y + height} H ${x + width}`, {
    fill: 'none', stroke: tubeBlue, 'stroke-width': 4,
  });
}

function standingWave(overlay, x, y, width, height, segments, attributes = {}) {
  const center = y + height / 2;
  const amplitude = height * 0.42;
  wave(overlay, x, center, width, amplitude, segments / 2, { stroke: red, 'stroke-width': 2.4, ...attributes });
  wave(overlay, x, center, width, amplitude, segments / 2, { stroke: blue, 'stroke-width': 2.4, ...attributes }, Math.PI);
}

function verticalStandingWave(overlay, x, top, height, lobes, color, phase = 0) {
  const points = [];
  for (let index = 0; index <= 80; index += 1) {
    const progress = index / 80;
    const offset = 18 * Math.sin(progress * lobes * Math.PI + phase);
    points.push(`${index ? 'L' : 'M'} ${(x + offset).toFixed(1)} ${(top + progress * height).toFixed(1)}`);
  }
  overlay.path(points.join(' '), { fill: 'none', stroke: color, 'stroke-width': 2.4 });
}

function instrumentIcon(overlay, x, y, length, angle = -32) {
  overlay.path(`M ${x} ${y} l ${length} 0 l 9 7 l -9 7 l -${length} 0 Z`, {
    fill: 'none', stroke: ink, 'stroke-width': 3, transform: `rotate(${angle} ${x} ${y})`,
  });
  [0.25, 0.45, 0.65].forEach((fraction) => overlay.circle(x + length * fraction, y + 7, 2.2, {
    fill: ink, transform: `rotate(${angle} ${x} ${y})`,
  }));
}

function pressureDots(overlay, x, y, width, height, densityCenters) {
  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column < 42; column += 1) {
      const px = x + 12 + column * (width - 24) / 41;
      const normalized = (px - x) / width;
      const dense = densityCenters.some((center) => Math.abs(normalized - center) < 0.105);
      if (!dense && (column + row * 3) % 3 === 0) continue;
      const jitterX = ((column * 17 + row * 7) % 9 - 4) * (dense ? 0.7 : 1.1);
      const jitterY = ((column * 11 + row * 13) % 7 - 3) * 0.8;
      overlay.circle(px + jitterX, y + 8 + row * (height - 16) / 4 + jitterY, dense ? 1.7 : 1.35, { fill: ink });
    }
  }
}

function airflowTube(overlay, x, y, width, directions) {
  tube(overlay, x, y, width, 42);
  directions.forEach((direction, index) => {
    const center = x + 34 + index * (width - 54) / Math.max(1, directions.length - 1);
    const length = direction === 0 ? 7 : 22;
    const color = direction < 0 ? red : ink;
    if (direction < 0) arrow(overlay, center + length / 2, y + 21, center - length / 2, y + 21, { stroke: color, 'stroke-width': 2 });
    else arrow(overlay, center - length / 2, y + 21, center + length / 2, y + 21, { stroke: color, 'stroke-width': 2 });
  });
}

function noteRows({ VF, context, overlay }, showAnswers) {
  const rows = [
    {
      y: 35,
      clef: 'treble',
      pitches: ['e/4', 'd/5', 'b/2', 'f/3', 'b/4', 'g/3', 'g/5', 'd/6'],
      labels: ['e¹', 'd²', 'B', 'f', 'b¹', 'g', 'g²', 'd³'],
    },
    {
      y: 245,
      clef: 'bass',
      pitches: ['d/3', 'g/2', 'a/1', 'e/2', 'e/4', 'a/3', 'f/1', 'a/4'],
      labels: ['d', 'G', 'AA', 'E', 'e¹', 'a', 'FF', 'a¹'],
    },
  ];
  rows.forEach(({ y, clef, pitches, labels }) => {
    const result = drawStave(VF, context, {
      x: 45, y, width: 970, clef, time: '4/4', notes: pitches.map((key) => ({ key, duration: 'w' })), formatWidth: 790,
    });
    if (showAnswers) result.notes.forEach((writtenNote, index) => overlay.text(labels[index], writtenNote.getAbsoluteX(), y + 160, {
      'font-size': 22, 'text-anchor': 'middle',
    }));
  });
}

export const definitions = [
  {
    id: 'noise-and-tone-waveforms',
    status: 'svg-overlay',
    sources: ['3255fdfd457b56d4ac1885fa0ffc56f37ee450f7.png'],
    output: 'noise-and-tone-waveforms.svg',
    alt: 'An irregular noise waveform above a smooth, evenly repeating tone waveform.',
    width: 760,
    height: 330,
    render({ overlay }) {
      overlay.text('Noise', 35, 58, { 'font-size': 24, 'font-weight': '700' });
      overlay.path('M 170 75 l 12 -37 13 67 15 -89 14 105 14 -80 13 51 15 -58 15 95 16 -118 15 106 14 -67 15 38 16 -49 15 83 14 -58 14 34 15 -13 16 8 15 -31 14 48 15 -55 15 30 14 -10', {
        fill: 'none', stroke: ink, 'stroke-width': 3,
      });
      overlay.text('Tone', 35, 238, { 'font-size': 24, 'font-weight': '700' });
      wave(overlay, 170, 225, 520, 48, 4.5, { 'stroke-width': 3 });
      overlay.line(170, 225, 690, 225, { stroke: '#777', 'stroke-width': 1 });
    },
  },
  {
    id: 'transverse-and-longitudinal-waves',
    status: 'svg-overlay',
    sources: ['87fc144fb9a501e2269617319472d5543b51a420.png'],
    output: 'transverse-and-longitudinal-waves.svg',
    alt: 'Longitudinal compressions and a transverse sine wave both moving left to right; transverse peaks are labelled high and low.',
    width: 900,
    height: 360,
    render({ overlay }) {
      arrow(overlay, 330, 35, 390, 35);
      arrow(overlay, 760, 35, 820, 35);
      overlay.text('All waves are moving left to right', 605, 42, { 'font-size': 20, 'text-anchor': 'middle' });
      overlay.text('Longitudinal waves', 35, 128, { 'font-size': 22, 'font-weight': '700' });
      overlay.text('Waves “pile up” left to right', 35, 163, { 'font-size': 18 });
      for (let index = 0; index < 110; index += 1) {
        const band = index % 27;
        const px = 370 + index * 4.1 + (band > 15 ? (band - 15) * 2.3 : 0);
        overlay.circle(px, 103 + ((index * 29) % 80), 1.8, { fill: ink });
      }
      overlay.text('Transverse waves', 35, 268, { 'font-size': 22, 'font-weight': '700' });
      overlay.text('Waves “pile up” up and down', 35, 303, { 'font-size': 18 });
      wave(overlay, 390, 266, 420, 52, 3.25, { 'stroke-width': 3 });
      overlay.text('High', 492, 205, { 'font-size': 17, 'text-anchor': 'middle' });
      overlay.text('Low', 556, 335, { 'font-size': 17, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'amplitude-wavelength-and-displacement',
    status: 'svg-overlay',
    sources: ['d9d282a798bfcd3b0b60329222e1bc0c72659209.png'],
    output: 'amplitude-wavelength-and-displacement.svg',
    alt: 'A wave diagram marking amplitude, wavelength, zero-displacement crossings, and maximum-displacement peaks and troughs.',
    width: 800,
    height: 240,
    render({ overlay }) {
      const axisY = 105;
      const amplitude = 62;
      const x0 = 40;
      const period = 145;
      overlay.line(0, axisY, 580, axisY, { stroke: ink, 'stroke-width': 2 });
      wave(overlay, x0, axisY, period * 3.5, amplitude, 3.5, { 'stroke-width': 2.4 });
      doubleArrow(overlay, 76, axisY, 76, axisY - amplitude + 2, { stroke: ink, 'stroke-width': 2 });
      overlay.text('Amplitude', 78, 38, { 'font-size': 18, 'text-anchor': 'middle' });
      doubleArrow(overlay, 228, 45, 360, 45, { stroke: ink, 'stroke-width': 2 });
      overlay.text('Wavelength', 290, 20, { 'font-size': 18, 'text-anchor': 'middle' });
      [330, 402.5].forEach((x) => overlay.circle(x, axisY, 4.5, { fill: blue }));
      overlay.text('No', 368, 192, { fill: blue, 'font-size': 18, 'text-anchor': 'middle' });
      overlay.text('displacement', 428, 220, { fill: blue, 'font-size': 18, 'text-anchor': 'middle' });
      arrow(overlay, 355, 172, 334, 114, { stroke: blue, 'stroke-width': 2 });
      arrow(overlay, 385, 172, 404, 114, { stroke: blue, 'stroke-width': 2 });
      overlay.circle(511, axisY - amplitude, 4.5, { fill: red });
      overlay.circle(438.5, axisY + amplitude, 4.5, { fill: red });
      overlay.text('Most displacement', 602, 128, { fill: red, 'font-size': 18 });
      arrow(overlay, 598, 110, 522, 52, { stroke: red, 'stroke-width': 2 });
      arrow(overlay, 598, 132, 452, 166, { stroke: red, 'stroke-width': 2 });
    },
  },
  {
    id: 'wave-amplitude-and-loudness',
    status: 'svg-overlay',
    sources: ['582059d7c9ff6cc4f68e0e34f31334de997b3225.png'],
    output: 'wave-amplitude-and-loudness.svg',
    alt: 'Two waves of equal frequency: the larger-amplitude wave is labelled louder and the smaller-amplitude wave softer.',
    width: 860,
    height: 340,
    render({ overlay }) {
      overlay.text('Louder', 35, 105, { 'font-size': 24, 'font-weight': '700' });
      wave(overlay, 175, 105, 630, 70, 4.5, { 'stroke-width': 3 });
      overlay.text('Softer', 35, 267, { 'font-size': 24, 'font-weight': '700' });
      wave(overlay, 175, 255, 630, 30, 4.5, { 'stroke-width': 3 });
    },
  },
  {
    id: 'wavelength-frequency-and-pitch',
    status: 'svg-overlay',
    sources: ['f882296c6ffb55550eea86029fdf3d0472f446e5.png'],
    output: 'wavelength-frequency-and-pitch.svg',
    alt: 'Short waves arrive more frequently and make a high sound; long waves arrive less frequently and make a low sound.',
    width: 900,
    height: 500,
    render({ overlay }) {
      overlay.text('The waves travel at about the same speed, so the number reaching the ear differs.', 450, 42, {
        'font-size': 20, 'text-anchor': 'middle',
      });
      [255, 415, 575, 735].forEach((x) => arrow(overlay, x, 75, x + 55, 75, { stroke: '#555' }));
      instrumentIcon(overlay, 55, 130, 60);
      wave(overlay, 160, 155, 600, 28, 8, { stroke: red, 'stroke-width': 3 });
      doubleArrow(overlay, 420, 205, 495, 205, { stroke: red, 'stroke-width': 2 });
      overlay.text('Short wavelength: many waves, high frequency, high pitch', 465, 245, {
        fill: red, 'font-size': 21, 'font-weight': '700', 'text-anchor': 'middle',
      });
      instrumentIcon(overlay, 55, 325, 86);
      wave(overlay, 160, 345, 600, 45, 3, { stroke: blue, 'stroke-width': 3 });
      doubleArrow(overlay, 350, 415, 550, 415, { stroke: blue, 'stroke-width': 2 });
      overlay.text('Long wavelength: fewer waves, low frequency, low pitch', 465, 465, {
        fill: blue, 'font-size': 21, 'font-weight': '700', 'text-anchor': 'middle',
      });
      overlay.text('EAR', 840, 254, { 'font-size': 22, 'font-weight': '700', 'text-anchor': 'middle' });
    },
  },
  {
    id: 'harmonic-series-standing-waves',
    status: 'svg-overlay',
    sources: ['aa67fb155f2f0a86a459138ef2af6da96c5b86d0.png'],
    output: 'harmonic-series-standing-waves.svg',
    alt: 'A string fixed at both ends vibrating as the fundamental (first harmonic) and as the first, second, and third overtones (second, third, and fourth harmonics), with one to four loops.',
    width: 640,
    height: 490,
    render({ overlay }) {
      const waveRed = '#e8423a';
      const waveBlue = '#3a74c2';
      [195, 637].forEach((x) => overlay.line(x, 5, x, 405, { stroke: '#555', 'stroke-width': 2 }));
      [[50, 1, 25], [128, 2, 25], [218, 3, 25], [342, 4, 24]].forEach(([centre, loops, amplitude]) => {
        // The fundamental starts with red above; the overtones start with blue above.
        const upper = loops === 1 ? waveRed : waveBlue;
        const lower = loops === 1 ? waveBlue : waveRed;
        wave(overlay, 197, centre, 438, amplitude, loops / 2, { stroke: upper, 'stroke-width': 2 });
        wave(overlay, 197, centre, 438, amplitude, loops / 2, { stroke: lower, 'stroke-width': 2 }, Math.PI);
      });
      [['Fundamental\n1st Harmonic', 50], ['First Overtone\n2nd Harmonic', 135], ['Second Overtone\n3rd Harmonic', 221], ['Third Overtone\n4th Harmonic', 307], ['And so on...', 393]].forEach(([text, y]) => {
        overlay.text(text, 0, y, { 'font-size': 19, 'data-line-height': 29, fill: '#222' });
      });
      [415, 448, 480].forEach((y) => overlay.circle(378, y, 2, { fill: '#111' }));
    },
  },
  {
    id: 'standing-wave-nodes-and-antinodes',
    status: 'svg-overlay',
    sources: ['2cebbec9e75194690ae93a7479c224f1a9ceb90c.png'],
    output: 'standing-wave-nodes-and-antinodes.svg',
    alt: 'Two opposite phases of a standing wave, with fixed nodes at their crossings and antinodes at their widest separations.',
    width: 760,
    height: 390,
    render({ overlay }) {
      standingWave(overlay, 75, 155, 610, 110, 5);
      for (let index = 0; index <= 5; index += 1) overlay.circle(75 + index * 122, 210, 5, { fill: ink });
      for (let index = 0; index < 5; index += 1) {
        const x = 136 + index * 122;
        overlay.circle(x, index % 2 ? 256 : 164, 5, { fill: index % 2 ? blue : red });
      }
      overlay.text('Nodes', 225, 48, { 'font-size': 23, 'font-weight': '700', 'text-anchor': 'middle' });
      arrow(overlay, 205, 63, 197, 200);
      arrow(overlay, 245, 63, 319, 200);
      overlay.text('Antinodes', 380, 360, { 'font-size': 23, 'font-weight': '700', 'text-anchor': 'middle' });
      arrow(overlay, 355, 338, 380, 266, { stroke: red });
      arrow(overlay, 405, 338, 502, 164, { stroke: blue });
    },
  },
  {
    id: 'standing-waves-that-fit-a-string',
    status: 'svg-overlay',
    sources: ['e60460159d584b4cee88054dd5b5b21f26360e82.png'],
    output: 'standing-waves-that-fit-a-string.svg',
    alt: 'Whole, half, third, and fourth standing waves fit a fixed string because both ends are nodes; two offset waves do not fit.',
    width: 980,
    height: 620,
    render({ overlay }) {
      overlay.line(45, 80, 700, 80, { stroke: '#555', 'stroke-width': 2 });
      overlay.line(45, 390, 700, 390, { stroke: '#555', 'stroke-width': 2 });
      const labels = ['Whole', 'Halves', 'Thirds', 'Fourths'];
      labels.forEach((label, index) => {
        const x = 110 + index * 170;
        overlay.text(label, x, 55, { 'font-size': 20, 'font-weight': '700', 'text-anchor': 'middle' });
        overlay.circle(x, 80, 5, { fill: ink });
        overlay.circle(x, 390, 5, { fill: ink });
        verticalStandingWave(overlay, x, 80, 310, index + 1, ink);
        verticalStandingWave(overlay, x, 80, 310, index + 1, red, Math.PI);
        overlay.text(String(index + 1), x, 425, { 'font-size': 18, 'text-anchor': 'middle' });
      });
      overlay.text('Fundamental', 110, 457, { 'font-size': 19, 'font-weight': '700', 'text-anchor': 'middle' });
      overlay.text('and so on…', 790, 55, { 'font-size': 20 });
      overlay.text('But not:', 775, 170, { 'font-size': 20, 'font-weight': '700', 'text-anchor': 'middle' });
      overlay.line(720, 195, 850, 195, { stroke: '#555', 'stroke-width': 2 });
      overlay.line(720, 505, 850, 505, { stroke: '#555', 'stroke-width': 2 });
      verticalStandingWave(overlay, 770, 225, 280, 2.7, ink);
      verticalStandingWave(overlay, 800, 195, 270, 2.5, red, Math.PI);
      overlay.text('The endpoints are not both nodes.', 785, 555, { fill: red, 'font-size': 17, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'shortened-vibrating-string',
    status: 'svg-overlay',
    sources: ['e0b9eed69d190c563d6d76312a33fbfa5dbc8412.png'],
    output: 'shortened-vibrating-string.svg',
    alt: 'A long string and a finger-shortened string, each vibrating between fixed nodes; the shorter string has the shorter wavelength.',
    width: 580,
    height: 330,
    render({ overlay }) {
      overlay.text('Open string', 35, 48, { 'font-size': 20, 'font-weight': '700' });
      overlay.line(75, 85, 515, 85, { stroke: '#555', 'stroke-width': 2 });
      overlay.circle(75, 85, 6, { fill: ink });
      overlay.circle(515, 85, 6, { fill: ink });
      standingWave(overlay, 75, 85, 440, 115, 1);
      overlay.text('Finger shortens the vibrating length', 35, 225, { 'font-size': 20, 'font-weight': '700' });
      overlay.line(190, 262, 515, 262, { stroke: '#555', 'stroke-width': 2 });
      overlay.circle(190, 262, 7, { fill: ink });
      overlay.circle(515, 262, 6, { fill: ink });
      standingWave(overlay, 190, 220, 325, 84, 1);
      arrow(overlay, 145, 310, 187, 272, { stroke: red, 'stroke-width': 3 });
      overlay.text('finger', 85, 316, { fill: red, 'font-size': 18 });
    },
  },
  {
    id: 'wind-instrument-displacement-standing-waves',
    status: 'svg-overlay',
    sources: ['ee9aecb40a9a873169c66730312aa16f7ee68e2a.png'],
    output: 'wind-instrument-displacement-standing-waves.svg',
    alt: 'Three closed-open tube standing waves shown first as transverse displacement curves, then as paired diagrams of air moving in opposite directions.',
    width: 1000,
    height: 700,
    render({ overlay }) {
      overlay.text('Closed–open tube displacement waves', 280, 32, { 'font-size': 22, 'font-weight': '700', 'text-anchor': 'middle' });
      for (let index = 0; index < 3; index += 1) {
        const y = 65 + index * 85;
        overlay.text(`${index + 1}.`, 25, y + 32, { 'font-size': 18, 'font-weight': '700' });
        tube(overlay, 55, y, 480, 55);
        wave(overlay, 68, y + 29, 467, 25, index / 2 + 0.25, { stroke: red, 'stroke-width': 2 });
        wave(overlay, 68, y + 29, 467, 25, index / 2 + 0.25, { stroke: ink, 'stroke-width': 2 }, Math.PI);
      }
      overlay.text('Nodes occur at closed ends and antinodes at open ends. The curves represent air motion', 580, 80, { 'font-size': 17 });
      overlay.text('back and forth, not side-to-side motion inside the tube.', 580, 108, { 'font-size': 17 });
      overlay.text('Paired states of air movement', 500, 335, { 'font-size': 21, 'font-weight': '700', 'text-anchor': 'middle' });
      const patterns = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, -1, -1, -1],
        [1, 1, 0, -1, -1, 0, 1],
      ];
      patterns.forEach((pattern, index) => {
        const y = 380 + index * 95;
        overlay.text(`${index + 1}.`, 25, y + 28, { 'font-size': 18, 'font-weight': '700' });
        airflowTube(overlay, 55, y, 370, pattern);
        doubleArrow(overlay, 460, y + 21, 505, y + 21, { stroke: '#555' });
        airflowTube(overlay, 540, y, 370, pattern.map((value) => -value));
      });
      overlay.text('Long arrows show greater air displacement; short arrows show nodes.', 500, 675, {
        'font-size': 17, 'text-anchor': 'middle',
      });
    },
  },
  {
    id: 'wind-instrument-pressure-standing-waves',
    status: 'svg-overlay',
    sources: ['6b12a444aaa164fe7d1a98fa4f84eebd6aa3c9c5.png'],
    output: 'wind-instrument-pressure-standing-waves.svg',
    alt: 'Three closed-open tube harmonics shown as pressure curves and as alternating high- and low-density air patterns.',
    width: 1000,
    height: 700,
    render({ overlay }) {
      overlay.text('Pressure standing waves in a closed–open tube', 500, 32, { 'font-size': 23, 'font-weight': '700', 'text-anchor': 'middle' });
      for (let index = 0; index < 3; index += 1) {
        const y = 65 + index * 83;
        overlay.text(`${index + 1}.`, 25, y + 30, { 'font-size': 18, 'font-weight': '700' });
        tube(overlay, 55, y, 430, 55);
        wave(overlay, 68, y + 28, 417, 25, index / 2 + 0.25, { stroke: red, 'stroke-width': 2 });
        wave(overlay, 68, y + 28, 417, 25, index / 2 + 0.25, { stroke: ink, 'stroke-width': 2 }, Math.PI);
      }
      overlay.text('For pressure waves, nodes are at open ends and pressure antinodes are at closed ends.', 530, 92, { 'font-size': 17 });
      overlay.text('Pressure at an open end remains at room pressure; closed ends alternate high and low pressure.', 530, 122, { 'font-size': 17 });
      const densityPairs = [
        [[0.82], [0.16]],
        [[0.32], [0.07, 0.78]],
        [[0.18, 0.72], [0.05, 0.5]],
      ];
      densityPairs.forEach(([left, right], index) => {
        const y = 370 + index * 95;
        overlay.text(`${index + 1}.`, 25, y + 28, { 'font-size': 18, 'font-weight': '700' });
        tube(overlay, 55, y, 370, 48);
        pressureDots(overlay, 55, y, 370, 48, left);
        doubleArrow(overlay, 460, y + 24, 505, y + 24, { stroke: '#555' });
        tube(overlay, 540, y, 370, 48);
        pressureDots(overlay, 540, y, 370, 48, right);
      });
      overlay.text('Dense regions indicate high pressure; sparse regions indicate low pressure.', 500, 675, {
        'font-size': 17, 'text-anchor': 'middle',
      });
    },
  },
  {
    id: 'instrument-length-wavelength-and-pitch',
    status: 'svg-overlay',
    sources: ['d1156e89d761fd0b2c7989ae3f41998b094037e5.png'],
    output: 'instrument-length-wavelength-and-pitch.svg',
    alt: 'A small, a medium, and a large recorder beside waves of short, medium, and long wavelength: the longer the instrument, the longer the wavelength and the lower the pitch.',
    width: 625,
    height: 505,
    render({ overlay }) {
      // A recorder drawn along its own axis, then rotated into place.
      const recorder = (cx, cy, length, width, angle, holes) => {
        const transform = `rotate(${angle} ${cx} ${cy})`;
        const [top, bottom] = [cy - length / 2, cy + length / 2];
        overlay.path(`M ${cx - width / 2} ${top + 6} Q ${cx - width / 2} ${top} ${cx} ${top} Q ${cx + width / 2} ${top} ${cx + width / 2} ${top + 6} V ${bottom - 10} L ${cx + width * 0.8} ${bottom} H ${cx - width * 0.8} L ${cx - width / 2} ${bottom - 10} Z`, {
          fill: 'white', stroke: '#111', 'stroke-width': 2.2, transform,
        });
        for (let hole = 0; hole < holes; hole += 1) overlay.circle(cx, top + length * (0.3 + hole * 0.08), 2.4, { fill: '#111', transform });
      };
      recorder(34, 50, 70, 12, -35, 0);
      wave(overlay, 75, 58, 522, 32, 8, { stroke: '#111', 'stroke-width': 2 });
      recorder(36, 180, 115, 15, -32, 6);
      wave(overlay, 87, 203, 521, 35, 4, { stroke: '#111', 'stroke-width': 2 });
      recorder(67, 385, 225, 20, 0, 6);
      overlay.path('M 60 275 Q 45 262 32 282 Q 24 292 18 282', { fill: 'none', stroke: '#111', 'stroke-width': 1.6 });
      wave(overlay, 95, 392, 527, 38, 2, { stroke: '#111', 'stroke-width': 2 });
    },
  },
  {
    id: 'simultaneous-string-harmonics',
    status: 'svg-overlay',
    sources: ['4c5da51d92f04c619005c9a2d674d36e27ace398.png'],
    output: 'simultaneous-string-harmonics.svg',
    alt: 'A fixed string vibrating simultaneously as a whole and in halves, thirds, and fourths, with each pattern labelled by harmonic number.',
    width: 980,
    height: 500,
    render({ overlay }) {
      overlay.line(45, 85, 830, 85, { stroke: '#555', 'stroke-width': 2 });
      overlay.line(45, 405, 830, 405, { stroke: '#555', 'stroke-width': 2 });
      ['Whole', 'Halves', 'Thirds', 'Fourths'].forEach((label, index) => {
        const x = 125 + index * 205;
        overlay.text(label, x, 55, { 'font-size': 21, 'font-weight': '700', 'text-anchor': 'middle' });
        overlay.circle(x, 85, 6, { fill: ink });
        overlay.circle(x, 405, 6, { fill: ink });
        verticalStandingWave(overlay, x, 85, 320, index + 1, ink);
        verticalStandingWave(overlay, x, 85, 320, index + 1, red, Math.PI);
        overlay.text(String(index + 1), x, 440, { 'font-size': 19, 'text-anchor': 'middle' });
      });
      overlay.text('Fundamental', 125, 476, { 'font-size': 20, 'font-weight': '700', 'text-anchor': 'middle' });
      overlay.text('and so on…', 875, 55, { 'font-size': 20, 'text-anchor': 'middle' });
    },
  },
  {
    id: 'harmonic-frequency-waveforms',
    status: 'svg-overlay',
    sources: ['6e98c07a7efbb518d9a08be043a9311988da9a98.png'],
    output: 'harmonic-frequency-waveforms.svg',
    alt: 'Six sine waves of the same length containing one through six complete cycles, the frequencies of the first six harmonics.',
    width: 612,
    height: 665,
    render({ overlay }) {
      for (let harmonic = 1; harmonic <= 6; harmonic += 1) {
        const centre = 45 + (harmonic - 1) * 116;
        overlay.text(String(harmonic), 0, centre + 7, { 'font-size': 20 });
        wave(overlay, 50, centre, 558, 33, harmonic, { stroke: '#111', 'stroke-width': 2 });
      }
    },
  },
  {
    id: 'octave-wave-alignment',
    status: 'svg-overlay',
    sources: ['6347bf784fdbeb47837008e0094e0f22a269aa69.png'],
    output: 'octave-wave-alignment.svg',
    alt: 'A lower wave and a wave one octave higher aligned at regular boundaries; the higher wave completes two cycles for each lower-wave cycle.',
    width: 860,
    height: 390,
    render({ overlay }) {
      overlay.text('Lower note', 35, 115, { 'font-size': 21, 'font-weight': '700' });
      overlay.text('One octave higher', 35, 285, { 'font-size': 21, 'font-weight': '700' });
      wave(overlay, 210, 115, 600, 55, 4, { 'stroke-width': 3 });
      wave(overlay, 210, 285, 600, 45, 8, { 'stroke-width': 3 });
      for (let index = 0; index <= 4; index += 1) {
        const x = 210 + index * 150;
        overlay.line(x, 45, x, 355, { stroke: '#ef5350', 'stroke-width': 2.5 });
      }
      overlay.text('2× frequency', 510, 378, { fill: red, 'font-size': 19, 'font-weight': '700', 'text-anchor': 'middle' });
    },
  },
  {
    id: 'helmholtz-octave-naming-example',
    status: 'vexflow-overlay',
    sources: ['3c685067aa0d4183c9daa43d662382ef87efc702.png'],
    output: 'helmholtz-octave-naming-example.svg',
    alt: 'Notes in treble and bass clef labelled with Helmholtz octave names: g′, f″, f‴, b, f, d′, A, and BB.',
    width: 710,
    height: 178,
    render({ VF, context, overlay }) {
      const treble = drawMeasures(VF, context, { x: 0, y: 19, widths: [124, 76, 73, 79], time: 'C', endBar: 'single', measures: [melody('g4:w'), melody('f5:w'), melody('f6:w'), melody('b3:w')] });
      const bass = drawMeasures(VF, context, { x: 352, y: 19, widths: [79, 78, 76, 89], clef: 'bass', endBar: 'end', measures: [melody('f3:w'), melody('d4:w'), melody('a2:w'), melody('b1:w')] });
      const labels = [['g', 'i'], ['f', 'ii'], ['f', 'iii'], ['b', ''], ['f', ''], ['d', 'i'], ['A', ''], ['BB', '']];
      [...treble, ...bass].forEach(({ notes }, index) => {
        const [letter, mark] = labels[index];
        const x = noteX(notes[0]);
        const serif = { 'font-family': 'Georgia, "Times New Roman", serif', 'font-weight': '700', fill: '#222' };
        overlay.text(letter, x, 161, { ...serif, 'font-size': 16, 'text-anchor': mark ? 'end' : 'middle' });
        if (mark) overlay.text(mark, x + 3, 152, { ...serif, 'font-size': 12 });
      });
    },
  },
  {
    id: 'octave-naming-practice',
    status: 'vexflow-overlay',
    sources: ['9ccaa35c2e2f92fdf3c76c341017b4aa750c273e.png'],
    output: 'octave-naming-practice.svg',
    alt: 'Sixteen notes on treble and bass staves to identify using Helmholtz octave names.',
    width: 1060,
    height: 455,
    render(args) { noteRows(args, false); },
  },
  {
    id: 'octave-naming-practice-solutions',
    status: 'vexflow-overlay',
    sources: ['ed856404348dfc76ae8067fe2bd38f568a480dea.png'],
    output: 'octave-naming-practice-solutions.svg',
    alt: 'The octave-naming exercise answered with e¹, d², B, f, b¹, g, g², d³, d, G, AA, E, e¹, a, FF, and a¹.',
    width: 1060,
    height: 455,
    render(args) { noteRows(args, true); },
  },
  {
    id: 'piano-key-names-with-sharps-and-flats',
    status: 'svg-overlay',
    sources: ['ab320208243366fcd4af5e9894a9766f2b219d97.png'],
    output: 'piano-key-names-with-sharps-and-flats.svg',
    alt: 'One octave of piano keys from A through the next A, numbered one through eight, with black keys labelled by sharp and flat enharmonic names.',
    width: 850,
    height: 390,
    render({ overlay }) {
      const x = 65;
      const y = 35;
      const whiteWidth = 90;
      const whiteHeight = 285;
      const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'];
      overlay.path(`M ${x} ${y} H ${x + names.length * whiteWidth} V ${y + whiteHeight} H ${x} Z`, {
        fill: 'white', stroke: ink, 'stroke-width': 2,
      });
      names.forEach((name, index) => {
        if (index) overlay.line(x + index * whiteWidth, y, x + index * whiteWidth, y + whiteHeight, { stroke: ink, 'stroke-width': 2 });
        overlay.text(name, x + (index + 0.5) * whiteWidth, y + 218, { 'font-size': 22, 'text-anchor': 'middle' });
        overlay.text(String(index + 1), x + (index + 0.5) * whiteWidth, y + 263, { fill: red, 'font-size': 21, 'font-weight': '700', 'text-anchor': 'middle' });
      });
      const blackKeys = [
        { after: 0, sharp: 'A♯', flat: 'B♭' },
        { after: 2, sharp: 'C♯', flat: 'D♭' },
        { after: 3, sharp: 'D♯', flat: 'E♭' },
        { after: 5, sharp: 'F♯', flat: 'G♭' },
        { after: 6, sharp: 'G♯', flat: 'A♭' },
      ];
      blackKeys.forEach(({ after, sharp, flat }) => {
        const center = x + (after + 1) * whiteWidth;
        overlay.path(`M ${center - 28} ${y} H ${center + 28} V ${y + 158} H ${center - 28} Z`, { fill: ink, stroke: ink });
        overlay.text(sharp, center, y + 80, { fill: 'white', 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' });
        overlay.text(flat, center, y + 112, { fill: 'white', 'font-size': 18, 'font-weight': '700', 'text-anchor': 'middle' });
      });
      overlay.text('White keys are natural notes; black keys have enharmonic sharp and flat names.', 425, 365, {
        'font-size': 19, 'text-anchor': 'middle',
      });
    },
  },
];
