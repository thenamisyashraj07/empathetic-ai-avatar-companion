
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume, VolumeOff, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VoiceCaptureProps {
  onEmotionDetected?: (emotion: string) => void;
  onSpeechDetected?: (text: string) => void;
  onTextToSpeech?: (text: string) => void;
  className?: string;
  autoStart?: boolean;
}

const MOCK_EMOTIONS = ['calm', 'excited', 'anxious', 'neutral'];
const MOCK_PHRASES = [
  "Hello, how are you today?",
  "I'm finding this lesson interesting",
  "Can you explain this concept again?",
  "I'm not sure I understand this part",
  "This is making sense now"
];

export const VoiceCapture: React.FC<VoiceCaptureProps> = ({ 
  onEmotionDetected,
  onSpeechDetected,
  onTextToSpeech,
  className,
  autoStart = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeakingDemo, setIsSpeakingDemo] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isListening && hasPermission !== false) {
      startListening();
    }
  }, [autoStart]);

  // Mock emotion detection for demo
  useEffect(() => {
    if (isListening && onEmotionDetected) {
      const interval = setInterval(() => {
        const randomEmotion = MOCK_EMOTIONS[Math.floor(Math.random() * MOCK_EMOTIONS.length)];
        onEmotionDetected(randomEmotion);
      }, 7000);

      return () => clearInterval(interval);
    }
  }, [isListening, onEmotionDetected]);

  // Mock speech recognition for demo
  useEffect(() => {
    if (isListening && onSpeechDetected) {
      const interval = setInterval(() => {
        // Only generate speech sometimes
        if (Math.random() > 0.5) {
          const randomPhrase = MOCK_PHRASES[Math.floor(Math.random() * MOCK_PHRASES.length)];
          onSpeechDetected(randomPhrase);
          
          toast({
            title: "Speech Detected",
            description: randomPhrase,
          });
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isListening, onSpeechDetected, toast]);

  // Demo AI voice responses
  const speakDemoResponse = (text: string) => {
    if (onTextToSpeech) {
      setIsSpeakingDemo(true);
      onTextToSpeech(text);
      
      // Simulate speech duration
      setTimeout(() => {
        setIsSpeakingDemo(false);
      }, text.length * 80); // Approximate time based on text length
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Create audio context
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      updateAudioLevel();
      setIsListening(true);
      setHasPermission(true);
      
      // Welcome message
      if (onTextToSpeech) {
        setTimeout(() => {
          speakDemoResponse("Hello! I'm your AI learning assistant. I'm listening and ready to help with your studies.");
        }, 1000);
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setHasPermission(false);
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume level
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    // Normalize to 0-100
    const normalizedAverage = Math.min(100, Math.max(0, average * 2));
    
    setAudioLevel(normalizedAverage);
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const stopListening = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsListening(false);
    setAudioLevel(0);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Demo function to test text-to-speech
  const testTextToSpeech = () => {
    if (onTextToSpeech) {
      const demoTexts = [
        "I notice you're working hard on this. Great job staying focused!",
        "Let me know if you need me to explain any concepts in more detail.",
        "Don't forget to take short breaks to maintain your concentration.",
        "Your engagement with this material is excellent! Keep it up!"
      ];
      
      const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
      speakDemoResponse(randomText);
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative rounded-lg overflow-hidden bg-gray-900 mb-4 w-full p-4 flex items-center justify-center h-20">
        {hasPermission === false && (
          <div className="text-white text-center">
            Microphone access denied. Please enable microphone permissions.
          </div>
        )}
        
        {(!isListening && hasPermission !== false) && (
          <div className="text-white text-center">
            Enable microphone to activate voice detection
          </div>
        )}
        
        {isListening && (
          <div className="flex items-center space-x-2 w-full">
            <Volume className="w-5 h-5 text-white" />
            <div className="h-2 bg-gray-700 rounded-full flex-1">
              <div 
                className="h-full bg-companion rounded-full transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
            {audioLevel > 50 && (
              <div className="text-white text-xs">
                Listening...
              </div>
            )}
          </div>
        )}
        
        {isSpeakingDemo && (
          <div className="absolute top-1 right-1 bg-companion text-white text-xs px-2 py-0.5 rounded-full">
            AI Speaking...
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button 
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          className="mb-2"
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-4 w-4" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start Listening
            </>
          )}
        </Button>
        
        <Button
          onClick={testTextToSpeech}
          variant="outline"
          className="mb-2"
          disabled={!isListening}
        >
          <Headphones className="mr-2 h-4 w-4" />
          Test AI Voice
        </Button>
      </div>
    </div>
  );
};
