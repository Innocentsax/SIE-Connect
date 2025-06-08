import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search, ExternalLink, Calendar, MapPin, Building2, ArrowLeft, Filter } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const scrapingConfigSchema = z.object({
  sector: z.string().min(1, "Sector focus is required"),
  geography: z.string().min(1, "Geographic focus is required"),
  keywords: z.string().optional(),
  dataSources: z.array(z.string()).min(1, "Please select at least one data source"),
});

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

export function IntelligentScrapingPanel() {
  const [isConfigMode, setIsConfigMode] = useState(true);
  const [scrapingResults, setScrapingResults] = useState<ScrapingResult | null>(null);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(scrapingConfigSchema),
    defaultValues: {
      sector: "",
      geography: "",
      keywords: "",
      dataSources: [],
    },
  });

  const dataSources = [
    { id: "mdec", name: "MDEC (Malaysia Digital Economy)", description: "Malaysian government digital initiatives" },
    { id: "magic", name: "MaGIC", description: "Malaysian startup accelerator and community" },
    { id: "techcrunch", name: "TechCrunch", description: "Global tech startup news and funding data" },
    { id: "worldbank", name: "World Bank", description: "Development funding and grants database" },
    { id: "pitchbook", name: "PitchBook", description: "Venture capital and private equity data" },
    { id: "crunchbase", name: "Crunchbase", description: "Company and funding information" },
    { id: "startupblink", name: "StartupBlink", description: "Global startup ecosystem rankings" },
    { id: "dealstreetasia", name: "DealStreetAsia", description: "Asian startup and investment news" },
  ];

  const sectors = [
    "FinTech", "HealthTech", "EdTech", "AgriTech", "CleanTech", 
    "E-commerce", "AI/ML", "IoT", "Blockchain", "Cybersecurity",
    "Gaming", "Media & Entertainment", "Travel & Hospitality", "Logistics"
  ];

  const geographies = [
    "Malaysia", "Southeast Asia", "Asia-Pacific", "Singapore", 
    "Indonesia", "Thailand", "Vietnam", "Philippines", "Global"
  ];

  const scrapingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof scrapingConfigSchema>) => {
      const response = await fetch("/api/scraping/intelligent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Scraping failed");
      return response.json();
    },
    onSuccess: (data) => {
      setScrapingResults(data);
      setIsConfigMode(false);
      toast({ title: "Scraping completed successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to complete scraping. Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleStartScraping = (data: z.infer<typeof scrapingConfigSchema>) => {
    setScrapingProgress(0);
    scrapingMutation.mutate(data);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setScrapingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const handleNewSearch = () => {
    setIsConfigMode(true);
    setScrapingResults(null);
    setScrapingProgress(0);
    form.reset();
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "No deadline";
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  if (!isConfigMode && scrapingResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleNewSearch}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            New Search
          </Button>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Filter className="h-3 w-3" />
            {form.getValues("sector")} • {form.getValues("geography")}
          </Badge>
        </div>

        <div className="grid gap-6">
          {/* Market Insights */}
          {scrapingResults.insights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Findings</h4>
                  <p className="text-gray-600 dark:text-gray-400">{scrapingResults.insights.keyFindings}</p>
                </div>
                
                {scrapingResults.insights.marketTrends.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Market Trends</h4>
                    <div className="flex flex-wrap gap-2">
                      {scrapingResults.insights.marketTrends.map((trend, index) => (
                        <Badge key={index} variant="outline">{trend}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {scrapingResults.insights.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {scrapingResults.insights.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Opportunities */}
          {scrapingResults.opportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Funding Opportunities ({scrapingResults.opportunities.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {scrapingResults.opportunities.map((opportunity, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{opportunity.title}</h3>
                            {opportunity.link && (
                              <a
                                href={opportunity.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {opportunity.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 text-sm">
                            <Badge variant="secondary">{opportunity.type}</Badge>
                            {opportunity.sector && <Badge variant="outline">{opportunity.sector}</Badge>}
                            {opportunity.location && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {opportunity.location}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {opportunity.provider}
                              </div>
                              {opportunity.amount && (
                                <div className="font-medium text-green-600">
                                  {opportunity.amount}
                                </div>
                              )}
                            </div>
                            {opportunity.deadline && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(opportunity.deadline)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{opportunity.source}</div>
                          <div className="text-xs font-medium text-green-600">
                            {Math.round(opportunity.confidence * 100)}% match
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Startups */}
          {scrapingResults.startups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Relevant Startups ({scrapingResults.startups.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {scrapingResults.startups.map((startup, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{startup.name}</h3>
                            {startup.website && (
                              <a
                                href={startup.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {startup.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 text-sm">
                            <Badge variant="secondary">{startup.sector}</Badge>
                            {startup.stage && <Badge variant="outline">{startup.stage}</Badge>}
                            <div className="flex items-center gap-1 text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {startup.location}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              {startup.foundedYear && (
                                <div>Founded: {startup.foundedYear}</div>
                              )}
                              {startup.fundingAmount && (
                                <div className="font-medium text-green-600">
                                  {startup.fundingAmount}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{startup.source}</div>
                          <div className="text-xs font-medium text-green-600">
                            {Math.round(startup.confidence * 100)}% match
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events */}
          {scrapingResults.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events ({scrapingResults.events.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {scrapingResults.events.map((event, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{event.name}</h3>
                            {event.link && (
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {event.date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(event.date)}
                              </div>
                            )}
                            {event.venue && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.venue}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{event.source}</div>
                          <div className="text-xs font-medium text-green-600">
                            {Math.round(event.confidence * 100)}% match
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-6 w-6" />
          Intelligent Web Scraping Panel
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your scraping parameters to discover real-time opportunities, startups, and market insights.
        </p>
      </CardHeader>

      <CardContent>
        {scrapingMutation.isPending ? (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">Scraping in Progress...</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Gathering data from selected sources. This may take a few moments.
              </p>
              <Progress value={scrapingProgress} className="max-w-md mx-auto" />
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleStartScraping)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sector" className="text-base font-medium">
                    Sector Focus *
                  </Label>
                  <Select onValueChange={(value) => form.setValue("sector", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select industry sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.sector && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.sector.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="geography" className="text-base font-medium">
                    Geographic Focus *
                  </Label>
                  <Select onValueChange={(value) => form.setValue("geography", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select geographic region" />
                    </SelectTrigger>
                    <SelectContent>
                      {geographies.map((geo) => (
                        <SelectItem key={geo} value={geo}>
                          {geo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.geography && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.geography.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="keywords" className="text-base font-medium">
                    Additional Keywords
                  </Label>
                  <Textarea
                    id="keywords"
                    {...form.register("keywords")}
                    placeholder="Enter specific keywords to refine your search (e.g., AI, blockchain, sustainability)"
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Add specific terms to narrow your search results
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Data Sources *</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Select the sources you want to scrape from
                </p>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {dataSources.map((source) => (
                    <div key={source.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <Checkbox
                        id={source.id}
                        onCheckedChange={(checked) => {
                          const currentSources = form.getValues("dataSources");
                          if (checked) {
                            form.setValue("dataSources", [...currentSources, source.id]);
                          } else {
                            form.setValue("dataSources", currentSources.filter(s => s !== source.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor={source.id} className="cursor-pointer font-medium">
                          {source.name}
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          {source.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {form.formState.errors.dataSources && (
                  <p className="text-red-500 text-sm mt-2">
                    {form.formState.errors.dataSources.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg"
                disabled={!form.watch("sector") || !form.watch("geography") || form.watch("dataSources").length === 0}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Start Intelligent Scraping
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}