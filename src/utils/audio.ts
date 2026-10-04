// Audio narration helper for the 100% Lie AI
let currentAudio: HTMLAudioElement | null = null;

export async function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<() => void> {
  stopSpeech();

  // 1. Try Gemini TTS via server API
  try {
    const res = await fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        currentAudio = audio;
        audio.onplay = () => onStart?.();
        audio.onended = () => {
          currentAudio = null;
          onEnd?.();
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis(text, onStart, onEnd);
        };
        await audio.play();
        return stopSpeech;
      }
    }
  } catch (err) {
    console.log('Gemini TTS unavailable, falling back to Web Speech API');
  }

  // 2. Fallback to Web Speech Synthesis
  fallbackSpeechSynthesis(text, onStart, onEnd);
  return stopSpeech;
}

function fallbackSpeechSynthesis(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 1.0;
  utterance.pitch = 0.95; // Slightly deeper, authoritative tone

  // Select a Japanese voice if available
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find((v) => v.lang.startsWith('ja') || v.lang.includes('JP'));
  if (jaVoice) {
    utterance.voice = jaVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
