import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import * as audioControls from './audio-controllers.js';
import * as freqiCtrls from './freqi-controls';

const document = {
  visualControls: {
    grainSize: 2,
    freqRangeLow: 100,
    freqRangeHigh: 200
  },
  audioControls: {
    waveType: 'sine'
  },
  getElementById: function(str) {
    return str;
  }
}

const DOMEls = {
  grainControl: document.visualControls.grainSize,
  waveControls: document.audioControls.waveType,
  pitchControl: document.getElementById('freqPitch'),
  sliders: {
    spectrumControlLow: document.visualControls.freqRangeLow,
    spectrumControlHigh: document.visualControls.freqRangeHigh,
  },
  sliderTextNode: document.getElementById('rangeValueText'),
  grainTextNode: document.getElementById('grainValueText'),
  freqTextNode: document.getElementById('audioOutputFreq'),
  statusTextNode: document.getElementById('audioOutputStatus'),
}

describe('createTuningSystems', function() {
  beforeEach(function() {
    this.config = {
      tuningSystems: null,
      tuningSysNotes: {
        'eqTemp': []
      },
      freqiTuningSysMeta: {
        'eqTemp': {
          shortName: 'Equal Temperament'
        }
      }
    }
  });
  it('should add a Map to config', function () {
    const tuningSys = audioControls.createTuningSystems(this.config).tuningSystems;
    expect(tuningSys instanceof Map).to.be.true;
  });
});

describe('getVolForWaveType', function() {
  it('should return a number even if no argument is passed', function() {
    expect(audioControls.getVolForWaveType()).to.be.a('number');
  });
  it('should return 0.08 if argument is sawtooth', function() {
    expect(audioControls.getVolForWaveType('sawtooth')).to.equal(0.08);
  });
  it('should return 0.75 if argument is sine', function() {
    expect(audioControls.getVolForWaveType('sine')).to.equal(0.75);
  });
  it('should return 0.35 if argument is triangle', function() {
    expect(audioControls.getVolForWaveType('triangle')).to.equal(0.35);
  });
  it('should return 0.03 if argument is square', function() {
    expect(audioControls.getVolForWaveType('square')).to.equal(0.03);
  });
});

describe('changeWave', function () {
  this.beforeEach(function () {
    this.config = {
      playing: false,
      fft: null,
      osc: {
        setType: function (waveType) {
          return waveType;
        },
        amp: function(volume) {
          return volume;
        },
        started: true,
      },
      grainSize: 10,
      mouseInCanvas: false,
    };
    this.setTypeSpy = sinon.spy(this.config.osc, 'setType');
    this.ampSpy = sinon.spy(this.config.osc, 'amp');
  });
  it('should return the first argument', function () {
    expect(audioControls.changeWave('sawtooth', this.config)).to.equal('sawtooth');
  });
  it('should call the setType method', function () {
    audioControls.changeWave('sawtooth', this.config);
    expect(this.setTypeSpy).calledOnce;
  });
  it('should call the amp method when osc started is true', function () {
    audioControls.changeWave('sawtooth', this.config);
    expect(this.ampSpy).calledOnce;
  });
});

describe('togglePlay', function () {
  this.beforeEach(function () {
    this.configPlaying = {
      playing: true,
      osc: {
        start: function () {},
        stop: function () {},
      },
    };
    this.configStopped = {
      playing: false,
      osc: {
        start: function () {},
        stop: function () {},
      },
    };
    this.updateAudioOutput = () => {};
    this.startSpy = sinon.spy(this.configStopped.osc, 'start');
    this.stopSpy = sinon.spy(this.configPlaying.osc, 'stop');
  });
  this.afterEach(function () {
    sinon.restore();
  });
  it('should set playing to false if playing is true', function () {
    expect(audioControls.togglePlay({ config: this.configPlaying, updateAudioOutput: this.updateAudioOutput }).playing).to.be.false;
  });
  it('should set playing to true if playing is false', function () {
    expect(audioControls.togglePlay({ config: this.configStopped, updateAudioOutput: this.updateAudioOutput }).playing).to.be.true;
  });
  it('should call play method if playing is false', function () {
    audioControls.togglePlay({config: this.configStopped, updateAudioOutput: this.updateAudioOutput });
    expect(this.startSpy).calledOnce;
  });
  it('should call stop method if playing is true', function () {
    audioControls.togglePlay({ config: this.configPlaying, updateAudioOutput: this.updateAudioOutput });
    expect(this.stopSpy).calledOnce;
  });
});

describe('setupPlayModeControls', function () {
  this.beforeEach(function () {
    this.config = {
      playMode: '',
    };
    this.DomNode = function DomNode() {
      this.addEventListener = function () {
        return this;
      };
      this.options = {
        one: 'oneShot'
      };
    };
    this.playModeControl = new this.DomNode();
    this.addEventSpy = sinon.spy(this.playModeControl, 'addEventListener');
  });
  this.afterEach(function () {
    sinon.restore();
  });
  it('should add an event listener to the arg playModeControl', function () {
    audioControls.setupWaveControls(this.config, this.playModeControl);
    expect(this.addEventSpy).calledOnce;
  });
});

describe('playModeCallBack', function() {
  beforeEach(function() {
    this.config = {
      playMode: ''
    };
    this.playModeCrlEvent = {
      target: {
        options: [{
          value: 'oneShot'
        }],
        selectedIndex: 0,
      }
    }
  });
  it('should set config playMode to selected value', function () {
    audioControls.playModeCallBack(this.playModeCrlEvent, this.config);
    expect(this.config.playMode).to.equal(this.playModeCrlEvent.target.options[0].value);
  });
});

describe('setupWaveControls', function () {
  this.beforeEach(function () {
    this.config = {};
    this.DomNode = function DomNode() {
      this.addEventListener = function () {
        return this;
      };
      this.value = 'sawtooth';
    };
    this.waveControl = new this.DomNode();
    this.addEventSpy = sinon.spy(this.waveControl, 'addEventListener');
  });
  this.afterEach(function () {
    sinon.restore();
  });
  it('should called changeWave when changed', function () {
    audioControls.setupWaveControls(this.config, this.waveControl);
    expect(this.addEventSpy).calledOnce;
  });
});

describe('setupPitchControls', function () {
  this.beforeEach(function () {
    this.config = {};
    this.DomNode = function DomNode() {
      this.addEventListener = function () {
        return this;
      };
    };
    this.pitchControl = new this.DomNode();
    this.addEventSpy = sinon.spy(this.pitchControl, 'addEventListener');
  });
  this.afterEach(function () {
    sinon.restore();
  });
  it('should set an event listener', function () {
    audioControls.setupWaveControls(this.config, this.pitchControl);
    expect(this.addEventSpy).calledOnce;
  });
});

describe('pitchCrlCallBack', function() {
  beforeEach(function() {
    this.config = {
      startFreq: null,
      currentFreq: 0,
      intervalsRange: {
        lower: 1,
        upper: 2
      },
      tuningSysNotes: {
        eqTemp: [200],
      },
      selectedTuningSys: 'eqTemp',
      selectedInterval: 0,
      osc: {
        started: false,
        freq: () => {}
      }
    };
    this.pitchCrlEvent = {
      target: {
        value: '400'
      }
    };
    this.pitchCrlEventNumber = {
      target: {
        value: 400
      }
    };
    this.fn = () => {};
  });
  it('should set config startFreq to selected value', function () {
    audioControls.pitchCrlCallBack(this.pitchCrlEventNumber, this.config, this.fn);
    expect(this.config.startFreq).to.equal(this.pitchCrlEventNumber.target.value);
  });
  it('should set config startFreq to a number when el value is a string', function () {
    audioControls.pitchCrlCallBack(this.pitchCrlEvent, this.config, this.fn);
    expect(this.config.startFreq).to.be.a('number');
  });
  it('should call setOscFreqToTuningSys', function () {
    const spy = sinon.spy(freqiCtrls, 'setOscFreqToTuningSys');
    audioControls.pitchCrlCallBack(this.pitchCrlEvent, this.config, this.fn);
    expect(spy).calledOnce;
  });
});
