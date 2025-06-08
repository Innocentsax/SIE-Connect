import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { insertApplicationSchema, type InsertApplication } from "@shared/schema";
import { z } from "zod";

const applicationFormSchema = insertApplicationSchema.extend({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
  projectDescription: z.string().min(100, "Project description must be at least 100 characters"),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface ApplicationFormProps {
  opportunityId: number;
  opportunityTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ApplicationForm({ opportunityId, opportunityTitle, onSuccess, onCancel }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      opportunityId,
      coverLetter: "",
      projectDescription: "",
      fundingRequested: "",
      additionalData: "",
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      return apiRequest(`/api/applications`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed", 
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      await createApplicationMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Apply for Opportunity</h2>
        <p className="text-muted-foreground mt-2">
          Applying for: <span className="font-medium">{opportunityTitle}</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us why you're interested in this opportunity and how you're qualified..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your project, business model, and how this opportunity aligns with your goals..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fundingRequested"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Requested</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., RM 50,000"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalData"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information you'd like to share..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || createApplicationMutation.isPending}
              className="flex-1"
            >
              {isSubmitting || createApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || createApplicationMutation.isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}