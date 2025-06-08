import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck, Building, MapPin, Target } from "lucide-react";

export function ProfileSetup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    company: user?.company || "",
    sector: user?.sector || "",
    location: user?.location || "",
    description: user?.description || "",
    website: user?.website || "",
    socialImpactFocus: user?.socialImpactFocus || "",
    fundingStage: user?.fundingStage || "",
    investmentFocus: user?.investmentFocus || "",
    investmentRange: user?.investmentRange || "",
  });

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const sessionId = localStorage.getItem('sessionId');
      return await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify(data)
      }).then(res => {
        if (!res.ok) throw new Error('Profile update failed');
        return res.json();
      });
    },
    onSuccess: (response) => {
      console.log('Profile update successful:', response);
      // Update the auth state immediately with the new user data
      if (response.user) {
        useAuth.setState({ 
          user: response.user,
          isAuthenticated: true 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getFieldsForRole = () => {
    switch (user?.role) {
      case 'STARTUP_FOUNDER':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fundingStage">Funding Stage</Label>
                <Select value={formData.fundingStage || ""} onValueChange={(value) => handleChange('fundingStage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                    <SelectItem value="Series C+">Series C+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="socialImpactFocus">Social Impact Focus</Label>
                <Input
                  id="socialImpactFocus"
                  value={formData.socialImpactFocus}
                  onChange={(e) => handleChange('socialImpactFocus', e.target.value)}
                  placeholder="e.g., Education, Healthcare, Environment"
                />
              </div>
            </div>
          </>
        );
      case 'FUNDER':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investmentFocus">Investment Focus</Label>
                <Input
                  id="investmentFocus"
                  value={formData.investmentFocus}
                  onChange={(e) => handleChange('investmentFocus', e.target.value)}
                  placeholder="e.g., Early-stage social enterprises"
                />
              </div>
              <div>
                <Label htmlFor="investmentRange">Investment Range</Label>
                <Select value={formData.investmentRange || ""} onValueChange={(value) => handleChange('investmentRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RM 10K - 100K">RM 10K - 100K</SelectItem>
                    <SelectItem value="RM 100K - 500K">RM 100K - 500K</SelectItem>
                    <SelectItem value="RM 500K - 1M">RM 500K - 1M</SelectItem>
                    <SelectItem value="RM 1M - 5M">RM 1M - 5M</SelectItem>
                    <SelectItem value="RM 5M+">RM 5M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Complete Your Profile</CardTitle>
          <p className="text-neutral-600">
            Help us personalize your experience and connect you with the right opportunities
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Organization *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Your organization"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sector">Sector *</Label>
                <Select value={formData.sector || ""} onValueChange={(value) => handleChange('sector', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HealthTech">HealthTech</SelectItem>
                    <SelectItem value="EdTech">EdTech</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="AgriTech">AgriTech</SelectItem>
                    <SelectItem value="CleanTech">CleanTech</SelectItem>
                    <SelectItem value="Social Innovation">Social Innovation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Select value={formData.location || ""} onValueChange={(value) => handleChange('location', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kuala Lumpur">Kuala Lumpur</SelectItem>
                    <SelectItem value="Selangor">Selangor</SelectItem>
                    <SelectItem value="Penang">Penang</SelectItem>
                    <SelectItem value="Johor">Johor</SelectItem>
                    <SelectItem value="Sarawak">Sarawak</SelectItem>
                    <SelectItem value="Sabah">Sabah</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://your-website.com"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell us about your organization and mission"
                rows={4}
              />
            </div>

            {getFieldsForRole()}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}