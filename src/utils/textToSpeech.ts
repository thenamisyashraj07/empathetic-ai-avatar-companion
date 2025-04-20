
class TextToSpeechService {
  private static instance: TextToSpeechService;
  private synth: SpeechSynthesis;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  private constructor() {
    this.synth = window.speechSynthesis;
    this.initVoice();
  }

  private initVoice() {
    // Try to find a female voice for more natural AI companion interactions
    const voices = this.synth.getVoices();
    this.selectedVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Google')
    ) || voices[0];
  }

  public static getInstance(): TextToSpeechService {
    if (!TextToSpeechService.instance) {
      TextToSpeechService.instance = new TextToSpeechService();
    }
    return TextToSpeechService.instance;
  }

  public speak(text: string) {
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    this.synth.speak(utterance);
  }

  public stop() {
    this.synth.cancel();
  }
}

export const textToSpeech = TextToSpeechService.getInstance();
