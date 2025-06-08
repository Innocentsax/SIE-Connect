import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Send, 
  Upload, 
  Building, 
  Calendar, 
  DollarSign, 
  MapPin,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Opportunity {
  id: number;
  title: string;
  description: string;
  provider: string;
  type: string;
  deadline?: string;
  amount?: string;
  sector?: string;
  location?: string;
  requirements?: string;
  eligibility?: string;
  link?: string;
}

interface OpportunityApplicationProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OpportunityApplication({ 
  opportunity, 
  isOpen, 
  onClose, 
  onSuccess 
}: OpportunityApplicationProps) {
  const [formData, setFormData] = useState({
    coverLetter: "",
    projectDescription: "",
    fundingRequested: "",
    additionalData: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const applicationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          ...data
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully. You'll receive updates via email.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      onSuccess?.();
      onClose();
      setFormData({
        coverLetter: "",
        projectDescription: "",
        fundingRequested: "",
        additionalData: ""
      });
      setErrors({});
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.coverLetter || formData.coverLetter.length < 50) {
      newErrors.coverLetter = "Cover letter must be at least 50 characters";
    }
    
    if (!formData.projectDescription || formData.projectDescription.length < 100) {
      newErrors.projectDescription = "Project description must be at least 100 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      applicationMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Apply for Opportunity
          </DialogTitle>
          <DialogDescription>
            Submit your application for this opportunity. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{opportunity.type}</Badge>
                  {opportunity.sector && <Badge variant="secondary">{opportunity.sector}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{opportunity.provider}</span>
                </div>
                
                {opportunity.amount && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{opportunity.amount}</span>
                  </div>
                )}
                
                {opportunity.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                
                {opportunity.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{opportunity.location}</span>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                </div>

                {opportunity.requirements && (
                  <div className="pt-3">
                    <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                    <p className="text-sm text-muted-foreground">{opportunity.requirements}</p>
                  </div>
                )}

                {opportunity.link && (
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cover Letter *
                  <span className="text-muted-foreground font-normal"> (minimum 50 characters)</span>
                </label>
                <Textarea
                  placeholder="Explain why you're interested in this opportunity and how it aligns with your goals..."
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  className={`min-h-[120px] ${errors.coverLetter ? 'border-red-500' : ''}`}
                />
                {errors.coverLetter && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {errors.coverLetter}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {formData.coverLetter.length}/50 characters minimum
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Project Description *
                  <span className="text-muted-foreground font-normal"> (minimum 100 characters)</span>
                </label>
                <Textarea
                  placeholder="Describe your project, product, or startup in detail. Include your business model, target market, and current progress..."
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  className={`min-h-[150px] ${errors.projectDescription ? 'border-red-500' : ''}`}
                />
                {errors.projectDescription && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {errors.projectDescription}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {formData.projectDescription.length}/100 characters minimum
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Funding Requested (Optional)</label>
                <Input
                  placeholder="e.g., RM 100,000 or USD 25,000"
                  value={formData.fundingRequested}
                  onChange={(e) => handleInputChange('fundingRequested', e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Specify the amount if this is a funding opportunity
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Information (Optional)</label>
                <Textarea
                  placeholder="Any additional information, team details, achievements, or relevant links..."
                  value={formData.additionalData}
                  onChange={(e) => handleInputChange('additionalData', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={applicationMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applicationMutation.isPending}
                  className="flex-1"
                >
                  {applicationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Your application will be reviewed by {opportunity.provider}. 
                You'll receive email updates about the status of your application.
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}