import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Loader2, 
  Globe, 
  Target, 
  TrendingUp, 
  Building, 
  Calendar,
  MapPin,
  ExternalLink,
  Download,
  RefreshCw,
  Database,
  Zap,
  Eye,
  Plus,
  Filter
} from "lucide-react";

interface User {
  id: number;
  role: string;
  name: string;
  sector?: string;
  location?: string;
  stage?: string;
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

interface WebScrapingDashboardProps {
  user: User;
}

export function WebScrapingDashboard({ user }: WebScrapingDashboardProps) {
  const [selectedSector, setSelectedSector] = useState(user.sector || "");
  const [selectedLocation, setSelectedLocation] = useState(user.location || "malaysia");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [customKeywords, setCustomKeywords] = useState("");
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingResults, setScrapingResults] = useState<ScrapingResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const availableSources = [
    { id: "mdec", name: "MDEC", description: "Malaysia Digital Economy Corporation" },
    { id: "cradle", name: "Cradle Fund", description: "Government funding agency" },
    { id: "magic", name: "MaGIC", description: "Malaysian Global Innovation & Creativity Centre" },
    { id: "techcrunch", name: "TechCrunch", description: "Tech news and startups" },
    { id: "techinasia", name: "Tech in Asia", description: "Asian startup ecosystem" },
    { id: "dealstreetasia", name: "DealStreetAsia", description: "Investment and startup news" },
    { id: "linkedin", name: "LinkedIn", description: "Professional network updates" },
    { id: "startup_malaysia", name: "Startup Malaysia", description: "Local startup community" }
  ];

  const scrapeMutation = useMutation({
    mutationFn: async (params: {
      sector: string;
      location: string;
      sources: string[];
      keywords?: string;
    }) => {
      const response = await fetch("/api/scraping/intelligent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: {
            role: user.role,
            sector: params.sector,
            location: params.location,
            interests: params.keywords?.split(',').map(k => k.trim()).filter(Boolean) || [],
            experience: user.stage,
            stage: user.stage,
            preferences: {
              dataTypes: ["startups", "opportunities", "events"],
              updateFrequency: "daily",
              sources: params.sources
            }
          }
        }),
      });
      if (!response.ok) throw new Error("Failed to start scraping");
      return response.json() as Promise<ScrapingResult>;
    },
    onMutate: () => {
      setIsScrapingActive(true);
      setScrapingProgress(0);
      // Simulate progress
      const interval = setInterval(() => {
        setScrapingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 800);
    },
    onSuccess: (data) => {
      setScrapingProgress(100);
      setScrapingResults(data);
      setIsScrapingActive(false);
      toast({
        title: "Scraping Complete",
        description: `Found ${data.startups.length} startups, ${data.opportunities.length} opportunities, and ${data.events.length} events`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/search'] });
    },
    onError: () => {
      setIsScrapingActive(false);
      setScrapingProgress(0);
      toast({
        title: "Scraping Failed",
        description: "Unable to complete web scraping. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartScraping = () => {
    if (!selectedSector || selectedSources.length === 0) {
      toast({
        title: "Missing Configuration",
        description: "Please select a sector and at least one data source.",
        variant: "destructive",
      });
      return;
    }

    scrapeMutation.mutate({
      sector: selectedSector,
      location: selectedLocation,
      sources: selectedSources,
      keywords: customKeywords
    });
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
          <Globe className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Intelligent Web Scraping</h1>
          <p className="text-muted-foreground">
            Discover real-time opportunities and insights from across the web
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Scraping Configuration
              </CardTitle>
              <CardDescription>
                Customize your data collection preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sector Focus</label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger>
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
                    <SelectItem value="logistics">Logistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Geographic Focus</label>
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
                    <SelectItem value="southeast-asia">Southeast Asia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Keywords</label>
                <Textarea
                  placeholder="Enter keywords separated by commas (e.g., Series A, accelerator, grant)"
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Sources ({selectedSources.length} selected)</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {availableSources.map((source) => (
                    <div
                      key={source.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSources.includes(source.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleSource(source.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded border-2 ${
                          selectedSources.includes(source.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedSources.includes(source.id) && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleStartScraping} 
                disabled={isScrapingActive || !selectedSector || selectedSources.length === 0}
                className="w-full"
              >
                {isScrapingActive ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Start Intelligent Scraping
                  </>
                )}
              </Button>

              {isScrapingActive && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(scrapingProgress)}%</span>
                  </div>
                  <Progress value={scrapingProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {scrapingResults && (
            <Tabs defaultValue="startups" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="startups">Startups ({scrapingResults.startups?.length || 0})</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities ({scrapingResults.opportunities?.length || 0})</TabsTrigger>
                <TabsTrigger value="events">Events ({scrapingResults.events?.length || 0})</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="startups" className="space-y-4">
                <div className="grid gap-4">
                  {scrapingResults.startups?.map((startup, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{startup.name}</h3>
                              <Badge variant="outline">{startup.sector}</Badge>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(startup.confidence * 100)}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{startup.description}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {startup.location}
                              </span>
                              {startup.stage && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {startup.stage}
                                </span>
                              )}
                              {startup.fundingAmount && (
                                <span className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {startup.fundingAmount}
                                </span>
                              )}
                            </div>
                          </div>
                          {startup.website && (
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                <div className="grid gap-4">
                  {scrapingResults.opportunities?.map((opportunity, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{opportunity.title}</h3>
                              <Badge variant="outline">{opportunity.type}</Badge>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(opportunity.confidence * 100)}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{opportunity.description}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {opportunity.provider}
                              </span>
                              {opportunity.amount && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {opportunity.amount}
                                </span>
                              )}
                              {opportunity.deadline && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(opportunity.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm">Apply</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <div className="grid gap-4">
                  {scrapingResults.events?.map((event, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{event.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(event.confidence * 100)}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              {event.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              )}
                              {event.venue && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.venue}
                                </span>
                              )}
                            </div>
                          </div>
                          {event.link && (
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {scrapingResults.insights?.marketTrends?.map((trend, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 mt-0.5 text-blue-500" />
                            <span className="text-sm">{trend}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Key Findings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{scrapingResults.insights?.keyFindings || "No key findings available"}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {scrapingResults.insights?.recommendations?.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Zap className="h-4 w-4 mt-0.5 text-green-500" />
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!scrapingResults && !isScrapingActive && (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Discover</h3>
                <p className="text-muted-foreground">
                  Configure your preferences and start intelligent web scraping to discover opportunities
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}