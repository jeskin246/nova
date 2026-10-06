/* ============================================================
   Nova AI Voice Assistant — Main Application
   Orchestrates speech recognition, command processing,
   text-to-speech, and UI interactions.
   ============================================================ */

(function () {
  'use strict';

  /* ---- DOM References ---- */
  const DOM = {
    conversationList:  document.getElementById('conversationList'),
    conversationPanel: document.getElementById('conversationPanel'),
    welcomeMsg:        document.getElementById('welcomeMsg'),
    btnMic:            document.getElementById('btnMic'),
    btnSend:           document.getElementById('btnSend'),
    btnClearChat:      document.getElementById('btnClearChat'),
    textInput:         document.getElementById('textInput'),
    statusIndicator:   document.getElementById('statusIndicator'),
    statusLabel:       document.getElementById('statusLabel'),
    listeningOverlay:  document.getElementById('listeningOverlay'),
    listeningText:     document.getElementById('listeningText'),
    interimText:       document.getElementById('interimText'),
    micIcon:           document.querySelector('.mic-icon'),
    stopIcon:          document.querySelector('.stop-icon'),
    bgParticles:       document.getElementById('bgParticles'),
    toastContainer:    document.getElementById('toastContainer'),
  };

  /* ---- State ---- */
  let isProcessing = false;

  /* ---- Background Particles ---- */
  function _createParticles() {
    const count = 25;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.width  = size + 'px';
      p.style.height = size + 'px';
      p.style.left   = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 10 + 8) + 's';
      p.style.animationDelay    = (Math.random() * 8) + 's';
      p.style.background = Math.random() > 0.5 ? 'var(--accent)' : 'var(--cyan)';
      DOM.bgParticles.appendChild(p);
    }
  }
  _createParticles();

  /* ---- Toast Notifications ---- */
  function showToast(message, type = 'info', duration = 4000) {
    const icons = { error: '⚠️', success: '✅', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  }

  /* ---- Status Management ---- */
  function setStatus(state, label) {
    DOM.statusIndicator.className = 'status-indicator ' + state;
    DOM.statusLabel.textContent = label;
  }

  /* ---- Message Rendering ---- */
  function addMessage(text, sender = 'assistant') {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const msgDiv = document.createElement('div');
    msgDiv.className = `msg msg-${sender}`;

    const avatarSVG = sender === 'assistant'
      ? `<svg width="22" height="22" viewBox="0 0 28 28" fill="none">
           <circle cx="14" cy="14" r="12" stroke="url(#avatarGrad)" stroke-width="2"/>
           <circle cx="14" cy="14" r="5" fill="url(#avatarGrad)"/>
         </svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
           <circle cx="12" cy="7" r="4"/>
         </svg>`;

    msgDiv.innerHTML = `
      <div class="msg-avatar">${avatarSVG}</div>
      <div class="msg-content">
        <div class="msg-bubble"><p>${_escapeHTML(text)}</p></div>
        <div class="msg-time">${time}</div>
      </div>
    `;

    DOM.conversationList.appendChild(msgDiv);
    _scrollToBottom();

    return msgDiv;
  }

  function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'msg msg-assistant';
    div.id = 'typingIndicator';
    div.innerHTML = `
      <div class="msg-avatar">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="12" stroke="url(#avatarGrad)" stroke-width="2"/>
          <circle cx="14" cy="14" r="5" fill="url(#avatarGrad)"/>
        </svg>
      </div>
      <div class="msg-content">
        <div class="msg-bubble">
          <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>
    `;
    DOM.conversationList.appendChild(div);
    _scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function _scrollToBottom() {
    requestAnimationFrame(() => {
      DOM.conversationPanel.scrollTop = DOM.conversationPanel.scrollHeight;
    });
  }

  function _escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---- Core Pipeline ---- */

  /**
   * Handles user input from speech or text.
   */
  async function handleUserInput(text) {
    if (!text.trim() || isProcessing) return;
    isProcessing = true;

    // Hide welcome message on first interaction
    if (DOM.welcomeMsg) {
      DOM.welcomeMsg.style.display = 'none';
    }

    // Show user message
    addMessage(text, 'user');

    // Show typing indicator + status
    setStatus('processing', 'Processing');
    addTypingIndicator();

    // Small delay for natural feel
    await _delay(500 + Math.random() * 400);

    // Process command
    const response = CommandProcessor.process(text);
    removeTypingIndicator();

    // Show assistant message
    addMessage(response.text, 'assistant');

    // Execute action (if any)
    if (response.action) {
      _executeAction(response.action);
    }

    // Speak the response
    setStatus('processing', 'Speaking');
    try {
      await TextToSpeech.speak(response.text);
    } catch (e) {
      // Speech synthesis error — non-critical, just continue
      console.warn('TTS error:', e);
    }

    setStatus('', 'Ready');
    isProcessing = false;
  }

  function _executeAction(action) {
    switch (action.type) {
      case 'open_url':
        window.open(action.url, '_blank', 'noopener,noreferrer');
        break;
      case 'suggest_search': {
        const url = `https://www.google.com/search?q=${encodeURIComponent(action.query)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        break;
      }
    }
  }

  function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ---- Speech Recognition Hooks ---- */
  SpeechRecognizer.on('start', () => {
    DOM.btnMic.classList.add('listening');
    DOM.micIcon.classList.add('hidden');
    DOM.stopIcon.classList.remove('hidden');
    DOM.listeningOverlay.classList.add('active');
    DOM.interimText.textContent = '';
    setStatus('listening', 'Listening');
  });

  SpeechRecognizer.on('interim', (text) => {
    DOM.interimText.textContent = text;
  });

  SpeechRecognizer.on('result', (text) => {
    _hideListeningUI();
    handleUserInput(text);
  });

  SpeechRecognizer.on('end', () => {
    _hideListeningUI();
    if (!isProcessing) {
      setStatus('', 'Ready');
    }
  });

  SpeechRecognizer.on('error', (err) => {
    _hideListeningUI();
    if (err.code !== 'aborted') {
      showToast(err.message, 'error');
    }
    setStatus('error', 'Error');
    setTimeout(() => {
      if (!isProcessing && !SpeechRecognizer.getIsListening()) {
        setStatus('', 'Ready');
      }
    }, 3000);
  });

  function _hideListeningUI() {
    DOM.btnMic.classList.remove('listening');
    DOM.micIcon.classList.remove('hidden');
    DOM.stopIcon.classList.add('hidden');
    DOM.listeningOverlay.classList.remove('active');
    DOM.interimText.textContent = '';
  }

  /* ---- Event Listeners ---- */

  // Mic button toggle
  DOM.btnMic.addEventListener('click', () => {
    if (isProcessing) return;

    // Stop any ongoing speech when mic is pressed
    TextToSpeech.stop();

    if (SpeechRecognizer.getIsListening()) {
      SpeechRecognizer.stop();
    } else {
      SpeechRecognizer.start();
    }
  });

  // Send text input
  function sendTextInput() {
    const text = DOM.textInput.value.trim();
    if (!text) return;
    DOM.textInput.value = '';
    TextToSpeech.stop();
    handleUserInput(text);
  }

  DOM.btnSend.addEventListener('click', sendTextInput);
  DOM.textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendTextInput();
    }
  });

  // Clear chat
  DOM.btnClearChat.addEventListener('click', () => {
    // Keep only the welcome message
    DOM.conversationList.innerHTML = '';
    if (DOM.welcomeMsg) {
      DOM.welcomeMsg.style.display = '';
      DOM.conversationList.appendChild(DOM.welcomeMsg);
    }
    TextToSpeech.stop();
    showToast('Conversation cleared.', 'success', 2500);
  });

  // Capability card clicks (quick commands)
  document.querySelectorAll('.capability-card').forEach((card) => {
    card.addEventListener('click', () => {
      const command = card.getAttribute('data-command');
      if (command && !isProcessing) {
        TextToSpeech.stop();
        handleUserInput(command);
      }
    });
  });

  // Keyboard shortcut: Space to toggle mic (when input not focused)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement !== DOM.textInput) {
      e.preventDefault();
      DOM.btnMic.click();
    }
  });

  /* ---- Initial Checks ---- */
  if (!SpeechRecognizer.isSupported()) {
    showToast(
      'Speech recognition is not supported in this browser. Please use Google Chrome for the best experience. You can still type commands below.',
      'error',
      8000
    );
  }

  if (!TextToSpeech.isSupported()) {
    showToast(
      'Speech synthesis is not supported. Responses will be shown as text only.',
      'error',
      6000
    );
  }

  // Initial status
  setStatus('', 'Ready');

})();
