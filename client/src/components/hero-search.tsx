import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building, DollarSign, Users, Calendar } from "lucide-react";

interface HeroSearchProps {
  onSearch: (filters: {
    query: string;
    sector: string;
    location: string;
  }) => void;
}

export function HeroSearch({ onSearch }: HeroSearchProps) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [location, setLocation] = useState("all");

  const handleSearch = () => {
    onSearch({ query, sector, location });
  };

  const handleQuickFilter = (type: string) => {
    onSearch({ query: type, sector: "all", location: "all" });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
            <Input
              type="text"
              placeholder="Search startups, grants, or opportunities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-neutral-900 rounded-xl border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="px-4 py-4 rounded-xl border border-neutral-200 text-neutral-700 bg-white focus:border-primary outline-none">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="HealthTech">HealthTech</SelectItem>
              <SelectItem value="EdTech">EdTech</SelectItem>
              <SelectItem value="FinTech">FinTech</SelectItem>
              <SelectItem value="AgriTech">AgriTech</SelectItem>
              <SelectItem value="Waste Management">Waste Management</SelectItem>
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="px-4 py-4 rounded-xl border border-neutral-200 text-neutral-700 bg-white focus:border-primary outline-none">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Kuala Lumpur">KL/Selangor</SelectItem>
              <SelectItem value="Penang">Penang</SelectItem>
              <SelectItem value="Johor">Johor</SelectItem>
              <SelectItem value="Sabah">Sabah</SelectItem>
              <SelectItem value="Sarawak">Sarawak</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleSearch}
            className="px-8 py-4 bg-accent text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold whitespace-nowrap"
          >
            Search
          </Button>
        </div>
      </div>
      
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-neutral-100">
        <Button 
          variant="secondary"
          onClick={() => handleQuickFilter('startup')}
          className="px-4 py-2 bg-blue-50 text-primary rounded-full text-sm hover:bg-blue-100 transition-colors"
        >
          <Building className="mr-2" size={16} />
          Startups
        </Button>
        <Button 
          variant="secondary"
          onClick={() => handleQuickFilter('grant')}
          className="px-4 py-2 bg-green-50 text-secondary rounded-full text-sm hover:bg-green-100 transition-colors"
        >
          <DollarSign className="mr-2" size={16} />
          Grants
        </Button>
        <Button 
          variant="secondary"
          onClick={() => handleQuickFilter('investor')}
          className="px-4 py-2 bg-orange-50 text-accent rounded-full text-sm hover:bg-orange-100 transition-colors"
        >
          <Users className="mr-2" size={16} />
          Investors
        </Button>
        <Button 
          variant="secondary"
          onClick={() => handleQuickFilter('program')}
          className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm hover:bg-purple-100 transition-colors"
        >
          <Calendar className="mr-2" size={16} />
          Programs
        </Button>
      </div>
    </div>
  );
}
