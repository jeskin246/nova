/* ============================================================
   Text-to-Speech Module
   Uses the Web Speech API (SpeechSynthesis) to speak text.
   ============================================================ */

const TextToSpeech = (() => {
  'use strict';

  const synth = window.speechSynthesis;
  let currentUtterance = null;
  let preferredVoice = null;

  /**
   * Load and pick the best available voice.
   * Prefers English voices with natural / enhanced quality.
   */
  function _loadVoices() {
    const voices = synth.getVoices();
    if (!voices.length) return;

    // Priority order: Google UK English Female > any en-GB > any en-US > first en voice
    const priorities = [
      v => v.name.includes('Google UK English Female'),
      v => v.name.includes('Google US English'),
      v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'),
      v => v.lang.startsWith('en-GB'),
      v => v.lang.startsWith('en-US'),
      v => v.lang.startsWith('en'),
    ];

    for (const test of priorities) {
      const match = voices.find(test);
      if (match) { preferredVoice = match; return; }
    }

    preferredVoice = voices[0];
  }

  // Voices may load asynchronously
  if (synth) {
    _loadVoices();
    synth.onvoiceschanged = _loadVoices;
  }

  /**
   * Speak the given text.
   * @param {string} text - The text to speak.
   * @param {object} [opts] - Optional settings: rate, pitch, volume.
   * @returns {Promise<void>} Resolves when speech ends.
   */
  function speak(text, opts = {}) {
    return new Promise((resolve, reject) => {
      if (!synth) {
        reject(new Error('Speech synthesis is not supported in this browser.'));
        return;
      }

      // Cancel any ongoing speech
      stop();

      const utterance = new SpeechSynthesisUtterance(text);
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate   = opts.rate   ?? 1.05;
      utterance.pitch  = opts.pitch  ?? 1.0;
      utterance.volume = opts.volume ?? 1.0;

      utterance.onend   = () => { currentUtterance = null; resolve(); };
      utterance.onerror = (e) => { currentUtterance = null; reject(e); };

      currentUtterance = utterance;
      synth.speak(utterance);
    });
  }

  /**
   * Stop any ongoing speech immediately.
   */
  function stop() {
    if (synth) synth.cancel();
    currentUtterance = null;
  }

  /**
   * Returns true if the engine is currently speaking.
   */
  function isSpeaking() {
    return synth ? synth.speaking : false;
  }

  /**
   * Returns true if speech synthesis is supported.
   */
  function isSupported() {
    return !!synth;
  }

  return { speak, stop, isSpeaking, isSupported };
})();
