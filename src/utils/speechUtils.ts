export const speak = (text: string, onFinish?: () => void) => {
  console.log('Starting to speak:', text);
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      console.log('Speech started');
    };
    utterance.onend = () => {
      console.log('Speech ended');
      if (onFinish) onFinish();
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      if (onFinish) onFinish(); // Call onFinish even if there's an error
    };
    window.speechSynthesis.speak(utterance);
  } else {
    console.log("Text-to-speech not supported in this browser");
    if (onFinish) onFinish();
  }
};