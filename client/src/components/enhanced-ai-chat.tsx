import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Loader2, ExternalLink, TrendingUp, MapPin, Building2, Calendar, Lightbulb } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  tags?: string[];
  links?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  suggestions?: string[];
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context: {
    country?: string;
    sector?: string;
    userType?: string;
  };
}

export function EnhancedAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const countries = [
    "Malaysia", "Singapore", "Indonesia", "Thailand", "Vietnam", 
    "Philippines", "Global", "Southeast Asia", "Asia-Pacific"
  ];

  const sectors = [
    "FinTech", "HealthTech", "EdTech", "AgriTech", "CleanTech", 
    "E-commerce", "AI/ML", "IoT", "Blockchain", "Cybersecurity"
  ];

  const predefinedPrompts = [
    {
      id: "funding-opportunities",
      text: "Find Series A funding opportunities in fintech",
      icon: TrendingUp,
      category: "Funding"
    },
    {
      id: "accelerator-programs",
      text: "Show me accelerator programs in Southeast Asia",
      icon: Building2,
      category: "Programs"
    },
    {
      id: "market-trends",
      text: "What are the latest market trends in my sector?",
      icon: TrendingUp,
      category: "Insights"
    },
    {
      id: "government-grants",
      text: "Latest government grants for tech startups",
      icon: Calendar,
      category: "Grants"
    },
    {
      id: "networking-events",
      text: "Upcoming networking events for entrepreneurs",
      icon: Calendar,
      category: "Events"
    },
    {
      id: "investment-landscape",
      text: "Investment landscape analysis for my region",
      icon: MapPin,
      category: "Analysis"
    }
  ];

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; context?: any }) => {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: data.message,
          context: {
            country: selectedCountry,
            sector: selectedSector,
            userRole: userProfile?.user?.role,
            previousMessages: messages.slice(-3), // Last 3 messages for context
            ...data.context
          }
        }),
      });
      if (!response.ok) throw new Error("Failed to get AI response");
      return response.json();
    },
    onSuccess: (data, variables) => {
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: "assistant",
        content: data.message,
        timestamp: new Date(),
        tags: data.tags || [],
        links: data.links || [],
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save to insights history
      saveToHistory(variables.message, data.message);
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive"
      });
    },
  });

  const saveToHistory = async (question: string, answer: string) => {
    try {
      await fetch("/api/insights/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          question,
          answer,
          context: {
            country: selectedCountry,
            sector: selectedSector,
            timestamp: new Date().toISOString()
          }
        }),
      });
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || input.trim();
    if (!message) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    chatMutation.mutate({ message });
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (content: string) => {
    // Simple formatting for better readability
    return content.split('\n').map((line, index) => (
      <p key={index} className={index > 0 ? "mt-2" : ""}>
        {line}
      </p>
    ));
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          AI Market Intelligence Assistant
        </CardTitle>
        
        {/* Filters */}
        <div className="flex gap-3 mt-3">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select country/region" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Predefined Prompts */}
        {messages.length === 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Quick questions to get started:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {predefinedPrompts.map((prompt) => (
                <Button
                  key={prompt.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromptClick(prompt.text)}
                  className="justify-start text-left h-auto p-3"
                >
                  <div className="flex items-start gap-2">
                    <prompt.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-xs">{prompt.category}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {prompt.text}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <div className="text-sm">
                    {formatMessage(message.content)}
                  </div>

                  {/* Tags */}
                  {message.tags && message.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  {message.links && message.links.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.links.map((link, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-900"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-xs font-medium">{link.title}</span>
                          </a>
                          {link.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {link.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        Follow-up questions:
                      </div>
                      <div className="space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendMessage(suggestion)}
                            className="text-xs h-auto p-1 justify-start text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Analyzing market data...
                  </span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator />

        {/* Input */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about market trends, funding opportunities, or ecosystem insights..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || chatMutation.isPending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {(selectedCountry || selectedSector) && (
            <div className="flex gap-2 mt-2">
              {selectedCountry && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {selectedCountry}
                </Badge>
              )}
              {selectedSector && (
                <Badge variant="outline" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  {selectedSector}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}