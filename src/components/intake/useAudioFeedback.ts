import { useCallback, useRef } from "react";

type SoundType = "success" | "warning" | "critical" | "click";

const SOUNDS: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }[]> = {
  success: [
    { frequency: 523, duration: 100, type: "sine" },
    { frequency: 659, duration: 100, type: "sine" },
    { frequency: 784, duration: 150, type: "sine" },
  ],
  warning: [
    { frequency: 440, duration: 200, type: "triangle" },
    { frequency: 440, duration: 200, type: "triangle" },
  ],
  critical: [
    { frequency: 880, duration: 150, type: "square" },
    { frequency: 660, duration: 150, type: "square" },
    { frequency: 880, duration: 150, type: "square" },
    { frequency: 660, duration: 150, type: "square" },
  ],
  click: [{ frequency: 1000, duration: 50, type: "sine" }],
};

export function useAudioFeedback(enabled: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback(
    async (type: SoundType) => {
      if (!enabled) return;

      const ctx = getAudioContext();
      const sounds = SOUNDS[type];
      let startTime = ctx.currentTime;

      for (const sound of sounds) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.frequency, startTime);

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + sound.duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + sound.duration / 1000);

        startTime += sound.duration / 1000;
      }
    },
    [enabled, getAudioContext]
  );

  const speak = useCallback(
    (text: string) => {
      if (!enabled) return;

      if (!speechSynthRef.current) {
        speechSynthRef.current = window.speechSynthesis;
      }

      // Cancel any ongoing speech
      speechSynthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      speechSynthRef.current.speak(utterance);
    },
    [enabled]
  );

  const stopSpeaking = useCallback(() => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
  }, []);

  return { playSound, speak, stopSpeaking };
}
