import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Send, Loader2, CheckCircle, X, Upload, Heart, HeartOff } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const applicationSchema = z.object({
  opportunityId: z.number(),
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
  relevantExperience: z.string().min(20, "Please describe your relevant experience"),
  whyInterested: z.string().min(20, "Please explain why you're interested"),
  expectedOutcome: z.string().min(20, "Please describe your expected outcome"),
  additionalInfo: z.string().optional(),
});

interface ApplicationFormProps {
  opportunity: any;
  isOpen: boolean;
  onClose: () => void;
}

function ApplicationForm({ opportunity, isOpen, onClose }: ApplicationFormProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      opportunityId: opportunity.id,
      coverLetter: "",
      relevantExperience: "",
      whyInterested: "",
      expectedOutcome: "",
      additionalInfo: "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof applicationSchema>) => {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to submit application");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: "Application submitted successfully!" });
      onClose();
      setStep(1);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleNext = async () => {
    let isValid = false;
    
    if (step === 1) {
      isValid = await form.trigger(["coverLetter", "relevantExperience"]);
    } else if (step === 2) {
      isValid = await form.trigger(["whyInterested", "expectedOutcome"]);
    }

    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (data: z.infer<typeof applicationSchema>) => {
    applicationMutation.mutate(data);
  };

  const progress = (step / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Apply to {opportunity.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Step {step} of 3</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} />
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">About this opportunity:</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {opportunity.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{opportunity.type}</Badge>
                    {opportunity.sector && <Badge variant="outline">{opportunity.sector}</Badge>}
                    {opportunity.amount && (
                      <Badge variant="outline" className="text-green-600">
                        {opportunity.amount}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="coverLetter">Cover Letter *</Label>
                  <Textarea
                    id="coverLetter"
                    {...form.register("coverLetter")}
                    placeholder="Write a compelling cover letter explaining why you're the perfect fit for this opportunity..."
                    rows={6}
                    className="mt-1"
                  />
                  {form.formState.errors.coverLetter && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.coverLetter.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {form.watch("coverLetter")?.length || 0} characters (minimum 50)
                  </p>
                </div>

                <div>
                  <Label htmlFor="relevantExperience">Relevant Experience *</Label>
                  <Textarea
                    id="relevantExperience"
                    {...form.register("relevantExperience")}
                    placeholder="Describe your relevant experience, skills, and achievements..."
                    rows={4}
                    className="mt-1"
                  />
                  {form.formState.errors.relevantExperience && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.relevantExperience.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whyInterested">Why are you interested in this opportunity? *</Label>
                  <Textarea
                    id="whyInterested"
                    {...form.register("whyInterested")}
                    placeholder="Explain what attracts you to this specific opportunity and how it aligns with your goals..."
                    rows={4}
                    className="mt-1"
                  />
                  {form.formState.errors.whyInterested && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.whyInterested.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="expectedOutcome">Expected Outcome *</Label>
                  <Textarea
                    id="expectedOutcome"
                    {...form.register("expectedOutcome")}
                    placeholder="What do you hope to achieve through this opportunity? What are your goals and expected outcomes..."
                    rows={4}
                    className="mt-1"
                  />
                  {form.formState.errors.expectedOutcome && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.expectedOutcome.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    {...form.register("additionalInfo")}
                    placeholder="Any additional information you'd like to share (optional)..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Review Your Application</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please review your application before submitting. Once submitted, you cannot edit your application.
                  </p>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  <div>
                    <h4 className="font-medium">Cover Letter:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {form.watch("coverLetter")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Relevant Experience:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {form.watch("relevantExperience")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Why Interested:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {form.watch("whyInterested")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Expected Outcome:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {form.watch("expectedOutcome")}
                    </p>
                  </div>

                  {form.watch("additionalInfo") && (
                    <div>
                      <h4 className="font-medium">Additional Information:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {form.watch("additionalInfo")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <div className="flex gap-2">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>

              <div>
                {step < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next Step
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={applicationMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {applicationMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit Application
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SaveOpportunityButtonProps {
  opportunityId: number;
  className?: string;
}

export function SaveOpportunityButton({ opportunityId, className }: SaveOpportunityButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedOpportunities } = useQuery({
    queryKey: ["/api/saved-opportunities"],
  });

  const isSaved = savedOpportunities?.opportunities?.some((op: any) => op.id === opportunityId);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch(`/api/saved-opportunities/${opportunityId}`, {
        method,
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Failed to ${isSaved ? 'unsave' : 'save'} opportunity`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-opportunities"] });
      toast({ 
        title: isSaved ? "Opportunity removed from saved" : "Opportunity saved successfully!" 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update saved status",
        variant: "destructive"
      });
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => saveMutation.mutate()}
      disabled={saveMutation.isPending}
      className={className}
    >
      {isSaved ? (
        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
      ) : (
        <HeartOff className="h-4 w-4" />
      )}
    </Button>
  );
}

interface ApplyButtonProps {
  opportunity: any;
  className?: string;
}

export function ApplyButton({ opportunity, className }: ApplyButtonProps) {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: applications } = useQuery({
    queryKey: ["/api/applications"],
  });

  const hasApplied = applications?.some((app: any) => app.opportunityId === opportunity.id);

  if (hasApplied) {
    return (
      <Button variant="outline" disabled className={className}>
        <CheckCircle className="h-4 w-4 mr-2" />
        Applied
      </Button>
    );
  }

  if (!userProfile?.user?.profileCompleted) {
    return (
      <Button variant="outline" disabled className={className}>
        Complete Profile to Apply
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setIsApplicationOpen(true)}
        className={className}
      >
        <FileText className="h-4 w-4 mr-2" />
        Apply Now
      </Button>
      
      <ApplicationForm
        opportunity={opportunity}
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
      />
    </>
  );
}

interface MyApplicationsProps {
  className?: string;
}

export function MyApplications({ className }: MyApplicationsProps) {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["/api/applications"],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              You haven't applied to any opportunities yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>My Applications ({applications.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((application: any) => (
            <div key={application.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{application.opportunity?.title || 'Opportunity'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                  {application.opportunity?.provider && (
                    <p className="text-sm text-gray-500 mt-1">
                      Provider: {application.opportunity.provider}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}