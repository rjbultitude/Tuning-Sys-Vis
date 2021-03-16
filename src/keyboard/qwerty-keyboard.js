import { ONESHOT, QWERTY } from '../utils/constants';
import {
  playAndShowNote,
  stopAndHideNote,
  highlightNote,
  setDefaultBtnStyle,
  getIndexFromKeyID,
} from './on-screen-keyboard';

export function isEsc(key) {
  if (key === 'Escape' || key === 'Esc' || key === 27) {
    return true;
  }
}

export function qwertyKeydownCB({ e, config, updateAudioOutput }) {
  if (config.playing && config.playMode === ONESHOT) {
    return false;
  }
  if (QWERTY.includes(e.key)) {
    const currentKeyindex = QWERTY.indexOf(e.key);
    playAndShowNote({
      config,
      index: currentKeyindex,
      updateAudioOutput,
    });
    highlightNote(config, currentKeyindex, false);
    return true;
  }
}

export function qwertyKeyupCB({ e, config, updateAudioOutput }) {
  const currentKeyindex = QWERTY.indexOf(e.key);
  if (isEsc(e.key)) {
    const keyIndex = getIndexFromKeyID(
      config.intervalsRange.lower,
      config.currKbdBtnID
    );
    setDefaultBtnStyle(config, config.currKbdBtnID, keyIndex);
    stopAndHideNote({ config, updateAudioOutput });
  }
  if (QWERTY.includes(e.key) && config.playMode === ONESHOT) {
    highlightNote(config, currentKeyindex, true);
    stopAndHideNote({ config, updateAudioOutput });
  }
}

export function setQwertyEvents(config, updateAudioOutput) {
  document.addEventListener(
    'keydown',
    (e) => {
      qwertyKeydownCB({ e, config, updateAudioOutput });
    },
    false
  );
  document.addEventListener('keyup', (e) => {
    qwertyKeyupCB({ e, config, updateAudioOutput });
  });
}
