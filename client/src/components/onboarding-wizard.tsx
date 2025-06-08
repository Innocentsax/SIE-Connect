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
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const personalInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  location: z.string().min(2, "Location is required"),
});

const profileInfoSchema = z.object({
  sector: z.string().min(1, "Sector is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  interests: z.string().min(5, "Please describe your interests"),
  experience: z.string().min(5, "Please describe your experience"),
});

const founderSpecificSchema = z.object({
  stage: z.string().min(1, "Startup stage is required"),
  fundingStage: z.string().optional(),
  employeeCount: z.number().min(1).optional(),
  foundedYear: z.number().min(2000).max(new Date().getFullYear()).optional(),
});

const funderSpecificSchema = z.object({
  investmentRange: z.string().min(1, "Investment range is required"),
  fundingStage: z.string().min(1, "Preferred funding stage is required"),
});

interface OnboardingWizardProps {
  user: any;
  onComplete: () => void;
}

export function OnboardingWizard({ user, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalData, setPersonalData] = useState<any>({});
  const [profileData, setProfileData] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalSteps = user.role === "STARTUP_FOUNDER" ? 4 : user.role === "FUNDER" ? 4 : 3;
  const progress = (currentStep / totalSteps) * 100;

  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: user.name || "",
      company: user.company || "",
      location: user.location || "",
    },
  });

  const profileForm = useForm({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      sector: user.sector || "",
      description: user.description || "",
      interests: user.interests || "",
      experience: user.experience || "",
    },
  });

  const roleSpecificForm = useForm({
    resolver: zodResolver(
      user.role === "STARTUP_FOUNDER" ? founderSpecificSchema : 
      user.role === "FUNDER" ? funderSpecificSchema : z.object({})
    ),
    defaultValues: user.role === "STARTUP_FOUNDER" ? {
      stage: user.stage || "",
      fundingStage: user.fundingStage || "",
      employeeCount: user.employeeCount || undefined,
      foundedYear: user.foundedYear || undefined,
    } : user.role === "FUNDER" ? {
      investmentRange: user.investmentRange || "",
      fundingStage: user.fundingStage || "",
    } : {},
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile updated successfully!" });
      onComplete();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleNext = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await personalForm.trigger();
      if (isValid) {
        setPersonalData(personalForm.getValues());
      }
    } else if (currentStep === 2) {
      isValid = await profileForm.trigger();
      if (isValid) {
        setProfileData(profileForm.getValues());
      }
    } else if (currentStep === 3 && user.role !== "ECOSYSTEM_BUILDER") {
      isValid = await roleSpecificForm.trigger();
    } else {
      isValid = true;
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const roleSpecificData = user.role !== "ECOSYSTEM_BUILDER" ? roleSpecificForm.getValues() : {};
    
    const completeData = {
      ...personalData,
      ...profileData,
      ...roleSpecificData,
      profileCompleted: true,
      onboardingCompleted: true,
    };

    updateProfileMutation.mutate(completeData);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Personal Information";
      case 2: return "Profile Details";
      case 3: 
        if (user.role === "STARTUP_FOUNDER") return "Startup Information";
        if (user.role === "FUNDER") return "Investment Preferences";
        return "Complete Setup";
      case 4: return "Complete Setup";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index + 1 < currentStep ? "bg-green-500 text-white" :
                    index + 1 === currentStep ? "bg-blue-500 text-white" :
                    "bg-gray-200 text-gray-500"
                  }`}>
                    {index + 1 < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div className={`w-8 h-1 ${
                      index + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to the Ecosystem Platform</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Step {currentStep} of {totalSteps}: {getStepTitle()}
          </p>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...personalForm.register("name")}
                  placeholder="Enter your full name"
                />
                {personalForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {personalForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="company">Company/Organization</Label>
                <Input
                  id="company"
                  {...personalForm.register("company")}
                  placeholder="Your company or organization"
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  {...personalForm.register("location")}
                  placeholder="City, Country"
                />
                {personalForm.formState.errors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {personalForm.formState.errors.location.message}
                  </p>
                )}
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form className="space-y-4">
              <div>
                <Label htmlFor="sector">Industry Sector *</Label>
                <Select onValueChange={(value) => profileForm.setValue("sector", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="HealthTech">HealthTech</SelectItem>
                    <SelectItem value="EdTech">EdTech</SelectItem>
                    <SelectItem value="AgriTech">AgriTech</SelectItem>
                    <SelectItem value="CleanTech">CleanTech</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                    <SelectItem value="IoT">IoT</SelectItem>
                    <SelectItem value="Blockchain">Blockchain</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {profileForm.formState.errors.sector && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.sector.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Professional Description *</Label>
                <Textarea
                  id="description"
                  {...profileForm.register("description")}
                  placeholder="Tell us about yourself and your work..."
                  rows={4}
                />
                {profileForm.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="interests">Areas of Interest *</Label>
                <Textarea
                  id="interests"
                  {...profileForm.register("interests")}
                  placeholder="What areas are you most interested in?"
                  rows={3}
                />
                {profileForm.formState.errors.interests && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.interests.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="experience">Experience *</Label>
                <Textarea
                  id="experience"
                  {...profileForm.register("experience")}
                  placeholder="Describe your relevant experience..."
                  rows={3}
                />
                {profileForm.formState.errors.experience && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.experience.message}
                  </p>
                )}
              </div>
            </form>
          )}

          {currentStep === 3 && user.role === "STARTUP_FOUNDER" && (
            <form className="space-y-4">
              <div>
                <Label htmlFor="stage">Startup Stage *</Label>
                <Select onValueChange={(value) => roleSpecificForm.setValue("stage", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your startup stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Idea">Idea Stage</SelectItem>
                    <SelectItem value="MVP">MVP Development</SelectItem>
                    <SelectItem value="Early Stage">Early Stage</SelectItem>
                    <SelectItem value="Growth">Growth Stage</SelectItem>
                    <SelectItem value="Scale">Scale Stage</SelectItem>
                  </SelectContent>
                </Select>
                {roleSpecificForm.formState.errors.stage && (
                  <p className="text-red-500 text-sm mt-1">
                    {roleSpecificForm.formState.errors.stage.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="fundingStage">Funding Stage</Label>
                <Select onValueChange={(value) => roleSpecificForm.setValue("fundingStage", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Current funding stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                    <SelectItem value="Series C+">Series C+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeCount">Team Size</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    {...roleSpecificForm.register("employeeCount", { valueAsNumber: true })}
                    placeholder="Number of employees"
                  />
                </div>

                <div>
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    {...roleSpecificForm.register("foundedYear", { valueAsNumber: true })}
                    placeholder="Year founded"
                  />
                </div>
              </div>
            </form>
          )}

          {currentStep === 3 && user.role === "FUNDER" && (
            <form className="space-y-4">
              <div>
                <Label htmlFor="investmentRange">Investment Range *</Label>
                <Select onValueChange={(value) => roleSpecificForm.setValue("investmentRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$10K - $50K">$10K - $50K</SelectItem>
                    <SelectItem value="$50K - $100K">$50K - $100K</SelectItem>
                    <SelectItem value="$100K - $500K">$100K - $500K</SelectItem>
                    <SelectItem value="$500K - $1M">$500K - $1M</SelectItem>
                    <SelectItem value="$1M - $5M">$1M - $5M</SelectItem>
                    <SelectItem value="$5M+">$5M+</SelectItem>
                  </SelectContent>
                </Select>
                {roleSpecificForm.formState.errors.investmentRange && (
                  <p className="text-red-500 text-sm mt-1">
                    {roleSpecificForm.formState.errors.investmentRange.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="fundingStage">Preferred Funding Stage *</Label>
                <Select onValueChange={(value) => roleSpecificForm.setValue("fundingStage", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Preferred funding stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                    <SelectItem value="Series C+">Series C+</SelectItem>
                  </SelectContent>
                </Select>
                {roleSpecificForm.formState.errors.fundingStage && (
                  <p className="text-red-500 text-sm mt-1">
                    {roleSpecificForm.formState.errors.fundingStage.message}
                  </p>
                )}
              </div>
            </form>
          )}

          {((currentStep === 3 && user.role === "ECOSYSTEM_BUILDER") || currentStep === 4) && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Almost Done!</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You're ready to complete your profile setup and start exploring the ecosystem platform.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleComplete}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Completing..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}