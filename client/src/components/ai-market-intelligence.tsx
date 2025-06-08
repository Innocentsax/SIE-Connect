import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Building, 
  Users, 
  DollarSign, 
  Calendar,
  MapPin,
  Search,
  Loader2,
  ExternalLink,
  Star
} from "lucide-react";

interface User {
  id: number;
  role: string;
  name: string;
  sector?: string;
  location?: string;
  stage?: string;
}

interface AIResponse {
  message: string;
  suggestions: string[];
  results: Array<{
    title: string;
    description: string;
    source: string;
    confidence: number;
    type: string;
    metadata?: any;
  }>;
}

interface AIMarketIntelligenceProps {
  user: User;
}

export function AIMarketIntelligence({ user }: AIMarketIntelligenceProps) {
  const [query, setQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState(user.sector || "");
  const [selectedLocation, setSelectedLocation] = useState(user.location || "malaysia");
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const { toast } = useToast();

  const aiChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          userProfile: {
            role: user.role,
            sector: selectedSector,
            location: selectedLocation,
            stage: user.stage
          }
        }),
      });
      if (!response.ok) throw new Error("Failed to get AI response");
      return response.json() as Promise<AIResponse>;
    },
    onSuccess: (data) => {
      setChatHistory(prev => [
        ...prev,
        { type: 'user', content: query, timestamp: new Date() },
        { type: 'ai', content: data.message, timestamp: new Date() }
      ]);
      setQuery("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!query.trim()) return;
    aiChatMutation.mutate(query);
  };

  const quickQueries = user.role === 'STARTUP_FOUNDER' ? [
    "Find Series A funding opportunities in fintech",
    "Show me accelerator programs in Southeast Asia",
    "Latest government grants for tech startups",
    "Pitch competition deadlines this quarter"
  ] : user.role === 'FUNDER' ? [
    "Promising startups in AI/ML sector",
    "Market trends in Southeast Asian fintech",
    "Due diligence checklist for Series A",
    "Co-investment opportunities available"
  ] : [
    "Startup ecosystem events in Malaysia",
    "Innovation hub developments",
    "Policy updates affecting startups",
    "Networking opportunities for builders"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Market Intelligence</h1>
          <p className="text-muted-foreground">
            Real-time insights powered by Perplexity AI for {user.role.toLowerCase().replace('_', ' ')}s
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Chat with AI Assistant
              </CardTitle>
              <CardDescription>
                Ask about market trends, opportunities, or ecosystem insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="healthtech">HealthTech</SelectItem>
                    <SelectItem value="edtech">EdTech</SelectItem>
                    <SelectItem value="agritech">AgriTech</SelectItem>
                    <SelectItem value="climate">Climate Tech</SelectItem>
                    <SelectItem value="ai">AI/ML</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="malaysia">Malaysia</SelectItem>
                    <SelectItem value="singapore">Singapore</SelectItem>
                    <SelectItem value="indonesia">Indonesia</SelectItem>
                    <SelectItem value="thailand">Thailand</SelectItem>
                    <SelectItem value="southeast-asia">Southeast Asia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask about market trends, funding opportunities, or ecosystem insights..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[80px]"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!query.trim() || aiChatMutation.isPending}
                    className="self-end"
                  >
                    {aiChatMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickQueries.map((quickQuery, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(quickQuery)}
                      className="text-xs"
                    >
                      {quickQuery}
                    </Button>
                  ))}
                </div>
              </div>

              {chatHistory.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Malaysian Startups</span>
                </div>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-xs text-muted-foreground">Active startups tracked</p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">Total Funding</span>
                </div>
                <p className="text-2xl font-bold">RM 24.7B</p>
                <p className="text-xs text-muted-foreground">Raised in 2024</p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-sm">Active VCs</span>
                </div>
                <p className="text-2xl font-bold">147</p>
                <p className="text-xs text-muted-foreground">Investment funds</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Market Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs">
                <p className="font-medium">MDEC Digital Economy Blueprint</p>
                <p className="text-muted-foreground">New initiatives for 2025</p>
              </div>
              <div className="text-xs">
                <p className="font-medium">PayNet Fintech Hub Launch</p>
                <p className="text-muted-foreground">Supporting fintech innovation</p>
              </div>
              <div className="text-xs">
                <p className="font-medium">Series A Funding Trends</p>
                <p className="text-muted-foreground">Q4 2024 analysis</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}