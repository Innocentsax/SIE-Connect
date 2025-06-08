import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Heart, Building, DollarSign, Briefcase, Users, Calendar, ChartLine } from "lucide-react";

interface SearchResult {
  id: number;
  type: 'startup' | 'opportunity';
  name?: string;
  title?: string;
  description: string;
  sector: string;
  location: string;
  badge: string;
  metadata: { [key: string]: any };
}

interface SearchResultsProps {
  results: SearchResult[];
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function SearchResults({ 
  results, 
  totalCount, 
  currentPage, 
  onPageChange, 
  sortBy, 
  onSortChange 
}: SearchResultsProps) {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getIcon = (type: string, sector: string) => {
    if (type === 'startup') {
      if (sector.includes('Health')) return <Heart className="text-white" size={16} />;
      if (sector.includes('Waste')) return <Leaf className="text-white" size={16} />;
      return <Building className="text-white" size={16} />;
    }
    if (type === 'grant') return <DollarSign className="text-white" size={16} />;
    if (type === 'investor') return <Briefcase className="text-white" size={16} />;
    return <Building className="text-white" size={16} />;
  };

  const getGradient = (type: string, sector: string) => {
    if (type === 'startup') return "from-primary to-blue-600";
    if (type === 'grant') return "from-secondary to-green-600";
    if (type === 'investor') return "from-accent to-red-600";
    return "from-purple-500 to-purple-600";
  };

  const getBadgeColor = (type: string) => {
    if (type === 'startup') return "bg-primary/10 text-primary";
    if (type === 'grant') return "bg-secondary/10 text-secondary";
    if (type === 'investor') return "bg-accent/10 text-accent";
    return "bg-purple-100 text-purple-600";
  };

  const getButtonColor = (type: string) => {
    if (type === 'startup') return "bg-primary hover:bg-blue-700";
    if (type === 'grant') return "bg-secondary hover:bg-green-600";
    if (type === 'investor') return "bg-accent hover:bg-orange-600";
    return "bg-purple-600 hover:bg-purple-700";
  };

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Search Results</h2>
          <p className="text-neutral-600">Showing {results.length} of {totalCount} results</p>
        </div>
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 bg-white focus:border-primary outline-none"
        >
          <option value="relevance">Most Relevant</option>
          <option value="newest">Newest First</option>
          <option value="deadline">Deadline Soon</option>
          <option value="funding">Funding Amount</option>
        </select>
      </div>

      {/* Results Grid */}
      <div className="grid gap-6 mb-8">
        {results.map((result) => (
          <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getGradient(result.type, result.sector)} rounded-lg flex items-center justify-center`}>
                    {getIcon(result.type, result.sector)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {result.name || result.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {result.sector} • {result.location}
                    </p>
                  </div>
                </div>
                <Badge className={`${getBadgeColor(result.type)} capitalize`}>
                  {result.badge}
                </Badge>
              </div>
              
              <p className="text-neutral-700 mb-4">
                {result.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  {result.type === 'startup' && (
                    <>
                      <span><Users size={14} className="inline mr-1" />{result.metadata.employeeCount || 0} employees</span>
                      <span><Calendar size={14} className="inline mr-1" />Founded {result.metadata.foundedYear || 'N/A'}</span>
                      <span><ChartLine size={14} className="inline mr-1" />{result.metadata.stage || 'Early'}</span>
                    </>
                  )}
                  {result.type === 'opportunity' && result.metadata.type === 'Grant' && (
                    <>
                      <span className="text-secondary font-semibold">{result.metadata.amount || 'N/A'}</span>
                      {result.metadata.deadline && (
                        <span className="text-red-600">
                          <Calendar size={14} className="inline mr-1" />
                          Deadline: {new Date(result.metadata.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </>
                  )}
                  {result.type === 'opportunity' && result.metadata.type === 'Investor' && (
                    <>
                      <span><DollarSign size={14} className="inline mr-1" />{result.metadata.amount || 'Seed - Series A'}</span>
                      <span><Building size={14} className="inline mr-1" />Portfolio: {result.metadata.portfolioCount || 'N/A'}</span>
                    </>
                  )}
                </div>
                <Button className={`${getButtonColor(result.type)} text-white text-sm`}>
                  {result.type === 'startup' ? 'View Details' : 
                   result.metadata.type === 'Grant' ? 'Apply Now' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-neutral-600">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="px-2">...</span>}
            {totalPages > 5 && (
              <Button
                variant="outline"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            )}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
