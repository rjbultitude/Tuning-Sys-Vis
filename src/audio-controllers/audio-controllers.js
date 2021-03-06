import { setOscFreqToTuningSys } from './freqi-controls';
import { WAVE_TYPE_VOLS } from '../utils/constants';

export function createTuningSystems(config) {
  const tuningSystems = new Map();
  Object.keys(config.tuningSysNotes).forEach((tuningSysKey) => {
    const tuninSysDisplayName =
      config.freqiTuningSysMeta[tuningSysKey].shortName;
    tuningSystems.set(tuningSysKey, tuninSysDisplayName);
  });
  config.tuningSystems = tuningSystems;
  return config;
}

export function changeWave(waveTypeStr, config) {
  if (config.osc.started) {
    const oscVolume = WAVE_TYPE_VOLS.get(waveTypeStr);
    config.osc.amp(oscVolume);
  }
  config.osc.setType(waveTypeStr);
  return waveTypeStr;
}

export function togglePlay({ config, updateAudioOutput }) {
  if (config.playing) {
    config.osc.stop();
    config.playing = false;
    // p5Sketch.noLoop();
  } else {
    config.osc.start();
    config.playing = true;
    // p5Sketch.loop();
  }
  // update UI
  updateAudioOutput(config);
  return config;
}

export function playModeCallBack(e, config) {
  const playModeVal = e.target.options[e.target.selectedIndex].value;
  config.playMode = playModeVal;
  return config;
}

export function setupPlayModeControls(config, playModeControl) {
  playModeControl.addEventListener(
    'change',
    (e) => {
      playModeCallBack(e, config);
    },
    false
  );
  return playModeControl;
}

export function waveControlHandler(event, config, _changeWave = changeWave) {
  _changeWave(event.target.value, config);
}

export function setupWaveControls(config, waveControl) {
  waveControl.addEventListener('change', (event) => {
    waveControlHandler(event, config);
  });
  return waveControl;
}

export function pitchCrlCallBack(e, config, updateAudioOutput) {
  config.startFreq = parseInt(e.target.value);
  // read state and update Osc
  setOscFreqToTuningSys(config, updateAudioOutput);
  return config;
}

export function setupPitchControls(config, pitchControl, updateAudioOutput) {
  pitchControl.addEventListener('change', (e) => {
    pitchCrlCallBack(e, config, updateAudioOutput);
  });
}
