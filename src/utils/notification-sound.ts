export const notificationSound = (enabled: boolean) => {
  if (!enabled) return;

  try {
    const audioContext = new // biome-ignore lint: error
    (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant ascending chime (C-E-G)
    oscillator.frequency.value = 523; // C5
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.15,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);

    // E5
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 659;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15,
      );
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.15);
    }, 100);

    // G5
    setTimeout(() => {
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.frequency.value = 784;
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2,
      );
      osc3.start(audioContext.currentTime);
      osc3.stop(audioContext.currentTime + 0.2);
    }, 200);
  } catch (error) {
    // biome-ignore lint: error
    console.warn('Could not play notification sound:', error);
  }
};
