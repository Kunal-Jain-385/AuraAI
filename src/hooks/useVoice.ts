import { useState, useCallback, useRef, useEffect } from 'react';

export const useVoice = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setCurrentText(null);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthesisRef.current) return;

    // If already speaking the same text, stop it
    if (isSpeaking && currentText === text) {
      stop();
      return;
    }

    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentText(null);
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event);
      setIsSpeaking(false);
      setCurrentText(null);
    };

    // Optional: Adjust voice settings
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    synthesisRef.current.speak(utterance);
  }, [isSpeaking, currentText, stop]);

  return {
    speak,
    stop,
    isSpeaking,
    currentText
  };
};
