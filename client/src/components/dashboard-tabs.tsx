import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AIMarketIntelligence } from "@/components/ai-market-intelligence";
import { WebScrapingDashboard } from "@/components/web-scraping-dashboard";
import { CreateOpportunityForm } from "@/components/create-opportunity-form";
import { 
  Rocket, 
  DollarSign, 
  Users, 
  Settings, 
  Bookmark, 
  ChartLine, 
  Target, 
  Megaphone, 
  Calendar, 
  Upload, 
  RefreshCw, 
  UserCog,
  Check,
  AlertTriangle,
  Bot,
  Globe,
  Database
} from "lucide-react";

export function DashboardTabs() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [isManualScraping, setIsManualScraping] = useState(false);
  const [showCreateOpportunity, setShowCreateOpportunity] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch saved opportunities for the current user
  const { data: savedOpportunitiesData, isLoading: savedLoading } = useQuery({
    queryKey: ['/api/saved-opportunities'],
    enabled: !!user,
  });

  // Fetch all startups
  const { data: startupsData, isLoading: startupsLoading } = useQuery({
    queryKey: ['/api/search', 'startup'],
    queryFn: () => apiRequest('/api/search?type=startup&limit=10'),
  });

  // Fetch all opportunities
  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/search', 'opportunity'],
    queryFn: () => apiRequest('/api/search?type=opportunity&limit=10'),
  });

  // Manual scraping mutation for admin
  const manualScrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/scraper/trigger', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to trigger manual scrape');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Manual Scraping Completed",
        description: `Imported ${data.imported?.startups || 0} startups and ${data.imported?.opportunities || 0} opportunities`,
      });
      setIsManualScraping(false);
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsManualScraping(false);
    },
  });

  // Database seeding mutation for admin
  const seedDatabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/seed-database', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to seed database');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Database Seeded",
        description: "Database has been populated with realistic sample data for testing",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      toast({
        title: "Seeding Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleManualScrape = () => {
    setIsManualScraping(true);
    manualScrapeMutation.mutate();
  };

  const saveOpportunity = useMutation({
    mutationFn: async (opportunityId: number) => {
      return await apiRequest(`/api/opportunities/${opportunityId}/save`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-opportunities'] });
    }
  });

  const unsaveOpportunity = useMutation({
    mutationFn: async (opportunityId: number) => {
      return await apiRequest(`/api/opportunities/${opportunityId}/save`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-opportunities'] });
    }
  });

  const startups = startupsData?.startups || [];
  const opportunities = opportunitiesData?.opportunities || [];
  const savedOpportunities = savedOpportunitiesData?.opportunities || [];

  const renderOpportunitiesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Opportunities</h3>
        <div className="text-sm text-neutral-600">
          {opportunities.length} opportunities found
        </div>
      </div>
      
      {opportunitiesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading opportunities...</p>
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid gap-4">
          {opportunities.map((opportunity) => {
            const isSaved = savedOpportunities.some(saved => saved.id === opportunity.id);
            return (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-neutral-900 mb-2">
                        {opportunity.title}
                      </h4>
                      <p className="text-neutral-600 mb-3">
                        {opportunity.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                        {opportunity.provider && (
                          <span>Provider: {opportunity.provider}</span>
                        )}
                        {opportunity.amount && (
                          <span>Amount: {opportunity.amount}</span>
                        )}
                        {opportunity.sector && (
                          <span>Sector: {opportunity.sector}</span>
                        )}
                        {opportunity.location && (
                          <span>Location: {opportunity.location}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant={isSaved ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSaved) {
                            unsaveOpportunity.mutate(opportunity.id);
                          } else {
                            saveOpportunity.mutate(opportunity.id);
                          }
                        }}
                        disabled={saveOpportunity.isPending || unsaveOpportunity.isPending}
                      >
                        <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                        {isSaved ? 'Saved' : 'Save'}
                      </Button>
                      {opportunity.deadline && (
                        <span className="text-xs text-neutral-500">
                          Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-600 mb-2">No opportunities found</h3>
            <p className="text-neutral-500">Check back later for new opportunities</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFounderContent = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bookmark className="mr-2 text-primary" size={20} />
            My Saved Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {savedLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : savedOpportunities.length > 0 ? (
            savedOpportunities.slice(0, 3).map((opportunity) => (
              <div key={opportunity.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <p className="font-medium text-neutral-900">{opportunity.title}</p>
                  <p className="text-sm text-neutral-600">{opportunity.provider || 'Application open'}</p>
                </div>
                <span className="text-green-600 text-sm font-medium">
                  {opportunity.matchPercentage}% Match
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-neutral-500">
              No saved opportunities yet
            </div>
          )}
          <Button className="w-full mt-4" onClick={() => setActiveTab("opportunities")}>
            View All Opportunities
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChartLine className="mr-2 text-secondary" size={20} />
            Profile Completeness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={75} className="w-full h-3" />
            <p className="text-sm text-neutral-600 mt-2">75% Complete</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-green-600">
              <Check className="mr-2" size={16} />
              Basic information
            </div>
            <div className="flex items-center text-green-600">
              <Check className="mr-2" size={16} />
              Financial details
            </div>
            <div className="flex items-center text-orange-600">
              <AlertTriangle className="mr-2" size={16} />
              Social impact metrics
            </div>
          </div>
          <Button className="w-full mt-4" variant="outline">Complete Profile</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderFunderContent = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 text-accent" size={20} />
            AI-Matched Startups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
            <div>
              <p className="font-medium text-neutral-900">EcoWaste Solutions</p>
              <p className="text-sm text-neutral-600">Waste Management • KL</p>
            </div>
            <span className="text-primary text-sm font-medium">94% Match</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
            <div>
              <p className="font-medium text-neutral-900">HealthConnect</p>
              <p className="text-sm text-neutral-600">HealthTech • Penang</p>
            </div>
            <span className="text-primary text-sm font-medium">89% Match</span>
          </div>
          <Button className="w-full mt-4" onClick={() => setActiveTab("startups")}>View All Matches</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Megaphone className="mr-2 text-purple-600" size={20} />
            My Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="font-medium text-neutral-900">Impact Accelerator 2024</p>
            <p className="text-sm text-neutral-600">15 applications • 3 pending review</p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="flex-1" variant="outline" onClick={() => setActiveTab("opportunities")}>
              Manage Opportunities
            </Button>
            <Button className="flex-1" onClick={() => setShowCreateOpportunity(true)}>
              Create New
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBuilderContent = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 text-purple-600" size={20} />
            Event Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-neutral-50 rounded-lg mb-4">
            <p className="font-medium text-neutral-900">Social Enterprise Summit</p>
            <p className="text-sm text-neutral-600">March 25, 2024 • 156 registrations</p>
          </div>
          <Button className="w-full">Create New Event</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 text-blue-600" size={20} />
            Bulk Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary hover:text-primary transition-colors cursor-pointer">
            <Upload className="mx-auto mb-2" size={32} />
            <p>Upload CSV of startups</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminToolsTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 text-primary" size={20} />
            Database Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Database Seeding</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Populate the database with realistic sample data for testing all platform features including different user types, startups, opportunities, and events.
            </p>
            <Button
              onClick={() => seedDatabaseMutation.mutate()}
              disabled={seedDatabaseMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {seedDatabaseMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Database with Test Data
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Data Collection</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Trigger manual web scraping to collect latest startup and opportunity data from configured sources.
            </p>
            <Button
              onClick={handleManualScrape}
              disabled={isManualScraping || manualScrapeMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {isManualScraping ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Trigger Manual Data Scraping
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="mr-2 text-neutral-700" size={20} />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Founders</span>
              <span className="font-medium">234</span>
            </div>
            <div className="flex justify-between">
              <span>Funders</span>
              <span className="font-medium">45</span>
            </div>
            <div className="flex justify-between">
              <span>Builders</span>
              <span className="font-medium">28</span>
            </div>
          </div>
          <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4" variant="outline">Manage Users</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>User Management</DialogTitle>
              </DialogHeader>
              <UserManagementContent />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminContent = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="mr-2 text-blue-600" size={20} />
            Scrape Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-neutral-700">Last successful scrape</span>
            <span className="text-green-600">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-700">Data accuracy</span>
            <span className="text-green-600">87%</span>
          </div>
          <Button 
            className="w-full" 
            onClick={handleManualScrape}
            disabled={isManualScraping || manualScrapeMutation.isPending}
          >
            {isManualScraping ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              'Trigger Manual Scrape'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="mr-2 text-neutral-700" size={20} />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Founders</span>
              <span className="font-medium">234</span>
            </div>
            <div className="flex justify-between">
              <span>Funders</span>
              <span className="font-medium">45</span>
            </div>
            <div className="flex justify-between">
              <span>Builders</span>
              <span className="font-medium">28</span>
            </div>
          </div>
          <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4" variant="outline">Manage Users</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>User Management</DialogTitle>
              </DialogHeader>
              <UserManagementContent />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );

  // User Management Component for Admin
  const UserManagementContent = () => {
    const { data: users, isLoading } = useQuery({
      queryKey: ['/api/admin/users'],
      queryFn: () => apiRequest('/api/admin/users'),
      enabled: user?.role === 'ADMIN',
    });

    const updateUserRoleMutation = useMutation({
      mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
        return apiRequest(`/api/admin/users/${userId}/role`, {
          method: 'PATCH',
          body: JSON.stringify({ role }),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        toast({
          title: "Role Updated",
          description: "User role has been successfully updated.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive",
        });
      },
    });

    if (isLoading) {
      return <div className="p-4">Loading users...</div>;
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {users?.map((user: any) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{user.name || user.email}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-sm text-gray-500">{user.company || 'No company'}</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={user.role}
                  onChange={(e) => updateUserRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                  className="px-3 py-1 border rounded"
                  disabled={updateUserRoleMutation.isPending}
                >
                  <option value="STARTUP_FOUNDER">Startup Founder</option>
                  <option value="FUNDER">Funder</option>
                  <option value="ECOSYSTEM_BUILDER">Ecosystem Builder</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getTabIcon = (role: string) => {
    switch (role) {
      case "STARTUP_FOUNDER": return <Rocket size={16} />;
      case "FUNDER": return <DollarSign size={16} />;
      case "ECOSYSTEM_BUILDER": return <Users size={16} />;
      case "ADMIN": return <Settings size={16} />;
      default: return <Rocket size={16} />;
    }
  };

  const getTabContent = () => {
    switch (user?.role) {
      case "STARTUP_FOUNDER": return renderFounderContent();
      case "FUNDER": return renderFunderContent();
      case "ECOSYSTEM_BUILDER": return renderBuilderContent();
      case "ADMIN": return renderAdminContent();
      default: return renderFounderContent();
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "STARTUP_FOUNDER": return "Founder";
      case "FUNDER": return "Funder";
      case "ECOSYSTEM_BUILDER": return "Builder";
      case "ADMIN": return "Admin";
      default: return "User";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          {getRoleLabel()} Dashboard
        </h2>
        <p className="text-neutral-600">Welcome back, {user?.name || user?.email}</p>
      </div>

      <div className="flex justify-center border-b border-neutral-200 mb-8 overflow-x-auto">
        <Button
          variant="ghost"
          className={`px-6 py-3 font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'overview' 
              ? 'text-primary border-primary' 
              : 'text-neutral-600 border-transparent hover:text-primary'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          {getTabIcon(user?.role || "")}
          <span className="ml-2">{getRoleLabel()}</span>
        </Button>
        <Button
          variant="ghost"
          className={`px-6 py-3 font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'opportunities' 
              ? 'text-primary border-primary' 
              : 'text-neutral-600 border-transparent hover:text-primary'
          }`}
          onClick={() => setActiveTab('opportunities')}
        >
          <Target size={16} />
          <span className="ml-2">Opportunities</span>
        </Button>
        <Button
          variant="ghost"
          className={`px-6 py-3 font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'ai-chat' 
              ? 'text-primary border-primary' 
              : 'text-neutral-600 border-transparent hover:text-primary'
          }`}
          onClick={() => setActiveTab('ai-chat')}
        >
          <Bot size={16} />
          <span className="ml-2">AI Chat</span>
        </Button>
        <Button
          variant="ghost"
          className={`px-6 py-3 font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'web-scraping' 
              ? 'text-primary border-primary' 
              : 'text-neutral-600 border-transparent hover:text-primary'
          }`}
          onClick={() => setActiveTab('web-scraping')}
        >
          <Globe size={16} />
          <span className="ml-2">Web Scraping</span>
        </Button>
        {user?.role === 'ADMIN' && (
          <Button
            variant="ghost"
            className={`px-6 py-3 font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'admin-tools' 
                ? 'text-primary border-primary' 
                : 'text-neutral-600 border-transparent hover:text-primary'
            }`}
            onClick={() => setActiveTab('admin-tools')}
          >
            <Database size={16} />
            <span className="ml-2">Admin Tools</span>
          </Button>
        )}
      </div>

      <div className="dashboard-content">
        {activeTab === 'opportunities' && renderOpportunitiesTab()}
        {activeTab === 'ai-chat' && <AIMarketIntelligence user={user} />}
        {activeTab === 'web-scraping' && <WebScrapingDashboard user={user} />}
        {activeTab === 'admin-tools' && renderAdminToolsTab()}
        {activeTab === 'overview' && getTabContent()}
      </div>

      {/* Create Opportunity Form */}
      <CreateOpportunityForm
        isOpen={showCreateOpportunity}
        onClose={() => setShowCreateOpportunity(false)}
        onSuccess={() => {
          setShowCreateOpportunity(false);
          toast({
            title: "Success",
            description: "Opportunity created successfully"
          });
        }}
      />
    </div>
  );
}
