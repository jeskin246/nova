/* ============================================================
   Speech Recognition Module
   Wraps the Web Speech API (SpeechRecognition) with error
   handling and callback-based event flow.
   ============================================================ */

const SpeechRecognizer = (() => {
  'use strict';

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let isListening = false;

  /* ---- Callbacks (set by consumer) ---- */
  let onResult        = null; // (finalTranscript: string) => void
  let onInterim       = null; // (interimTranscript: string) => void
  let onStart         = null; // () => void
  let onEnd           = null; // () => void
  let onError         = null; // (errorInfo: { code: string, message: string }) => void

  /**
   * Checks if the Web Speech API is available.
   */
  function isSupported() {
    return !!SpeechRecognitionAPI;
  }

  /**
   * Initialize the recognition engine (called once).
   */
  function _init() {
    if (recognition) return;
    if (!SpeechRecognitionAPI) return;

    recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // stop after one phrase

    recognition.onstart = () => {
      isListening = true;
      if (onStart) onStart();
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim && onInterim) onInterim(interim);
      if (final && onResult) onResult(final);
    };

    recognition.onend = () => {
      isListening = false;
      if (onEnd) onEnd();
    };

    recognition.onerror = (event) => {
      isListening = false;

      const errorMap = {
        'no-speech':       'No speech was detected. Please try again.',
        'audio-capture':   'Microphone is not available. Please check your device settings.',
        'not-allowed':     'Microphone permission was denied. Please allow access and try again.',
        'network':         'A network error occurred. Please check your internet connection.',
        'service-not-allowed': 'Speech recognition service is not allowed. Try using Chrome.',
        'aborted':         'Listening was cancelled.',
      };

      const message = errorMap[event.error] || `An error occurred: ${event.error}`;

      if (onError) onError({ code: event.error, message });
    };
  }

  /**
   * Start listening for speech.
   */
  function start() {
    if (!isSupported()) {
      if (onError) onError({
        code: 'not-supported',
        message: 'Speech recognition is not supported in this browser. Please use Google Chrome.',
      });
      return;
    }

    _init();

    if (isListening) {
      recognition.abort();
    }

    try {
      recognition.start();
    } catch (e) {
      // Already started — ignore
    }
  }

  /**
   * Stop / cancel listening.
   */
  function stop() {
    if (recognition && isListening) {
      recognition.abort();
    }
  }

  /**
   * Register event callbacks.
   * @param {'result'|'interim'|'start'|'end'|'error'} event
   * @param {Function} callback
   */
  function on(event, callback) {
    switch (event) {
      case 'result':  onResult  = callback; break;
      case 'interim': onInterim = callback; break;
      case 'start':   onStart   = callback; break;
      case 'end':     onEnd     = callback; break;
      case 'error':   onError   = callback; break;
    }
  }

  /**
   * Returns true if currently listening.
   */
  function getIsListening() {
    return isListening;
  }

  return { isSupported, start, stop, on, getIsListening };
})();
