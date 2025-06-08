import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Bell, Menu, Network } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Network className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-neutral-900">IEC Hub</span>
              </div>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className={`${location === '/' ? 'text-primary font-medium' : 'text-neutral-700 hover:text-primary'}`}>
                Discover
              </Link>
              <Link href="/#startups" className="text-neutral-700 hover:text-primary">
                Startups
              </Link>
              <Link href="/#opportunities" className="text-neutral-700 hover:text-primary">
                Opportunities
              </Link>
              <Link href="/#events" className="text-neutral-700 hover:text-primary">
                Events
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <Button variant="ghost" size="icon">
                <Bell size={20} />
              </Button>
            )}
            
            <div className="hidden sm:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <Button onClick={handleLogout} variant="outline">
                    Logout
                  </Button>
                  <div className="text-sm text-neutral-600">
                    {user?.name || user?.email}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/auth?mode=register">
                    <Button>Join Hub</Button>
                  </Link>
                </>
              )}
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-6">
                  <Link href="/" className="text-lg">
                    Discover
                  </Link>
                  <Link href="/#startups" className="text-lg">
                    Startups
                  </Link>
                  <Link href="/#opportunities" className="text-lg">
                    Opportunities
                  </Link>
                  <Link href="/#events" className="text-lg">
                    Events
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard">
                        <Button className="w-full">Dashboard</Button>
                      </Link>
                      <Button onClick={handleLogout} variant="outline" className="w-full">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth">
                        <Button variant="outline" className="w-full">Sign In</Button>
                      </Link>
                      <Link href="/auth?mode=register">
                        <Button className="w-full">Join Hub</Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
