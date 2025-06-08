import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const createOpportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.string().min(1, "Type is required"),
  provider: z.string().min(1, "Provider is required"),
  sector: z.string().optional(),
  location: z.string().optional(),
  amount: z.string().optional(),
  criteria: z.string().optional(),
  deadline: z.date().optional(),
  link: z.string().url("Must be a valid URL").optional().or(z.literal(""))
});

type CreateOpportunityFormData = z.infer<typeof createOpportunitySchema>;

interface CreateOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateOpportunityForm({ isOpen, onClose, onSuccess }: CreateOpportunityFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateOpportunityFormData>({
    resolver: zodResolver(createOpportunitySchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      provider: "",
      sector: "",
      location: "",
      amount: "",
      criteria: "",
      link: ""
    }
  });

  const createOpportunityMutation = useMutation({
    mutationFn: (data: CreateOpportunityFormData) => {
      const payload = {
        ...data,
        link: data.link || null,
        deadline: data.deadline ? data.deadline.toISOString() : null
      };
      return apiRequest('/api/opportunities', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Opportunity created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/search'] });
      form.reset();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create opportunity",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (data: CreateOpportunityFormData) => {
    createOpportunityMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Opportunity
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Opportunity Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Impact Accelerator Program 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Grant">Grant</SelectItem>
                        <SelectItem value="Accelerator">Accelerator</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                        <SelectItem value="Competition">Competition</SelectItem>
                        <SelectItem value="Incubator">Incubator</SelectItem>
                        <SelectItem value="Mentorship">Mentorship</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider/Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Malaysian Digital Economy Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                        <SelectItem value="HealthTech">HealthTech</SelectItem>
                        <SelectItem value="EdTech">EdTech</SelectItem>
                        <SelectItem value="AgriTech">AgriTech</SelectItem>
                        <SelectItem value="CleanTech">CleanTech</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Social Impact">Social Impact</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kuala Lumpur, Malaysia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount/Value (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., RM 50,000 - RM 500,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Link (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/apply" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about this opportunity, including eligibility criteria, benefits, and application process..."
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
              name="criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eligibility Criteria (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List specific requirements for applicants..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createOpportunityMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createOpportunityMutation.isPending}
              >
                {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}