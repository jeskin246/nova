/* ============================================================
   Command Processor Module
   Parses natural-language input and executes matching commands.
   ============================================================ */

const CommandProcessor = (() => {
  'use strict';

  /* ---- Well-known websites ---- */
  const SITES = {
    youtube:    'https://www.youtube.com',
    google:     'https://www.google.com',
    gmail:      'https://mail.google.com',
    github:     'https://github.com',
    twitter:    'https://twitter.com',
    x:          'https://twitter.com',
    facebook:   'https://www.facebook.com',
    instagram:  'https://www.instagram.com',
    linkedin:   'https://www.linkedin.com',
    reddit:     'https://www.reddit.com',
    wikipedia:  'https://www.wikipedia.org',
    amazon:     'https://www.amazon.com',
    netflix:    'https://www.netflix.com',
    spotify:    'https://open.spotify.com',
    stackoverflow: 'https://stackoverflow.com',
    'stack overflow': 'https://stackoverflow.com',
    chatgpt:    'https://chat.openai.com',
    whatsapp:   'https://web.whatsapp.com',
  };

  /* ---- Helpers ---- */
  function _now() {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
  }

  function _today() {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  /**
   * Convert spoken math words into evaluable expressions.
   * E.g. "twenty five times four" → "25*4"
   */
  function _parseMathExpression(raw) {
    let expr = raw.toLowerCase()
      .replace(/plus/g, '+')
      .replace(/minus/g, '-')
      .replace(/times|multiplied by|x(?=\s*\d)/g, '*')
      .replace(/divided by|over/g, '/')
      .replace(/modulo|mod/g, '%')
      .replace(/power of|to the power/g, '**')
      .replace(/percent of/g, '/100*')
      .replace(/percent/g, '/100')
      .replace(/point/g, '.')
      .replace(/\bpi\b/g, String(Math.PI))
      .replace(/\be\b/g, String(Math.E))
      .replace(/\bsquare root of\s*([\d.]+)/g, 'Math.sqrt($1)')
      .replace(/\bsqrt\s*([\d.]+)/g, 'Math.sqrt($1)')
      .replace(/[^0-9+\-*/().%\s\dMath.sqrtMath.PI]/g, '')
      .trim();

    // Remove any leftover text noise
    expr = expr.replace(/[a-ce-zA-Z]+/g, '').trim();

    return expr;
  }

  function _safeEval(expr) {
    try {
      // Only allow safe characters
      if (/[^0-9+\-*/().%\s]/.test(expr.replace(/Math\.\w+/g, ''))) return null;
      const result = Function('"use strict"; return (' + expr + ')')();
      if (typeof result !== 'number' || !isFinite(result)) return null;
      return result;
    } catch {
      return null;
    }
  }

  /* ---- Command matchers (ordered by priority) ---- */
  const commands = [

    /* — Greeting — */
    {
      match: (t) => /^(hi|hello|hey|good\s?(morning|afternoon|evening)|howdy|greetings)\b/i.test(t),
      execute: () => {
        const hour = new Date().getHours();
        let greeting = 'Hello!';
        if (hour < 12) greeting = 'Good morning!';
        else if (hour < 17) greeting = 'Good afternoon!';
        else greeting = 'Good evening!';
        return { text: `${greeting} I'm Nova, your personal assistant. How can I help you today?`, action: null };
      },
    },

    /* — Name — */
    {
      match: (t) => /what(?:'s| is) your name|who are you/i.test(t),
      execute: () => ({ text: "I'm Nova, your personal AI voice assistant. I can help you search the web, open websites, do calculations, tell you the time, and more!", action: null }),
    },

    /* — Time — */
    {
      match: (t) => /what(?:'s| is) the time|current time|tell (?:me )?the time|what time is it/i.test(t),
      execute: () => ({ text: `The current time is ${_now()}.`, action: null }),
    },

    /* — Date — */
    {
      match: (t) => /what(?:'s| is) the date|today(?:'s| is the)? date|what day is it|what(?:'s| is) today/i.test(t),
      execute: () => ({ text: `Today is ${_today()}.`, action: null }),
    },

    /* — Open website — */
    {
      match: (t) => /^(?:open|go to|launch|visit|navigate to|show me)\s+/i.test(t),
      execute: (text) => {
        const target = text.replace(/^(?:open|go to|launch|visit|navigate to|show me)\s+/i, '').trim().toLowerCase();

        // Check known sites first
        for (const [name, url] of Object.entries(SITES)) {
          if (target.includes(name)) {
            return { text: `Opening ${name.charAt(0).toUpperCase() + name.slice(1)} for you.`, action: { type: 'open_url', url } };
          }
        }

        // Try as a direct URL
        let url = target;
        if (!url.startsWith('http')) {
          url = url.replace(/\s+/g, '');
          if (!url.includes('.')) url += '.com';
          url = 'https://' + url;
        }

        return { text: `Opening ${target} for you.`, action: { type: 'open_url', url } };
      },
    },

    /* — Search the web — */
    {
      match: (t) => /^(?:search|search for|look up|find|google|search the web for)\s+/i.test(t),
      execute: (text) => {
        const query = text.replace(/^(?:search|search for|look up|find|google|search the web for)\s+/i, '').trim();
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        return { text: `Searching the web for "${query}".`, action: { type: 'open_url', url } };
      },
    },

    /* — Calculations — */
    {
      match: (t) => /(?:calculate|what(?:'s| is)|compute|solve|how much is|evaluate)\s+[\d]|[\d]+\s*[+\-*/]/i.test(t) || /(?:calculate|compute|solve|evaluate)\s+/i.test(t),
      execute: (text) => {
        let raw = text.replace(/^(?:calculate|what(?:'s| is)|compute|solve|how much is|evaluate)\s*/i, '').trim();
        let expr = _parseMathExpression(raw);

        // Try direct numeric evaluation
        if (!expr) {
          // Fall back to trying the raw digits & operators
          expr = raw.replace(/[^0-9+\-*/().%\s]/g, '').trim();
        }

        const result = _safeEval(expr);
        if (result !== null) {
          return { text: `The answer is ${Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, '')}.`, action: null };
        }
        return { text: "I'm sorry, I couldn't evaluate that expression. Could you rephrase the calculation?", action: null };
      },
    },

    /* — Weather (redirect to search) — */
    {
      match: (t) => /weather|temperature|forecast/i.test(t),
      execute: (text) => {
        const query = text.trim();
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        return { text: `Let me look up the weather for you.`, action: { type: 'open_url', url } };
      },
    },

    /* — Jokes — */
    {
      match: (t) => /tell (?:me )?a joke|joke/i.test(t),
      execute: () => {
        const jokes = [
          "Why do programmers prefer dark mode? Because light attracts bugs!",
          "Why did the developer go broke? Because he used up all his cache.",
          "Why do Java developers wear glasses? Because they don't C-sharp.",
          "What's a computer's favorite snack? Microchips!",
          "How do trees access the internet? They log in.",
          "Why was the computer cold? It left its Windows open.",
        ];
        return { text: jokes[Math.floor(Math.random() * jokes.length)], action: null };
      },
    },

    /* — Thank you — */
    {
      match: (t) => /thank(s| you)/i.test(t),
      execute: () => ({ text: "You're welcome! Let me know if there's anything else I can help with.", action: null }),
    },

    /* — Goodbye — */
    {
      match: (t) => /^(bye|goodbye|see you|exit|quit)\b/i.test(t),
      execute: () => ({ text: "Goodbye! Have a wonderful day!", action: null }),
    },

    /* — Help — */
    {
      match: (t) => /help|what can you do|commands|features/i.test(t),
      execute: () => ({
        text: "Here's what I can do: tell you the time or date, open websites like YouTube or Google, search the web, perform calculations, tell jokes, and more. Just speak naturally!",
        action: null,
      }),
    },
  ];

  /**
   * Process user input and return a response.
   * @param {string} input - The user's spoken or typed text.
   * @returns {{ text: string, action: object|null }}
   */
  function process(input) {
    const trimmed = input.trim();
    if (!trimmed) {
      return { text: "I didn't catch that. Could you say it again?", action: null };
    }

    for (const cmd of commands) {
      if (cmd.match(trimmed)) {
        return cmd.execute(trimmed);
      }
    }

    // Fallback: offer to search
    return {
      text: `I'm not sure how to help with that. Would you like me to search the web for "${trimmed}"?`,
      action: { type: 'suggest_search', query: trimmed },
    };
  }

  return { process };
})();
