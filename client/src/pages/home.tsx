import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { HeroSearch } from "@/components/hero-search";
import { SearchResults } from "@/components/search-results";
import { FilterSidebar } from "@/components/filter-sidebar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Network, 
  Twitter, 
  Linkedin, 
  Facebook,
  Rocket,
  DollarSign
} from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [filters, setFilters] = useState({
    types: ["startup"] as string[],
    sectors: [] as string[],
    locations: [] as string[],
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["/api/search", searchQuery, filters, currentPage, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: "10",
        offset: ((currentPage - 1) * 10).toString(),
      });

      if (filters.types.length > 0) {
        filters.types.forEach(type => params.append("type", type));
      }
      if (filters.sectors.length > 0) {
        params.append("sector", filters.sectors[0]);
      }
      if (filters.locations.length > 0) {
        params.append("location", filters.locations[0]);
      }

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
  });

  const handleSearch = (searchData: {
    query: string;
    sector: string;
    location: string;
  }) => {
    setSearchQuery(searchData.query);
    setFilters({
      types: searchData.query === "startup" ? ["startup"] : 
             searchData.query === "grant" ? ["grant"] : 
             searchData.query === "investor" ? ["investor"] : 
             filters.types,
      sectors: searchData.sector ? [searchData.sector] : [],
      locations: searchData.location ? [searchData.location] : [],
    });
    setCurrentPage(1);
  };

  // Transform search results for display
  const transformedResults = searchResults ? [
    ...searchResults.startups.map((startup: any) => ({
      id: startup.id,
      type: 'startup' as const,
      name: startup.name,
      description: startup.description || '',
      sector: startup.sector || 'Technology',
      location: startup.location || 'Malaysia',
      badge: 'Startup',
      metadata: {
        employeeCount: startup.employeeCount,
        foundedYear: startup.foundedYear,
        stage: startup.stage,
      }
    })),
    ...searchResults.opportunities.map((opportunity: any) => ({
      id: opportunity.id,
      type: 'opportunity' as const,
      title: opportunity.title,
      description: opportunity.description || '',
      sector: opportunity.sector || 'General',
      location: opportunity.location || 'Malaysia',
      badge: opportunity.type || 'Opportunity',
      metadata: {
        type: opportunity.type,
        amount: opportunity.amount,
        deadline: opportunity.deadline,
        provider: opportunity.provider,
      }
    }))
  ] : [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect Malaysia's <span className="text-blue-200">Social Enterprise</span> Ecosystem
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Discover startups, grants, investors, and opportunities in one centralized platform. 
              Stop missing deadlines and start building connections.
            </p>
            
            <HeroSearch onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stats?.startups || 320}+
              </div>
              <div className="text-neutral-600">Social Enterprises</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                {stats?.opportunities || 85}
              </div>
              <div className="text-neutral-600">Active Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                {stats?.investors || 150}+
              </div>
              <div className="text-neutral-600">Investors & Funders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                {stats?.totalFunding || "2.3M"}
              </div>
              <div className="text-neutral-600">RM Funding Matched</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {(searchQuery || filters.types.length > 0) && (
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-80">
                <FilterSidebar filters={filters} onChange={setFilters} />
              </div>
              
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-neutral-600">Searching ecosystem...</p>
                  </div>
                </div>
              ) : (
                <SearchResults
                  results={transformedResults}
                  totalCount={searchResults?.total || 0}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Connect Your Ecosystem?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join Malaysia's largest social enterprise network. Discover opportunities, 
            find the right connections, and accelerate your impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=register&role=STARTUP_FOUNDER">
              <Button className="px-8 py-4 bg-white text-primary rounded-xl hover:bg-blue-50 transition-colors font-semibold">
                <Rocket className="mr-2" size={20} />
                Join as Founder
              </Button>
            </Link>
            <Link href="/auth?mode=register&role=FUNDER">
              <Button className="px-8 py-4 bg-accent text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold">
                <DollarSign className="mr-2" size={20} />
                Join as Funder
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Network className="text-white" size={16} />
                </div>
                <span className="text-lg font-bold">IEC Hub</span>
              </div>
              <p className="text-neutral-400 text-sm">
                Connecting Malaysia's social enterprise ecosystem for greater impact.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">Discover</a></li>
                <li><a href="#" className="hover:text-white">Search</a></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">Events</a></li>
                <li><a href="#" className="hover:text-white">Resources</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-white">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-neutral-400 hover:text-white">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-neutral-400 hover:text-white">
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-400">
            <p>&copy; 2024 IEC Hub. Built for Malaysia's social enterprise ecosystem.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
