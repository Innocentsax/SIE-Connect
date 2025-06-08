import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";
import { useEffect } from "react";

import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { Discovery } from "@/pages/discovery";
import { ProfileSetup } from "@/components/profile-setup";
import { OnboardingQuestionnaire } from "@/components/onboarding-questionnaire";

function Router() {
  const { user, isAuthenticated } = useAuth();

  // Debug logging to understand routing state
  console.log('Router state:', { 
    isAuthenticated, 
    user: user ? {
      id: user.id,
      role: user.role,
      profileCompleted: user.profileCompleted,
      onboardingCompleted: user.onboardingCompleted
    } : null 
  });

  // Admin users bypass profile setup and onboarding
  if (isAuthenticated && user && user.role === 'ADMIN') {
    return (
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/discovery" component={Discovery} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show profile setup if user is authenticated but profile not completed
  if (isAuthenticated && user && user.profileCompleted !== true) {
    console.log('Showing ProfileSetup - profileCompleted:', user.profileCompleted);
    return <ProfileSetup />;
  }

  // Show onboarding questionnaire if profile completed but onboarding not completed
  if (isAuthenticated && user && user.profileCompleted === true && user.onboardingCompleted !== true) {
    console.log('Showing OnboardingQuestionnaire - onboardingCompleted:', user.onboardingCompleted);
    return <OnboardingQuestionnaire user={user} />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/discovery" component={Discovery} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
