import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { ProfileSetup } from "@/components/profile-setup";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { isAuthenticated, checkAuth, user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/auth');
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentUser = userProfile?.user || user;
  const needsProfileCompletion = !currentUser?.profileCompleted;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {needsProfileCompletion ? (
            <ProfileSetup />
          ) : (
            <DashboardTabs />
          )}
        </div>
      </div>
    </div>
  );
}
