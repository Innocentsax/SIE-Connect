import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

interface OnboardingQuestionnaireProps {
  user: User;
}

interface QuestionData {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'number';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface StepData {
  id: string;
  title: string;
  description: string;
  questions: QuestionData[];
}

const STARTUP_FOUNDER_STEPS: StepData[] = [
  {
    id: 'startup-basics',
    title: 'Startup Basics',
    description: 'Tell us about your startup fundamentals',
    questions: [
      {
        id: 'startup-name',
        title: 'Startup Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your startup name'
      },
      {
        id: 'mission-statement',
        title: 'One-Line Mission Statement',
        type: 'textarea',
        required: true,
        placeholder: 'Describe what your startup does and the problem it solves'
      }
    ]
  },
  {
    id: 'sector-stage',
    title: 'Sector and Stage',
    description: 'Help us understand your domain and maturity',
    questions: [
      {
        id: 'industry-sector',
        title: 'Industry/Sector',
        type: 'multiselect',
        required: true,
        options: ['Fintech', 'Healthtech', 'Education', 'Climate/Environment', 'AgriTech', 'E-commerce', 'Social Impact', 'Other']
      },
      {
        id: 'startup-stage',
        title: 'Startup Stage',
        type: 'radio',
        required: true,
        options: ['Idea/Pre-seed', 'Prototype/MVP', 'Early Traction', 'Revenue Growth', 'Scaling']
      }
    ]
  },
  {
    id: 'traction-metrics',
    title: 'Traction & Metrics',
    description: 'Share your progress and achievements',
    questions: [
      {
        id: 'current-traction',
        title: 'Current Traction Details',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your traction: users, revenue, partnerships, key milestones, etc.'
      },
      {
        id: 'monthly-users',
        title: 'Monthly Active Users (if applicable)',
        type: 'number',
        placeholder: '0'
      },
      {
        id: 'monthly-revenue',
        title: 'Monthly Revenue (MYR, if applicable)',
        type: 'number',
        placeholder: '0'
      }
    ]
  },
  {
    id: 'funding',
    title: 'Funding',
    description: 'Tell us about your funding needs and history',
    questions: [
      {
        id: 'funding-status',
        title: 'Current Funding Status',
        type: 'radio',
        required: true,
        options: ['Bootstrapped (no external funding)', 'Pre-seed raised', 'Seed raised', 'Series A+ raised']
      },
      {
        id: 'seeking-funding',
        title: 'Are you currently seeking funding?',
        type: 'radio',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'funding-amount',
        title: 'Amount Seeking (MYR)',
        type: 'number',
        placeholder: '500000'
      },
      {
        id: 'funding-type',
        title: 'Funding Type',
        type: 'multiselect',
        options: ['Equity', 'Grant', 'Debt', 'Revenue-based financing', 'Other']
      },
      {
        id: 'use-of-funds',
        title: 'Use of Funds',
        type: 'textarea',
        placeholder: 'How will you use the funding?'
      }
    ]
  },
  {
    id: 'support-preferences',
    title: 'Support & Interests',
    description: 'What help are you looking for beyond capital?',
    questions: [
      {
        id: 'preferred-programs',
        title: 'Preferred Programs or Opportunities',
        type: 'multiselect',
        options: ['Accelerator Programs', 'Incubators', 'Startup Competitions', 'Corporate Partnerships', 'Mentorship Programs', 'Grants']
      },
      {
        id: 'specific-needs',
        title: 'Specific Support Needs',
        type: 'multiselect',
        options: ['Mentorship', 'Technical Assistance', 'Co-working Space', 'Network Access', 'Business Development', 'Regulatory Advice', 'Marketing Support', 'Hiring Support']
      },
      {
        id: 'additional-help',
        title: 'What help would most benefit your startup right now?',
        type: 'textarea',
        placeholder: 'Describe any specific challenges or areas where you need support'
      }
    ]
  }
];

const INVESTOR_STEPS: StepData[] = [
  {
    id: 'investor-basics',
    title: 'Investor Profile',
    description: 'Tell us about yourself and your organization',
    questions: [
      {
        id: 'investor-name',
        title: 'Investor/Fund Name',
        type: 'text',
        required: true,
        placeholder: 'Your name or fund name'
      },
      {
        id: 'investor-type',
        title: 'Investor Type',
        type: 'radio',
        required: true,
        options: ['Angel Investor (individual)', 'Venture Capital Firm', 'Family Office', 'Corporate VC', 'Foundation', 'Government Fund']
      },
      {
        id: 'geographic-focus',
        title: 'Geographic Focus',
        type: 'text',
        required: true,
        placeholder: 'e.g., Malaysia-focused, Southeast Asia, Global'
      }
    ]
  },
  {
    id: 'investment-preferences',
    title: 'Investment Preferences',
    description: 'Define your investment criteria and focus areas',
    questions: [
      {
        id: 'sectors-interest',
        title: 'Sectors of Interest',
        type: 'multiselect',
        required: true,
        options: ['Fintech', 'Healthtech', 'Education', 'Climate/Environment', 'AgriTech', 'E-commerce', 'Social Impact', 'B2B SaaS', 'Consumer', 'Deep Tech']
      },
      {
        id: 'preferred-stage',
        title: 'Preferred Startup Stage',
        type: 'multiselect',
        required: true,
        options: ['Idea/Pre-seed', 'Seed', 'Series A', 'Series B+', 'Growth Stage']
      },
      {
        id: 'check-size-min',
        title: 'Minimum Check Size (MYR)',
        type: 'number',
        required: true,
        placeholder: '50000'
      },
      {
        id: 'check-size-max',
        title: 'Maximum Check Size (MYR)',
        type: 'number',
        required: true,
        placeholder: '500000'
      },
      {
        id: 'lead-follow',
        title: 'Investment Approach',
        type: 'radio',
        options: ['Lead Investor', 'Co-investor/Follow', 'Both', 'N/A']
      }
    ]
  },
  {
    id: 'investment-thesis',
    title: 'Investment Thesis & Value-Add',
    description: 'Share your investment philosophy and what you offer',
    questions: [
      {
        id: 'investment-thesis',
        title: 'Investment Thesis/Focus',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your investment thesis and what you look for in startups'
      },
      {
        id: 'value-add-support',
        title: 'Value-Added Support',
        type: 'multiselect',
        options: ['Mentorship', 'Industry Connections', 'Hiring Assistance', 'Market Access', 'Corporate Partnerships', 'Follow-on Funding', 'Board Participation', 'Strategic Guidance']
      },
      {
        id: 'portfolio-experience',
        title: 'Notable Investments or Experience (Optional)',
        type: 'textarea',
        placeholder: 'Share relevant investment experience or notable portfolio companies'
      }
    ]
  }
];

const ECOSYSTEM_BUILDER_STEPS: StepData[] = [
  {
    id: 'organization-basics',
    title: 'Organization Basics',
    description: 'Tell us about your organization and mission',
    questions: [
      {
        id: 'organization-name',
        title: 'Organization Name',
        type: 'text',
        required: true,
        placeholder: 'Name of your organization or initiative'
      },
      {
        id: 'organization-type',
        title: 'Organization Type',
        type: 'radio',
        required: true,
        options: ['Accelerator', 'Incubator', 'Co-working Space', 'Non-profit Foundation', 'Government Agency', 'University Program', 'Community Network', 'Corporate CSR Program']
      },
      {
        id: 'mission-description',
        title: 'Mission Statement/Description',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your organizations mission and activities'
      }
    ]
  },
  {
    id: 'programs-activities',
    title: 'Programs & Activities',
    description: 'What does your organization offer to the ecosystem?',
    questions: [
      {
        id: 'activities-services',
        title: 'Activities/Services Provided',
        type: 'multiselect',
        required: true,
        options: ['Networking Events', 'Accelerator Program', 'Grant Funding', 'Mentorship/Training', 'Co-working Facilities', 'Policy Advocacy', 'Research/Reports', 'Investment Facilitation']
      },
      {
        id: 'target-beneficiaries',
        title: 'Target Beneficiaries',
        type: 'multiselect',
        options: ['Early-stage Startups', 'Growth-stage Companies', 'Social Enterprises', 'Tech Startups', 'Traditional SMEs', 'Investors', 'Corporates', 'Government']
      },
      {
        id: 'sectors-focus',
        title: 'Sector Focus (if any)',
        type: 'multiselect',
        options: ['Fintech', 'Healthtech', 'Education', 'Climate/Environment', 'AgriTech', 'Social Impact', 'All Sectors']
      }
    ]
  }
];

export function OnboardingQuestionnaire({ user }: OnboardingQuestionnaireProps) {
  const queryClient = useQueryClient();
  
  // Get steps based on user role
  const getStepsForRole = (role: string): StepData[] => {
    switch (role) {
      case 'STARTUP_FOUNDER':
        return STARTUP_FOUNDER_STEPS;
      case 'FUNDER':
        return INVESTOR_STEPS;
      case 'ECOSYSTEM_BUILDER':
        return ECOSYSTEM_BUILDER_STEPS;
      default:
        return [];
    }
  };

  const steps = getStepsForRole(user.role);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const completeOnboarding = useMutation({
    mutationFn: async (allResponses: Record<string, any>) => {
      // Submit all responses
      await apiRequest('/api/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify({ responses: allResponses }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      // Redirect to discovery page after successful onboarding
      window.location.href = '/discovery';
    }
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setIsSubmitting(true);
      completeOnboarding.mutate(responses);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    const currentStepData = steps[currentStep];
    const requiredQuestions = currentStepData.questions.filter(q => q.required);
    
    for (const question of requiredQuestions) {
      const response = responses[question.id];
      if (!response || (Array.isArray(response) && response.length === 0)) {
        return false;
      }
    }
    return true;
  };

  const renderQuestion = (question: QuestionData) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => updateResponse(question.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => updateResponse(question.id, val)}>
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateResponse(question.id, [...selectedValues, option]);
                    } else {
                      updateResponse(question.id, selectedValues.filter(v => v !== option));
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (steps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p>No onboarding questionnaire available for your role.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStepData.questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label className="text-sm font-medium">
                {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderQuestion(question)}
            </div>
          ))}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isSubmitting}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Completing...' : 'Complete Setup'}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}