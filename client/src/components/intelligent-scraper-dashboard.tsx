import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Brain, Search, TrendingUp, Target, Import, Loader2, ExternalLink } from "lucide-react";

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

interface MarketIntelligence {
  trends: string[];
  opportunities: any[];
  competitors: any[];
  insights: string;
}

export function IntelligentScraperDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("intelligent");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Intelligent scraping mutation
  const intelligentScrapeMutation = useMutation({
    mutationFn: () => fetch('/api/scrape/intelligent', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Intelligent Scraping Complete",
        description: "Found personalized opportunities based on your profile"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to perform intelligent scraping",
        variant: "destructive"
      });
    }
  });

  // Personalized search mutation
  const personalizedSearchMutation = useMutation({
    mutationFn: (data: { query: string; preferences?: any }) => 
      fetch('/api/scrape/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Search Complete",
        description: "Found relevant results for your query"
      });
    }
  });

  // Market intelligence query
  const { data: marketIntelligence, isLoading: isLoadingIntelligence } = useQuery({
    queryKey: ['/api/scrape/market-intelligence', selectedSector, selectedLocation],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedSector) params.set('sector', selectedSector);
      if (selectedLocation) params.set('location', selectedLocation);
      
      return fetch(`/api/scrape/market-intelligence?${params}`)
        .then(res => res.json())
        .then(data => data.intelligence as MarketIntelligence);
    },
    enabled: !!(selectedSector || selectedLocation)
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (results: ScrapingResult) =>
      fetch('/api/scrape/intelligent/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results })
      }).then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Imported ${data.imported.startups} startups, ${data.imported.opportunities} opportunities, ${data.imported.events} events`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/search'] });
      queryClient.invalidateQueries({ queryKey: ['/api/startups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    }
  });

  const handleIntelligentScrape = () => {
    intelligentScrapeMutation.mutate();
  };

  const handlePersonalizedSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    personalizedSearchMutation.mutate({
      query: searchQuery,
      preferences: {
        sector: selectedSector,
        location: selectedLocation
      }
    });
  };

  const handleImportSelected = () => {
    const scrapingData = intelligentScrapeMutation.data?.results;
    if (!scrapingData || selectedItems.size === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to import",
        variant: "destructive"
      });
      return;
    }

    // Filter selected items based on selectedItems set
    const filteredResults: ScrapingResult = {
      startups: scrapingData.startups.filter((_, idx) => selectedItems.has(`startup-${idx}`)),
      opportunities: scrapingData.opportunities.filter((_, idx) => selectedItems.has(`opportunity-${idx}`)),
      events: scrapingData.events.filter((_, idx) => selectedItems.has(`event-${idx}`)),
      insights: scrapingData.insights
    };

    importMutation.mutate(filteredResults);
  };

  const toggleItemSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const scrapingResults = intelligentScrapeMutation.data?.results as ScrapingResult;
  const personalizedResults = personalizedSearchMutation.data?.results;

  const renderConfidenceBadge = (confidence: number) => {
    const variant = confidence >= 0.8 ? "default" : confidence >= 0.6 ? "secondary" : "outline";
    return (
      <Badge variant={variant} className="ml-2">
        {Math.round(confidence * 100)}% confident
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">AI-Powered Ecosystem Intelligence</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="intelligent">
            <Brain className="h-4 w-4 mr-2" />
            Smart Discovery
          </TabsTrigger>
          <TabsTrigger value="personalized">
            <Search className="h-4 w-4 mr-2" />
            Custom Search
          </TabsTrigger>
          <TabsTrigger value="intelligence">
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Intel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Profile-Based Discovery
              </CardTitle>
              <CardDescription>
                AI analyzes your profile to find the most relevant opportunities, startups, and events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleIntelligentScrape}
                disabled={intelligentScrapeMutation.isPending}
                className="w-full"
                size="lg"
              >
                {intelligentScrapeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Discover Personalized Opportunities
              </Button>

              {scrapingResults && (
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Discovery Results</h3>
                    <Button 
                      onClick={handleImportSelected}
                      disabled={selectedItems.size === 0 || importMutation.isPending}
                      variant="outline"
                    >
                      <Import className="h-4 w-4 mr-2" />
                      Import Selected ({selectedItems.size})
                    </Button>
                  </div>

                  {/* Insights Summary */}
                  <Card className="bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader>
                      <CardTitle className="text-sm">Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{scrapingResults.insights.keyFindings}</p>
                      {scrapingResults.insights.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Recommendations:</h4>
                          <ul className="text-sm space-y-1">
                            {scrapingResults.insights.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Startups */}
                  {scrapingResults.startups.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Relevant Startups ({scrapingResults.startups.length})</h4>
                      <div className="space-y-2">
                        {scrapingResults.startups.map((startup, idx) => (
                          <Card key={idx} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox
                                  checked={selectedItems.has(`startup-${idx}`)}
                                  onCheckedChange={() => toggleItemSelection(`startup-${idx}`)}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium">{startup.name}</h5>
                                    {startup.website && (
                                      <a href={startup.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                    {renderConfidenceBadge(startup.confidence)}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{startup.description}</p>
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">{startup.sector}</Badge>
                                    <Badge variant="outline" className="text-xs">{startup.location}</Badge>
                                    {startup.stage && <Badge variant="outline" className="text-xs">{startup.stage}</Badge>}
                                    {startup.fundingAmount && <Badge variant="outline" className="text-xs">{startup.fundingAmount}</Badge>}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Source: {startup.source}</p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opportunities */}
                  {scrapingResults.opportunities.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Funding Opportunities ({scrapingResults.opportunities.length})</h4>
                      <div className="space-y-2">
                        {scrapingResults.opportunities.map((opportunity, idx) => (
                          <Card key={idx} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox
                                  checked={selectedItems.has(`opportunity-${idx}`)}
                                  onCheckedChange={() => toggleItemSelection(`opportunity-${idx}`)}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium">{opportunity.title}</h5>
                                    {opportunity.link && (
                                      <a href={opportunity.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                    {renderConfidenceBadge(opportunity.confidence)}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{opportunity.description}</p>
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">{opportunity.type}</Badge>
                                    <Badge variant="outline" className="text-xs">{opportunity.provider}</Badge>
                                    {opportunity.amount && <Badge variant="outline" className="text-xs">{opportunity.amount}</Badge>}
                                    {opportunity.deadline && (
                                      <Badge variant="destructive" className="text-xs">
                                        Due: {new Date(opportunity.deadline).toLocaleDateString()}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Source: {opportunity.source}</p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {scrapingResults.events.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Relevant Events ({scrapingResults.events.length})</h4>
                      <div className="space-y-2">
                        {scrapingResults.events.map((event, idx) => (
                          <Card key={idx} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox
                                  checked={selectedItems.has(`event-${idx}`)}
                                  onCheckedChange={() => toggleItemSelection(`event-${idx}`)}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium">{event.name}</h5>
                                    {event.link && (
                                      <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                    {renderConfidenceBadge(event.confidence)}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                  <div className="flex gap-2 mt-2">
                                    {event.date && (
                                      <Badge variant="outline" className="text-xs">
                                        {new Date(event.date).toLocaleDateString()}
                                      </Badge>
                                    )}
                                    {event.venue && <Badge variant="outline" className="text-xs">{event.venue}</Badge>}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Source: {event.source}</p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalized" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Intelligence Search</CardTitle>
              <CardDescription>
                Search for specific information tailored to your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sector Focus</label>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="healthtech">HealthTech</SelectItem>
                      <SelectItem value="edtech">EdTech</SelectItem>
                      <SelectItem value="agritech">AgriTech</SelectItem>
                      <SelectItem value="climate">Climate/Environment</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="ai">Artificial Intelligence</SelectItem>
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search Query</label>
                <Textarea
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your specific search query (e.g., 'funding opportunities for sustainable agriculture startups')"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handlePersonalizedSearch}
                disabled={personalizedSearchMutation.isPending || !searchQuery.trim()}
                className="w-full"
              >
                {personalizedSearchMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Search Intelligence
              </Button>

              {personalizedResults && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold">Search Results</h3>
                  {personalizedResults.map((result: any, idx: number) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{result.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">{result.category}</Badge>
                            {result.url && (
                              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs">
                                View Source <ExternalLink className="h-3 w-3 inline ml-1" />
                              </a>
                            )}
                          </div>
                        </div>
                        {renderConfidenceBadge(result.relevanceScore / 100)}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Intelligence</CardTitle>
              <CardDescription>
                Real-time market trends, competitive analysis, and strategic insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingIntelligence ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Analyzing market data...</span>
                </div>
              ) : marketIntelligence ? (
                <div className="space-y-6">
                  {/* Market Trends */}
                  {marketIntelligence.trends.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Market Trends</h4>
                      <div className="grid gap-2">
                        {marketIntelligence.trends.map((trend, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{trend}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategic Insights */}
                  {marketIntelligence.insights && (
                    <div>
                      <h4 className="font-medium mb-3">Strategic Insights</h4>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-sm">{marketIntelligence.insights}</p>
                      </div>
                    </div>
                  )}

                  {/* Opportunities */}
                  {marketIntelligence.opportunities.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Market Opportunities</h4>
                      <div className="space-y-2">
                        {marketIntelligence.opportunities.slice(0, 5).map((opp, idx) => (
                          <Card key={idx} className="p-3">
                            <h5 className="font-medium text-sm">{opp.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{opp.description}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select sector and location to view market intelligence</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}