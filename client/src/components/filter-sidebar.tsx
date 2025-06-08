import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  filters: {
    types: string[];
    sectors: string[];
    locations: string[];
  };
  onChange: (filters: {
    types: string[];
    sectors: string[];
    locations: string[];
  }) => void;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const typeOptions = [
    { value: "startup", label: "Startups", count: 187 },
    { value: "grant", label: "Grants", count: 34 },
    { value: "investor", label: "Investors", count: 28 },
  ];

  const sectorOptions = [
    { value: "HealthTech", label: "HealthTech", count: 45 },
    { value: "EdTech", label: "EdTech", count: 38 },
    { value: "FinTech", label: "FinTech", count: 29 },
    { value: "AgriTech", label: "AgriTech", count: 22 },
    { value: "Waste Management", label: "Waste Management", count: 15 },
  ];

  const locationOptions = [
    { value: "Kuala Lumpur", label: "KL/Selangor", count: 156 },
    { value: "Penang", label: "Penang", count: 31 },
    { value: "Johor", label: "Johor", count: 24 },
    { value: "Sabah", label: "Sabah", count: 12 },
    { value: "Sarawak", label: "Sarawak", count: 18 },
  ];

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.types, type]
      : filters.types.filter(t => t !== type);
    onChange({ ...filters, types: newTypes });
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    const newSectors = checked
      ? [...filters.sectors, sector]
      : filters.sectors.filter(s => s !== sector);
    onChange({ ...filters, sectors: newSectors });
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const newLocations = checked
      ? [...filters.locations, location]
      : filters.locations.filter(l => l !== location);
    onChange({ ...filters, locations: newLocations });
  };

  const clearAllFilters = () => {
    onChange({ types: [], sectors: [], locations: [] });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-neutral-900 mb-4">Refine Results</h3>
      
      {/* Type Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-neutral-700 mb-3">Type</h4>
        <div className="space-y-2">
          {typeOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${option.value}`}
                checked={filters.types.includes(option.value)}
                onCheckedChange={(checked) => handleTypeChange(option.value, checked as boolean)}
              />
              <label
                htmlFor={`type-${option.value}`}
                className="text-neutral-700 cursor-pointer"
              >
                {option.label} <span className="text-neutral-500">({option.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-neutral-700 mb-3">Sector</h4>
        <div className="space-y-2">
          {sectorOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`sector-${option.value}`}
                checked={filters.sectors.includes(option.value)}
                onCheckedChange={(checked) => handleSectorChange(option.value, checked as boolean)}
              />
              <label
                htmlFor={`sector-${option.value}`}
                className="text-neutral-700 cursor-pointer"
              >
                {option.label} <span className="text-neutral-500">({option.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-neutral-700 mb-3">Location</h4>
        <div className="space-y-2">
          {locationOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`location-${option.value}`}
                checked={filters.locations.includes(option.value)}
                onCheckedChange={(checked) => handleLocationChange(option.value, checked as boolean)}
              />
              <label
                htmlFor={`location-${option.value}`}
                className="text-neutral-700 cursor-pointer"
              >
                {option.label} <span className="text-neutral-500">({option.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={clearAllFilters}
      >
        Clear All Filters
      </Button>
    </div>
  );
}
