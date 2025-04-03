
import React, { useState } from 'react';
import { WebcamCapture } from '@/components/WebcamCapture';
import { VoiceCapture } from '@/components/VoiceCapture';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { ChatInterface } from '@/components/ChatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Headphones, Volume, VolumeOff, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [faceEmotion, setFaceEmotion] = useState<string>('neutral');
  const [voiceEmotion, setVoiceEmotion] = useState<string>('neutral');
  const [isAvatarActive, setIsAvatarActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTab, setCurrentTab] = useState('chat');
  const { toast } = useToast();

  // Combined emotion from both face and voice
  const currentEmotion = isAvatarActive ? (faceEmotion !== 'neutral' ? faceEmotion : voiceEmotion) : 'neutral';

  const handleFaceEmotionDetected = (emotion: string) => {
    setFaceEmotion(emotion);
    
    if (!isAvatarActive) {
      setIsAvatarActive(true);
      
      toast({
        title: "Emotion Detected",
        description: `Detected facial emotion: ${emotion}`,
      });
    }
  };

  const handleVoiceEmotionDetected = (emotion: string) => {
    setVoiceEmotion(emotion);
    
    if (!isAvatarActive) {
      setIsAvatarActive(true);
      
      toast({
        title: "Emotion Detected",
        description: `Detected voice emotion: ${emotion}`,
      });
    }
  };

  const handleSpeechDetected = (text: string) => {
    toast({
      title: "Speech Detected",
      description: text,
    });
  };

  const handleMessageSent = (message: string) => {
    // Simulate AI speaking response
    setIsSpeaking(true);
    
    // Stop speaking after a delay
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-companion-light to-background">
      <header className="container mx-auto py-6">
        <h1 className="text-4xl font-bold text-center text-companion-dark">Empathetic AI Companion</h1>
        <p className="text-center text-muted-foreground mt-2">An emotionally intelligent AI that responds to your facial expressions and voice</p>
      </header>
      
      <main className="container mx-auto flex-1 px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Avatar Section - Always Visible */}
          <div className="lg:col-span-4 lg:order-1 order-1">
            <Card className="h-full">
              <CardContent className="p-6">
                <AvatarDisplay 
                  emotion={currentEmotion} 
                  isAnimating={isAvatarActive}
                />
                
                <div className="mt-6 flex justify-center">
                  <Button
                    variant={isSpeaking ? "default" : "outline"}
                    onClick={toggleSpeaking}
                    className="flex items-center"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeOff className="mr-2 h-4 w-4" />
                        Mute Voice
                      </>
                    ) : (
                      <>
                        <Volume className="mr-2 h-4 w-4" />
                        Enable Voice
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Interaction Area */}
          <div className="lg:col-span-8 lg:order-2 order-3 flex flex-col">
            <Tabs 
              defaultValue="chat" 
              value={currentTab}
              onValueChange={setCurrentTab}
              className="w-full h-full flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="sensors">
                  <Headphones className="mr-2 h-4 w-4" />
                  Sensors
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-1 mt-4">
                <ChatInterface 
                  detectedEmotion={currentEmotion}
                  onSendMessage={handleMessageSent}
                  className="h-[500px]"
                />
              </TabsContent>
              
              <TabsContent value="sensors" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">Facial Emotion Detection</h3>
                      <WebcamCapture onEmotionDetected={handleFaceEmotionDetected} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">Voice Emotion Detection</h3>
                      <VoiceCapture 
                        onEmotionDetected={handleVoiceEmotionDetected} 
                        onSpeechDetected={handleSpeechDetected}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto py-4">
        <p className="text-center text-muted-foreground text-sm">
          Empathetic AI Companion - Recognizing and responding to human emotions
        </p>
      </footer>
    </div>
  );
};

export default Index;
