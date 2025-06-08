import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AIChatAssistant } from "@/components/ai-chat-assistant";
import { IntelligentScrapingDashboard } from "@/components/intelligent-scraping-dashboard";
import { OpportunityApplication } from "@/components/opportunity-application";
import { 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Star, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Building,
  Users,
  Target,
  Lightbulb,
  MessageCircle,
  Heart,
  ChevronRight,
  Bot,
  Zap,
  Plus,
  Eye
} from "lucide-react";

interface User {
  id: number;
  role: string;
  name: string;
  sector?: string;
  location?: string;
  stage?: string;
  interests?: string[];
}

interface Opportunity {
  id: number;
  title: string;
  description: string;
  type: string;
  provider: string;
  sector?: string;
  location?: string;
  deadline?: Date;
  amount?: string;
  link?: string;
  applicationMethod: 'platform' | 'external';
  matchScore?: number;
  tags: string[];
  featured?: boolean;
  trending?: boolean;
}

interface Startup {
  id: number;
  name: string;
  description: string;
  sector: string;
  location: string;
  stage?: string;
  website?: string;
  foundedYear?: number;
  employeeCount?: number;
  matchScore?: number;
  tags: string[];
  traction?: {
    revenue?: string;
    users?: string;
    growth?: string;
  };
}

interface DiscoveryPageProps {
  user: User;
}

export function DiscoveryPage({ user }: DiscoveryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    type: "",
    sector: "",
    location: "",
    stage: ""
  });
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState("discover");
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [showBrowseStartups, setShowBrowseStartups] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch personalized recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['/api/discovery/recommendations', user.role],
    queryFn: () => fetch('/api/discovery/recommendations').then(res => res.json())
  });

  // Fetch search results
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['/api/discovery/search', searchQuery, selectedFilters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      return fetch(`/api/discovery/search?${params}`).then(res => res.json());
    },
    enabled: !!(searchQuery || Object.values(selectedFilters).some(Boolean))
  });

  // Save/bookmark mutation
  const saveMutation = useMutation({
    mutationFn: (data: { itemId: string; itemType: 'opportunity' | 'startup'; action: 'save' | 'unsave' }) =>
      fetch('/api/discovery/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: (data, variables) => {
      const itemKey = `${variables.itemType}-${variables.itemId}`;
      const newSavedItems = new Set(savedItems);
      
      if (variables.action === 'save') {
        newSavedItems.add(itemKey);
        toast({ title: "Saved!", description: "Added to your saved items" });
      } else {
        newSavedItems.delete(itemKey);
        toast({ title: "Removed", description: "Removed from saved items" });
      }
      
      setSavedItems(newSavedItems);
      queryClient.invalidateQueries({ queryKey: ['/api/discovery/saved'] });
    }
  });

  const handleSaveItem = (itemId: string, itemType: 'opportunity' | 'startup') => {
    const itemKey = `${itemType}-${itemId}`;
    const action = savedItems.has(itemKey) ? 'unsave' : 'save';
    saveMutation.mutate({ itemId, itemType, action });
  };

  const renderFounderDiscovery = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Discover Your Next Opportunity</h1>
        <p className="text-muted-foreground mb-4">
          Find funding programs, accelerators, and support that match your startup's needs
        </p>
        
        {/* Search Bar */}
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for accelerators, grants, investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={selectedFilters.type} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Opportunity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="funding">Funding</SelectItem>
            <SelectItem value="accelerator">Accelerators</SelectItem>
            <SelectItem value="grant">Grants</SelectItem>
            <SelectItem value="competition">Competitions</SelectItem>
            <SelectItem value="event">Events</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedFilters.sector} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, sector: value }))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sectors</SelectItem>
            <SelectItem value="fintech">FinTech</SelectItem>
            <SelectItem value="healthtech">HealthTech</SelectItem>
            <SelectItem value="edtech">EdTech</SelectItem>
            <SelectItem value="climate">Climate/Environment</SelectItem>
            <SelectItem value="ai">AI/ML</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedFilters.stage} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, stage: value }))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Stages</SelectItem>
            <SelectItem value="idea">Idea</SelectItem>
            <SelectItem value="mvp">MVP</SelectItem>
            <SelectItem value="seed">Seed</SelectItem>
            <SelectItem value="series-a">Series A</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="recommended" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommended">Recommended for You</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
          <TabsTrigger value="all">All Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Personalized for {user.name}</h3>
            <Badge variant="secondary">{user.sector}</Badge>
            <Badge variant="outline">{user.stage}</Badge>
          </div>
          
          {isLoadingRecommendations ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations?.opportunities?.slice(0, 6).map((opportunity: Opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onSave={() => handleSaveItem(opportunity.id.toString(), 'opportunity')}
                  isSaved={savedItems.has(`opportunity-${opportunity.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Trending Opportunities</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations?.trending?.map((opportunity: Opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onSave={() => handleSaveItem(opportunity.id.toString(), 'opportunity')}
                isSaved={savedItems.has(`opportunity-${opportunity.id}`)}
                showTrending
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold">Closing Soon</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations?.deadlines?.map((opportunity: Opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onSave={() => handleSaveItem(opportunity.id.toString(), 'opportunity')}
                isSaved={savedItems.has(`opportunity-${opportunity.id}`)}
                showDeadline
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {searchResults && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.opportunities?.map((opportunity: Opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onSave={() => handleSaveItem(opportunity.id.toString(), 'opportunity')}
                  isSaved={savedItems.has(`opportunity-${opportunity.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderInvestorDiscovery = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Discover Promising Startups</h1>
        <p className="text-muted-foreground mb-4">
          Find startups that match your investment criteria and portfolio focus
        </p>
        
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search startups by industry, stage, traction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Recommended Startups</TabsTrigger>
          <TabsTrigger value="trending">High Growth</TabsTrigger>
          <TabsTrigger value="ecosystem">Ecosystem Updates</TabsTrigger>
          <TabsTrigger value="followed">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Matched to Your Investment Focus</h3>
            <Badge variant="secondary">{user.sector}</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations?.startups?.slice(0, 6).map((startup: Startup) => (
              <StartupCard
                key={startup.id}
                startup={startup}
                onSave={() => handleSaveItem(startup.id.toString(), 'startup')}
                isSaved={savedItems.has(`startup-${startup.id}`)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">High Growth Startups</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations?.trending?.map((startup: Startup) => (
              <StartupCard
                key={startup.id}
                startup={startup}
                onSave={() => handleSaveItem(startup.id.toString(), 'startup')}
                isSaved={savedItems.has(`startup-${startup.id}`)}
                showTraction
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderBuilderDiscovery = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Ecosystem Builder Hub</h1>
        <p className="text-muted-foreground mb-4">
          Connect with startups, promote your programs, and build partnerships
        </p>
        
        <div className="flex gap-3">
          <Dialog open={showCreateProgram} onOpenChange={setShowCreateProgram}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Program</DialogTitle>
                <DialogDescription>
                  Design a new program to support startups in your ecosystem
                </DialogDescription>
              </DialogHeader>
              <CreateProgramForm onClose={() => setShowCreateProgram(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={showBrowseStartups} onOpenChange={setShowBrowseStartups}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Browse Startups
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Browse Startups</DialogTitle>
                <DialogDescription>
                  Discover and connect with startups in your ecosystem
                </DialogDescription>
              </DialogHeader>
              <BrowseStartupsModal onClose={() => setShowBrowseStartups(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="startups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="startups">Discover Startups</TabsTrigger>
          <TabsTrigger value="programs">Your Programs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
        </TabsList>

        <TabsContent value="startups" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Startups Looking for Support</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations?.startups?.map((startup: Startup) => (
              <StartupCard
                key={startup.id}
                startup={startup}
                onSave={() => handleSaveItem(startup.id.toString(), 'startup')}
                isSaved={savedItems.has(`startup-${startup.id}`)}
                showInviteAction
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Chat Assistant Button
  const renderChatAssistant = () => (
    <Button
      onClick={() => setShowChatbot(!showChatbot)}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        {user.role === 'STARTUP_FOUNDER' && renderFounderDiscovery()}
        {user.role === 'FUNDER' && renderInvestorDiscovery()}
        {user.role === 'ECOSYSTEM_BUILDER' && renderBuilderDiscovery()}
        
        {renderChatAssistant()}
        
        {showChatbot && (
          <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border">
            <ChatAssistant user={user} onClose={() => setShowChatbot(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

// Create Program Form Component
function CreateProgramForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    sector: '',
    deadline: '',
    amount: '',
    criteria: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          deadline: formData.deadline ? new Date(formData.deadline) : null,
          provider: 'Ecosystem Builder Program'
        })
      });

      if (response.ok) {
        toast({
          title: "Program Created",
          description: "Your new program has been created successfully."
        });
        onClose();
      } else {
        throw new Error('Failed to create program');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create program. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Program Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="e.g., FinTech Accelerator Program"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Describe your program, what it offers, and who can apply..."
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Program Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accelerator">Accelerator</SelectItem>
              <SelectItem value="incubator">Incubator</SelectItem>
              <SelectItem value="grant">Grant</SelectItem>
              <SelectItem value="funding">Funding</SelectItem>
              <SelectItem value="mentorship">Mentorship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sector">Focus Sector</Label>
          <Select value={formData.sector} onValueChange={(value) => setFormData({...formData, sector: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fintech">FinTech</SelectItem>
              <SelectItem value="healthtech">HealthTech</SelectItem>
              <SelectItem value="edtech">EdTech</SelectItem>
              <SelectItem value="climate">Climate/Environment</SelectItem>
              <SelectItem value="ai">AI/ML</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deadline">Application Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="amount">Program Value</Label>
          <Input
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            placeholder="e.g., RM 100,000"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="criteria">Selection Criteria</Label>
        <Textarea
          id="criteria"
          value={formData.criteria}
          onChange={(e) => setFormData({...formData, criteria: e.target.value})}
          placeholder="What criteria will you use to select participants?"
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Create Program</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

// Browse Startups Modal Component
function BrowseStartupsModal({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const { toast } = useToast();
  
  const { data: startups, isLoading } = useQuery({
    queryKey: ['/api/startups', { sector: selectedSector, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSector) params.append('sector', selectedSector);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/startups?${params}`);
      return response.json();
    }
  });

  const handleInviteStartup = async (startupId: number) => {
    try {
      // This would typically send an invitation
      toast({
        title: "Invitation Sent",
        description: "Startup has been invited to connect with your program."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search startups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sectors</SelectItem>
            <SelectItem value="fintech">FinTech</SelectItem>
            <SelectItem value="healthtech">HealthTech</SelectItem>
            <SelectItem value="edtech">EdTech</SelectItem>
            <SelectItem value="climate">Climate</SelectItem>
            <SelectItem value="ai">AI/ML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Startups Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 max-h-96 overflow-y-auto">
          {startups?.map((startup: any) => (
            <Card key={startup.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{startup.name}</CardTitle>
                    <CardDescription>{startup.sector} • {startup.location}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  {startup.stage && <Badge variant="secondary">{startup.stage}</Badge>}
                  {startup.foundedYear && (
                    <Badge variant="outline">Founded {startup.foundedYear}</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {startup.description}
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleInviteStartup(startup.id)}
                  >
                    Invite to Program
                  </Button>
                  {startup.website && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(startup.website, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

// Opportunity Card Component
function OpportunityCard({ 
  opportunity, 
  onSave, 
  isSaved, 
  showTrending = false, 
  showDeadline = false 
}: {
  opportunity: Opportunity;
  onSave: () => void;
  isSaved: boolean;
  showTrending?: boolean;
  showDeadline?: boolean;
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              {opportunity.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {opportunity.provider}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex gap-2 flex-wrap mt-2">
          <Badge variant="secondary">{opportunity.type}</Badge>
          {opportunity.sector && (
            <Badge variant="outline">{opportunity.sector}</Badge>
          )}
          {showTrending && (
            <Badge variant="default" className="bg-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
          {opportunity.matchScore && (
            <Badge variant="default" className="bg-blue-600">
              {opportunity.matchScore}% Match
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {opportunity.description}
        </p>
        
        <div className="space-y-2 text-sm">
          {opportunity.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{opportunity.location}</span>
            </div>
          )}
          
          {opportunity.amount && (
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span>{opportunity.amount}</span>
            </div>
          )}
          
          {opportunity.deadline && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className={showDeadline ? "text-orange-600 font-medium" : ""}>
                Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1" 
            size="sm"
            onClick={() => {
              if (opportunity.applicationMethod === 'external' && opportunity.link) {
                window.open(opportunity.link, '_blank');
              }
            }}
          >
            {opportunity.applicationMethod === 'platform' ? 'Apply Now' : 'Learn More'}
            {opportunity.applicationMethod === 'external' && (
              <ExternalLink className="h-3 w-3 ml-1" />
            )}
          </Button>
          
          <Button variant="outline" size="sm">
            <Heart className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Startup Card Component
function StartupCard({ 
  startup, 
  onSave, 
  isSaved, 
  showTraction = false,
  showInviteAction = false 
}: {
  startup: Startup;
  onSave: () => void;
  isSaved: boolean;
  showTraction?: boolean;
  showInviteAction?: boolean;
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              {startup.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {startup.sector} • {startup.location}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isSaved ? (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex gap-2 flex-wrap mt-2">
          {startup.stage && <Badge variant="secondary">{startup.stage}</Badge>}
          {startup.matchScore && (
            <Badge variant="default" className="bg-blue-600">
              {startup.matchScore}% Match
            </Badge>
          )}
          {startup.foundedYear && (
            <Badge variant="outline">
              Founded {startup.foundedYear}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {startup.description}
        </p>
        
        {showTraction && startup.traction && (
          <div className="space-y-2 text-sm mb-4">
            {startup.traction.revenue && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span>Revenue: {startup.traction.revenue}</span>
              </div>
            )}
            {startup.traction.users && (
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-blue-600" />
                <span>Users: {startup.traction.users}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <Button className="flex-1" size="sm">
            {showInviteAction ? 'Invite to Program' : 'View Profile'}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
          
          {startup.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={startup.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Chat Assistant Component
function ChatAssistant({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">AI Assistant</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          ×
        </Button>
      </div>
      
      <div className="flex-1 p-4">
        <div className="text-sm text-muted-foreground mb-4">
          Hi {user.name}! I can help you find opportunities, answer questions about the ecosystem, and provide personalized recommendations.
        </div>
        
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            "What programs do I qualify for?"
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            "Show me trending startups in {user.sector}"
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            "How can I improve my profile?"
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input placeholder="Ask me anything..." className="text-sm" />
          <Button size="sm">Send</Button>
        </div>
      </div>
    </div>
  );
}