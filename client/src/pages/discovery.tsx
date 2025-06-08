import { useQuery } from "@tanstack/react-query";
import { DiscoveryPage } from "@/components/discovery-page";
import { useLocation } from "wouter";

export function Discovery() {
  const [location] = useLocation();
  
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => fetch('/api/auth/me').then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your personalized discovery page...</p>
        </div>
      </div>
    );
  }

  if (!currentUser?.user) {
    // Redirect to login if not authenticated
    window.location.href = '/login';
    return null;
  }

  return <DiscoveryPage user={currentUser.user} />;
}