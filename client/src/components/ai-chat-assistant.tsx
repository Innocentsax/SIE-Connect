import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Target, 
  Search,
  TrendingUp,
  X,
  Minimize2,
  Maximize2
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatAssistantProps {
  user: {
    id: number;
    role: string;
    name: string;
    sector?: string;
    location?: string;
    interests?: string[];
  };
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

export function AIChatAssistant({ user, isMinimized, onToggleMinimize, onClose }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${user.name}! I'm your AI assistant for the Malaysian startup ecosystem. I can help you with:
      
• Finding funding opportunities matching your profile
• Discovering relevant startups and partnerships  
• Market intelligence and trends analysis
• Personalized recommendations based on your sector (${user.sector || 'your focus area'})
• Connecting with the right investors or founders

What would you like to explore today?`,
      timestamp: new Date(),
      suggestions: [
        'Find funding opportunities',
        'Discover startups in my sector',
        'Get market insights',
        'Find potential partners'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          userProfile: {
            role: user.role,
            sector: user.sector,
            location: user.location,
            interests: user.interests
          },
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    onMutate: (message) => {
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage("");
      setIsTyping(true);
    },
    onSuccess: (response) => {
      setIsTyping(false);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || response.message || "I received your message but had trouble generating a response.",
        timestamp: new Date(),
        suggestions: response.suggestions || []
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage.mutate(inputMessage.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage.mutate(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-2 border-primary/20 z-50">
        <CardHeader className="pb-2 cursor-pointer" onClick={onToggleMinimize}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">AI Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleMinimize?.(); }}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClose?.(); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bot className="h-4 w-4" />
            <span>Click to expand and start chatting...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-lg border-2 border-primary/20 z-50 flex flex-col">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">AI Assistant</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {user.role === 'STARTUP_FOUNDER' ? 'Founder' : user.role === 'FUNDER' ? 'Investor' : 'Builder'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onToggleMinimize}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && <Bot className="h-4 w-4 text-primary" />}
                    <span className="text-xs text-muted-foreground">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    {message.role === 'user' && <User className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-4' 
                      : 'bg-muted mr-4'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-1 mr-4">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">AI Assistant</span>
                  </div>
                  <div className="bg-muted rounded-lg p-3 mr-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about the Malaysian startup ecosystem..."
              className="min-h-[40px] resize-none"
              rows={1}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sendMessage.isPending}
              size="sm"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}