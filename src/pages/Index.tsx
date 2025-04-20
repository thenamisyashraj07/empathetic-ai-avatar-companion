import React, { useState, useEffect } from 'react';
import { WebcamCapture } from '@/components/WebcamCapture';
import { VoiceCapture } from '@/components/VoiceCapture';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { ChatInterface } from '@/components/ChatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume, VolumeOff, MessageCircle, GraduationCap, FileCheck, Briefcase, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EngagementTracker } from '@/components/EngagementTracker';
import BackgroundScene from '@/components/BackgroundScene';

const Index = () => {
  const [faceEmotion, setFaceEmotion] = useState<string>('neutral');
  const [voiceEmotion, setVoiceEmotion] = useState<string>('neutral');
  const [isAvatarActive, setIsAvatarActive] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentContext, setCurrentContext] = useState<'learning' | 'assessment' | 'interview'>('learning');
  const [engagementLevel, setEngagementLevel] = useState<number>(5);
  const [attentionMessage, setAttentionMessage] = useState<string | null>(null);
  const [currentAIMessage, setCurrentAIMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const currentEmotion = isAvatarActive ? (faceEmotion !== 'neutral' ? faceEmotion : voiceEmotion) : 'neutral';

  useEffect(() => {
    if (currentContext === 'learning') {
      setIsAvatarActive(true);
      
      setTimeout(() => {
        handleAISpeaking("Welcome to your learning session! I'll be monitoring your engagement and helping you stay focused.");
      }, 1000);
    }
  }, [currentContext]);

  const handleFaceEmotionDetected = (emotion: string) => {
    setFaceEmotion(emotion);
    
    if (emotion === 'happy' || emotion === 'excited') {
      setEngagementLevel(prev => Math.min(10, prev + 1));
    } else if (emotion === 'sad' || emotion === 'angry') {
      setEngagementLevel(prev => Math.max(1, prev - 1));
    }
  };

  const handleVoiceEmotionDetected = (emotion: string) => {
    setVoiceEmotion(emotion);
  };

  const handleSpeechDetected = (text: string) => {
    setEngagementLevel(prev => Math.min(10, prev + 0.5));
    
    if (currentContext === 'learning') {
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
      
      setTimeout(() => {
        handleAISpeaking(response);
      }, 800);
    }
  };

  const handleAttentionStatus = (isAttentive: boolean, message?: string) => {
    if (!isAttentive && message) {
      setAttentionMessage(message);
      handleAISpeaking(message);
      
      setEngagementLevel(prev => Math.max(1, prev - 1));
    }
  };

  const handleAISpeaking = (message: string) => {
    setIsSpeaking(true);
    setCurrentAIMessage(message);
    
    const speakingDuration = Math.max(2000, message.length * 80);
    
    setTimeout(() => {
      setIsSpeaking(false);
      setTimeout(() => {
        setCurrentAIMessage(null);
      }, 3000);
    }, speakingDuration);
  };

  const handleMessageSent = (message: string) => {
    setIsSpeaking(true);
    
    let response = "";
    if (currentContext === 'learning') {
      if (engagementLevel < 4) {
        response = "I notice your engagement seems low. Would you like to take a short break or try a different approach to this topic?";
      } else {
        response = `That's a great question about "${message.substring(0, 20)}...". Let me explain this concept.`;
      }
    } else if (currentContext === 'assessment') {
      response = "I've recorded your response. Please continue with the next question.";
    } else {
      response = "Thank you for that interview response. Would you like feedback or shall we move to the next question?";
    }
    
    setCurrentAIMessage(response);
    
    const speakingDuration = Math.max(2000, response.length * 80);
    setTimeout(() => {
      setIsSpeaking(false);
      setTimeout(() => {
        setCurrentAIMessage(null);
      }, 3000);
    }, speakingDuration);
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (!isSpeaking) {
      handleAISpeaking("Hello! I'm your AI learning assistant. How can I help you today?");
    }
  };

  const handleContextChange = (context: 'learning' | 'assessment' | 'interview') => {
    setCurrentContext(context);
    
    setEngagementLevel(5);
    
    let welcomeMessage = "";
    switch (context) {
      case 'learning':
        welcomeMessage = "Welcome to learning mode! I'll monitor your engagement and help you stay focused on the material.";
        break;
      case 'assessment':
        welcomeMessage = "Assessment mode activated. I'll be monitoring your responses for academic integrity.";
        break;
      case 'interview':
        welcomeMessage = "Interview practice mode started. I'll provide feedback on your interview responses.";
        break;
    }
    
    handleAISpeaking(welcomeMessage);
    
    toast({
      title: "Context Changed",
      description: `Switched to ${context} mode`,
    });
  };

  const renderLearningModeContent = () => {
    if (currentContext !== 'learning') return null;
    
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <GraduationCap className="h-5 w-5 text-companion" />
            <h3 className="font-medium">Learning Focus Monitor</h3>
          </div>
          
          {attentionMessage && (
            <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded-md mb-3">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{attentionMessage}</p>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground mb-2">
            Tips for better learning:
          </div>
          
          <ul className="text-sm space-y-1.5 list-disc pl-5">
            <li>Sit up straight and maintain good posture</li>
            <li>Keep your eyes on the screen to stay engaged</li>
            <li>Ask questions when you don't understand something</li>
            <li>Take short breaks every 25-30 minutes</li>
            <li>Try to explain concepts back in your own words</li>
          </ul>
          
          {engagementLevel < 4 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                <strong>Low engagement detected!</strong> Try asking a question or actively participating to improve your learning experience.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundScene context={currentContext} />
      
      <header className="container mx-auto py-6 relative z-10">
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Empathetic AI Companion
        </h1>
        <p className="text-center text-muted-foreground mt-2 text-lg">
          An emotionally intelligent AI for educational and interview contexts
        </p>
        
        <div className="flex justify-center mt-6">
          <Tabs 
            value={currentContext}
            onValueChange={(value) => handleContextChange(value as 'learning' | 'assessment' | 'interview')}
            className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-lg p-1"
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger 
                value="learning"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Learning
              </TabsTrigger>
              <TabsTrigger 
                value="assessment"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white transition-all duration-300"
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Assessment
              </TabsTrigger>
              <TabsTrigger 
                value="interview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Interview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      
      <main className="container mx-auto flex-1 px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 lg:order-1 order-1">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <AvatarDisplay 
                    emotion={currentEmotion} 
                    isAnimating={isAvatarActive}
                    isSpeaking={isSpeaking}
                    message={currentAIMessage}
                  />
                  
                  {currentContext !== 'interview' && (
                    <div className="mt-4">
                      <EngagementTracker level={engagementLevel} context={currentContext} />
                    </div>
                  )}
                  
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
              
              {renderLearningModeContent()}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium mb-3">Facial Monitoring</h3>
                    <WebcamCapture 
                      onEmotionDetected={handleFaceEmotionDetected}
                      onAttentionStatus={handleAttentionStatus}
                      autoStart={currentContext === 'learning'}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium mb-3">Voice Interaction</h3>
                    <VoiceCapture 
                      onEmotionDetected={handleVoiceEmotionDetected} 
                      onSpeechDetected={handleSpeechDetected}
                      onTextToSpeech={handleAISpeaking}
                      autoStart={currentContext === 'learning'}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-8 lg:order-2 order-2">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <MessageCircle className="mr-2 h-5 w-5 text-companion" />
                  <h2 className="text-xl font-medium">Chat with AI Companion</h2>
                </div>
                
                <ChatInterface 
                  detectedEmotion={currentEmotion}
                  onSendMessage={handleMessageSent}
                  className="h-[650px]"
                  context={currentContext}
                  engagementLevel={engagementLevel}
                />
              </CardContent>
            </Card>
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
