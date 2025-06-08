import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { Network } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("STARTUP_FOUNDER");
  const [isLoading, setIsLoading] = useState(false);

  // Check URL parameters for mode and role
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const urlRole = urlParams.get('role');
    
    if (mode === 'register') {
      setIsLogin(false);
    }
    if (urlRole) {
      setRole(urlRole);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(email, password, name, role);
      }

      if (success) {
        toast({
          title: isLogin ? "Welcome back!" : "Account created!",
          description: isLogin ? "You have been logged in successfully." : "Your account has been created and you are now logged in.",
        });
        setLocation('/dashboard');
      } else {
        toast({
          title: "Authentication failed",
          description: isLogin ? "Invalid email or password." : "Failed to create account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (roleValue: string) => {
    switch (roleValue) {
      case "STARTUP_FOUNDER": return "Startup Founder";
      case "FUNDER": return "Investor/Funder";
      case "ECOSYSTEM_BUILDER": return "Ecosystem Builder";
      case "ADMIN": return "Admin";
      default: return "User";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="flex items-center justify-center py-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Network className="text-white" size={24} />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? "Welcome back" : "Join IEC Hub"}
            </CardTitle>
            <p className="text-neutral-600">
              {isLogin 
                ? "Sign in to access your dashboard" 
                : "Create your account to connect with Malaysia's social enterprise ecosystem"
              }
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STARTUP_FOUNDER">Startup Founder</SelectItem>
                      <SelectItem value="FUNDER">Investor/Funder</SelectItem>
                      <SelectItem value="ECOSYSTEM_BUILDER">Ecosystem Builder</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-neutral-600">
                    {role === "STARTUP_FOUNDER" && "Access to funding opportunities and investor connections"}
                    {role === "FUNDER" && "Discover and connect with social enterprises"}
                    {role === "ECOSYSTEM_BUILDER" && "Organize events and manage community resources"}
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  // Clear form when switching modes
                  setEmail("");
                  setPassword("");
                  setName("");
                }}
                className="p-0 h-auto"
              >
                {isLogin ? "Sign up here" : "Sign in here"}
              </Button>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Demo Accounts</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Founder:</strong> founder@ecotech.my / password</p>
                <p><strong>Funder:</strong> investor@impact.my / password</p>
                <p><strong>Admin:</strong> admin@iechub.my / password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
