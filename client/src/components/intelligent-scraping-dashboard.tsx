import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Bot, 
  TrendingUp, 
  MapPin, 
  Building,
  Calendar,
  ExternalLink,
  Star,
  Clock,
  Filter,
  Zap,
  Target,
  Globe,
  Users,
  Briefcase,
  Lightbulb,
  RefreshCw
} from "lucide-react";

interface User {
  id: number;
  role: string;
  name: string;
  sector?: string;
  location?: string;
  interests?: string[];
}

interface ScrapingResult {
  startups: Array<{
    name: string;
    description: string;
    sector: string;
    location: string;
    website?: string;
    stage?: string;
    fundingAmount?: string;
    foundedYear?: number;
    source: string;
    confidence: number;
  }>;
  opportunities: Array<{
    title: string;
    description: string;
    provider: string;
    type: string;
    deadline?: Date;
    amount?: string;
    link?: string;
    sector?: string;
    location?: string;
    source: string;
    confidence: number;
  }>;
  events: Array<{
    name: string;
    description: string;
    date?: Date;
    venue?: string;
    link?: string;
    source: string;
    confidence: number;
  }>;
  insights: {
    marketTrends: string[];
    keyFindings: string;
    recommendations: string[];
  };
}

interface IntelligentScrapingDashboardProps {
  user: User;
}

export function IntelligentScrapingDashboard({ user }: IntelligentScrapingDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState(user.sector || "");
  const [selectedLocation, setSelectedLocation] = useState(user.location || "malaysia");
  const [scrapingResults, setScrapingResults] = useState<ScrapingResult | null>(null);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  
  const { toast } = useToast();

  // Fetch user's scraping history
  const { data: scrapingHistory } = useQuery({
    queryKey: ['/api/scraping/history', user.id],
    queryFn: () => fetch('/api/scraping/history').then(res => res.json())
  });

  // Start intelligent scraping
  const startScraping = useMutation({
    mutationFn: async (params: {
      query?: string;
      sector?: string;
      location?: string;
      userProfile: any;
    }) => {
      const response = await apiRequest('/api/scrape/intelligent', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    onMutate: () => {
      setIsScrapingActive(true);
      setScrapingProgress(0);
      // Simulate progress
      const interval = setInterval(() => {
        setScrapingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
    },
    onSuccess: (data: any) => {
      setIsScrapingActive(false);
      setScrapingProgress(100);
      const results = data.results || data;
      setScrapingResults(results);
      toast({
        title: "Scraping Complete",
        description: `Found ${results.startups?.length || 0} startups, ${results.opportunities?.length || 0} opportunities, and ${results.events?.length || 0} events.`
      });
    },
    onError: () => {
      setIsScrapingActive(false);
      setScrapingProgress(0);
      toast({
        title: "Scraping Failed",
        description: "Unable to complete the scraping process. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleStartScraping = () => {
    startScraping.mutate({
      query: searchQuery,
      sector: selectedSector,
      location: selectedLocation,
      userProfile: {
        role: user.role,
        sector: user.sector,
        location: user.location,
        interests: user.interests
      }
    });
  };

  const getRoleSpecificSuggestions = () => {
    switch (user.role) {
      case 'STARTUP_FOUNDER':
        return [
          'funding opportunities for early-stage startups',
          'accelerator programs in Malaysia',
          'potential co-founders in ' + (user.sector || 'technology'),
          'industry events and networking opportunities'
        ];
      case 'FUNDER':
        return [
          'promising startups seeking investment',
          'market trends in ' + (user.sector || 'technology') + ' sector',
          'exit opportunities and success stories',
          'due diligence insights and reports'
        ];
      default:
        return [
          'startup ecosystem updates',
          'investment trends in Malaysia',
          'emerging opportunities',
          'industry networking events'
        ];
    }
  };

  const confidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const confidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle>Intelligent Market Research</CardTitle>
          </div>
          <CardDescription>
            AI-powered scraping and analysis tailored for {user.role === 'STARTUP_FOUNDER' ? 'founders' : user.role === 'FUNDER' ? 'investors' : 'ecosystem builders'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search Query</label>
              <Textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., 'sustainable agriculture startups in Southeast Asia'"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sector Focus</label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sectors</SelectItem>
                  <SelectItem value="HealthTech">HealthTech</SelectItem>
                  <SelectItem value="FinTech">FinTech</SelectItem>
                  <SelectItem value="EdTech">EdTech</SelectItem>
                  <SelectItem value="AgriTech">AgriTech</SelectItem>
                  <SelectItem value="CleanTech">CleanTech</SelectItem>
                  <SelectItem value="Social Innovation">Social Innovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malaysia">Malaysia</SelectItem>
                  <SelectItem value="singapore">Singapore</SelectItem>
                  <SelectItem value="indonesia">Indonesia</SelectItem>
                  <SelectItem value="thailand">Thailand</SelectItem>
                  <SelectItem value="vietnam">Vietnam</SelectItem>
                  <SelectItem value="philippines">Philippines</SelectItem>
                  <SelectItem value="southeast-asia">Southeast Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Suggestions for {user.role === 'STARTUP_FOUNDER' ? 'Founders' : user.role === 'FUNDER' ? 'Investors' : 'Builders'}</label>
            <div className="flex flex-wrap gap-2">
              {getRoleSpecificSuggestions().map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {isScrapingActive && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Scraping in progress...</span>
                <span>{Math.round(scrapingProgress)}%</span>
              </div>
              <Progress value={scrapingProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                AI is analyzing multiple sources and filtering results based on your profile
              </p>
            </div>
          )}

          <Button 
            onClick={handleStartScraping}
            disabled={isScrapingActive}
            className="w-full"
          >
            {isScrapingActive ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Sources...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Start Intelligent Research
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {scrapingResults && (
        <Tabs defaultValue="startups" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="startups" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Startups ({scrapingResults.startups.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Opportunities ({scrapingResults.opportunities.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events ({scrapingResults.events.length})
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="startups" className="space-y-4">
            {scrapingResults.startups.map((startup, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{startup.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{startup.sector}</Badge>
                        <Badge variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          {startup.location}
                        </Badge>
                        {startup.stage && <Badge variant="outline">{startup.stage}</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${confidenceColor(startup.confidence)}`}>
                        {confidenceLabel(startup.confidence)} Confidence
                      </div>
                      <div className="text-xs text-muted-foreground">{startup.source}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">{startup.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {startup.foundedYear && <span>Founded {startup.foundedYear}</span>}
                      {startup.fundingAmount && <span>Funding: {startup.fundingAmount}</span>}
                    </div>
                    {startup.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={startup.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            {scrapingResults.opportunities.map((opportunity, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{opportunity.type}</Badge>
                        <Badge variant="outline">{opportunity.provider}</Badge>
                        {opportunity.sector && <Badge variant="outline">{opportunity.sector}</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${confidenceColor(opportunity.confidence)}`}>
                        {confidenceLabel(opportunity.confidence)} Match
                      </div>
                      <div className="text-xs text-muted-foreground">{opportunity.source}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {opportunity.amount && <span>Amount: {opportunity.amount}</span>}
                      {opportunity.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {opportunity.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={opportunity.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Apply
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {scrapingResults.events.map((event, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {event.venue && (
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.venue}
                          </Badge>
                        )}
                        {event.date && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${confidenceColor(event.confidence)}`}>
                        {confidenceLabel(event.confidence)} Relevance
                      </div>
                      <div className="text-xs text-muted-foreground">{event.source}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                  <div className="flex justify-end">
                    {event.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={event.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Learn More
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scrapingResults.insights.marketTrends.map((trend, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">{trend}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{scrapingResults.insights.keyFindings}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scrapingResults.insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}