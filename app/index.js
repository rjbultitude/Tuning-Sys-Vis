import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import './global.css';

const sketchFn = (p5Sketch) => {
  const config = {
    playing: false,
    fft: null,
    grainSize: 10,
    mouseInCanvas: false
  };
  // Form controls
  const waveControls = document.controls.wave;
  const grainControl = document.controls.grainSize;
  let waveType = waveControls.value || 'sine';
  // Sound source
  const osc = new p5.Oscillator(waveType);

  function changeWave() {
    osc.setType(waveType);
  }

  function setupWaveControls() {
    for (let index = 0; index < waveControls.length; index++) {
      waveControls[index].addEventListener('change', function() {
        waveType = this.value;
        changeWave();
      });
    }
  }

  function setUpGrainControl() {
    grainControl.addEventListener('change', function() {
      config.grainSize = this.value;
    });
  }

  function constrainAndPlay() {
    // Constrain playback to canvas
    const freq = p5Sketch.constrain(p5Sketch.map(p5Sketch.mouseX, 0, p5Sketch.width, 10, 2024), 10, 2024);
    if (p5Sketch.mouseY < p5Sketch.height && p5Sketch.mouseY > 0) {
      config.mouseInCanvas = true;
    } else {
      config.mouseInCanvas = false;
    }
    if (config.playing && config.mouseInCanvas) {
      osc.freq(freq);
    }
  }

  function drawFreqs() {
    const spectrum = config.fft.analyze();
    p5Sketch.noStroke();
    for (let i = 0; i< spectrum.length; i++){
      let r = p5Sketch.map(i, 0, spectrum.length, 50, 255);
      let b = p5Sketch.map(i, 0, spectrum.length, 255, 50);
      let x = p5Sketch.map(i, 0, spectrum.length, p5Sketch.width, 0);
      let y = p5Sketch.map(spectrum[i], 0, 255, p5Sketch.height, 0);
      p5Sketch.fill(r, 50, b);
      p5Sketch.ellipse(x, y, config.grainSize);
    }
  }

  p5Sketch.preload = function preload() {
    osc = new p5.Oscillator(waveType);
  }

  p5Sketch.setup = function setup() {
    let cnv = p5Sketch.createCanvas(1920,1080);
    cnv.parent('wrapper');
    cnv.mouseClicked(togglePlay);
    setupWaveControls();
    setUpGrainControl();
    config.fft = new p5.FFT();
    osc.amp(0.2);
  }

  p5Sketch.draw = function draw() {
    p5Sketch.background(0, 0, 0);
    constrainAndPlay();
    drawFreqs();
  }

  function togglePlay() {
    if (config.playing) {
      osc.stop();
      config.playing = false;
    } else {
      osc.start();
      config.playing = true;
    }
  }

  return {
    changeWave,
    setupWaveControls,
    setUpGrainControl,
    constrainAndPlay,
    drawFreqs
  };
}

const P5 = new p5(sketchFn);
export default P5;
