# Nova — AI Voice Assistant

A personal AI voice assistant built with vanilla HTML, CSS, and JavaScript that understands speech and responds using voice. No frameworks or build tools required.

![Nova AI Voice Assistant](https://img.shields.io/badge/Nova-AI%20Voice%20Assistant-7c5cfc?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙️ **Speech-to-Text** | Converts your voice to text using the Web Speech API |
| 🔊 **Text-to-Speech** | Responds with natural-sounding voice output |
| 🌐 **Open Websites** | "Open YouTube", "Go to GitHub", etc. |
| 🔍 **Web Search** | "Search for AI news", "Google quantum computing" |
| 🕐 **Time & Date** | "What time is it?", "What's today's date?" |
| 🧮 **Calculations** | "Calculate 25 times 4", "What is 100 divided by 7?" |
| 😂 **Jokes** | "Tell me a joke" |
| ⌨️ **Text Fallback** | Type commands when microphone isn't available |
| 🎨 **Modern Dark UI** | Glassmorphism design with smooth animations |
| 🛡️ **Error Handling** | Graceful handling of mic/browser issues |

---

## 🚀 Installation & Setup

### Prerequisites

- **Google Chrome** (recommended) — required for speech recognition via the Web Speech API
- A working **microphone** for voice input
- No server, Node.js, or build tools needed — it's 100% client-side

### Steps

1. **Clone or download** this project to your computer:

   ```
   git clone <repository-url>
   ```

   Or simply download and extract the ZIP file.

2. **Open `index.html`** in Google Chrome:
   - Double-click `index.html`, or
   - Right-click → Open with → Google Chrome, or
   - Use a local server (recommended for best results):

     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js (npx)
     npx serve .

     # Using VS Code
     # Install "Live Server" extension → right-click index.html → "Open with Live Server"
     ```

3. **Allow microphone access** when prompted by the browser.

---

## 🗂️ Project Structure

```
nova-voice-assistant/
├── index.html                  # Main HTML page
├── css/
│   └── styles.css              # Complete design system & styling
├── js/
│   ├── speechRecognition.js    # Speech-to-text module (Web Speech API)
│   ├── commandProcessor.js     # Natural-language command parser
│   ├── textToSpeech.js         # Text-to-speech module (SpeechSynthesis)
│   └── app.js                  # Main app orchestrator & UI logic
└── README.md                   # This file
```

### Module Responsibilities

| Module | Purpose |
|---|---|
| `speechRecognition.js` | Wraps the SpeechRecognition API with error handling, interim results, and a clean callback interface |
| `commandProcessor.js` | Matches user input against command patterns (time, search, open, calculate, etc.) and returns structured responses |
| `textToSpeech.js` | Uses SpeechSynthesis to speak responses; auto-selects the best available voice |
| `app.js` | Orchestrates the pipeline: listen → transcribe → process → display → speak |

---

## 🎤 Usage

### Voice Commands

Click the **microphone button** (or press **Spacebar**) and speak:

| Say this... | Nova does... |
|---|---|
| "Hello" / "Hey" / "Good morning" | Greets you based on time of day |
| "What time is it?" | Tells the current time |
| "What's the date?" / "What day is it?" | Tells today's date |
| "Open YouTube" | Opens youtube.com in a new tab |
| "Go to GitHub" | Opens github.com |
| "Search for machine learning" | Google searches your query |
| "Calculate 25 times 4" | Returns 100 |
| "What is 150 divided by 7?" | Returns 21.4286 |
| "Tell me a joke" | Tells a random programming joke |
| "What can you do?" / "Help" | Lists capabilities |
| "Goodbye" | Says farewell |

### Text Input

Type a command in the text field and press **Enter** or click the **send button**. This works even without a microphone.

### Quick Commands

Click any of the **capability cards** on the welcome screen to try a command instantly.

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Spacebar` | Toggle listening (when text input is not focused) |
| `Enter` | Send typed command |

---

## 🌐 Browser Compatibility

| Browser | Speech Recognition | Text-to-Speech |
|---|---|---|
| Google Chrome | ✅ Full support | ✅ Full support |
| Microsoft Edge | ✅ Full support | ✅ Full support |
| Firefox | ❌ Not supported | ✅ Supported |
| Safari | ⚠️ Partial | ✅ Supported |

> **Note:** Speech recognition requires Google Chrome or Microsoft Edge. Text-to-speech works in all modern browsers. The app gracefully falls back to text-only mode when speech recognition is unavailable.

---

## 🔧 Troubleshooting

| Issue | Solution |
|---|---|
| Microphone not detected | Check browser permissions in the address bar (🔒 icon) → allow microphone |
| "Speech recognition not supported" | Switch to Google Chrome or Microsoft Edge |
| No voice output | Check system volume; some browsers need a user interaction first |
| Commands not recognized | Speak clearly; try rephrasing; check the command list above |
| Pop-up blocker prevents websites from opening | Allow pop-ups for the page when prompted |

---

## 📄 License

MIT License — free for personal and commercial use.
