
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
  const [recognizedText, setRecognizedText] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isListening && hasPermission !== false) {
      startListening();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
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

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI && !recognitionRef.current) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setRecognizedText(finalTranscript);
          console.log('Final transcript:', finalTranscript);
          
          if (onSpeechDetected) {
            onSpeechDetected(finalTranscript);
            
            // Immediately generate AI response through text-to-speech
            generateAIResponse(finalTranscript);
            
            toast({
              title: "Speech Detected",
              description: finalTranscript,
            });
          }
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        // Auto restart if still in listening mode
        if (isListening) {
          recognition.start();
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, [onSpeechDetected, toast, isListening]);

  // Generate immediate AI response to speech
  const generateAIResponse = (text: string) => {
    if (!text) return;
    
    let response = "";
    
    if (text.toLowerCase().includes('explain') || text.toLowerCase().includes('understand')) {
      response = "I'd be happy to explain that concept in more detail. Let me break it down step by step.";
    } else if (text.toLowerCase().includes('repeat') || text.toLowerCase().includes('again')) {
      response = "Let me repeat that for you. Sometimes hearing information again helps solidify our understanding.";
    } else if (text.toLowerCase().includes('difficult') || text.toLowerCase().includes('hard')) {
      response = "It's okay to find this challenging. Learning new concepts takes time and practice. Let's approach it differently.";
    } else if (text.toLowerCase().includes('bored') || text.toLowerCase().includes('boring')) {
      response = "I understand this might seem dry at first. Let's try to connect it to real-world examples to make it more engaging.";
    } else if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
      response = "Hello there! How can I help with your learning today?";
    } else if (text.toLowerCase().includes('thank')) {
      response = "You're very welcome! I'm here to help you succeed.";
    } else if (text.toLowerCase().includes('example')) {
      response = "Let me provide a concrete example to illustrate this concept better.";
    } else {
      const genericResponses = [
        "I heard what you said. Can you tell me more about what you're working on?",
        "That's an interesting point. Let's explore it further.",
        "I'm following what you're saying. Do you have any specific questions about this topic?",
        "I'm processing what you shared. How can I best assist you with this material?"
      ];
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
    
    // Speak the AI response
    if (onTextToSpeech) {
      onTextToSpeech(response);
    } else {
      speakWithWebSpeech(response);
    }
  };

  // Demo AI voice responses using Web Speech API
  const speakWithWebSpeech = (text: string) => {
    setIsSpeakingDemo(true);
    
    // Use the Web Speech API for text-to-speech
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    
    // Try to find a more natural female voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Google') ||
      voice.name.includes('Assistant')
    );
    
    if (preferredVoice) {
      speech.voice = preferredVoice;
    }
    
    speech.onend = () => {
      setIsSpeakingDemo(false);
    };
    
    window.speechSynthesis.speak(speech);
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
      
      // Start speech recognition if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Error starting speech recognition:', e);
        }
      }
      
      // Welcome message
      setTimeout(() => {
        speakWithWebSpeech("Hello! I'm your AI learning assistant. I'm listening and ready to help with your studies.");
      }, 1000);
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
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
    const demoTexts = [
      "I notice you're working hard on this. Great job staying focused!",
      "Let me know if you need me to explain any concepts in more detail.",
      "Don't forget to take short breaks to maintain your concentration.",
      "Your engagement with this material is excellent! Keep it up!"
    ];
    
    const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
    speakWithWebSpeech(randomText);
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
            {audioLevel > 30 && (
              <div className="text-white text-xs">
                Listening...
              </div>
            )}
          </div>
        )}
        
        {recognizedText && isListening && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
            {recognizedText.substring(0, 50)}{recognizedText.length > 50 ? '...' : ''}
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
