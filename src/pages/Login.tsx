import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { DEMO_MODE, DEMO_USERS, type UserRole } from "@/lib/demoMode";

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("triage_nurse");

  const handleDemoLogin = () => {
    // In demo mode, just navigate to dashboard
    // In production, this would integrate with Auth0
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary">
              <Shield className="h-9 w-9 text-primary-foreground" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">CardioAssist</h1>
          <p className="text-muted-foreground">AI-Powered Emergency Triage</p>
        </div>

        {/* Login Card */}
        <div className="card-clinical p-8 space-y-6">
          {DEMO_MODE ? (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Demo Mode</h2>
                <p className="text-sm text-muted-foreground">
                  Select a role to explore the application with synthetic data.
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="role-select" className="block text-sm font-medium text-foreground">
                  Select Role
                </label>
                <div className="space-y-2">
                  {Object.entries(DEMO_USERS).map(([key, user]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedRole(user.role)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedRole === user.role
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      aria-pressed={selectedRole === user.role}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {key === "nurse" && "Triage intake and patient assessment"}
                        {key === "doctor" && "Case review and medical decisions"}
                        {key === "admin" && "System administration and audit logs"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleDemoLogin} className="w-full" size="lg" aria-label="Continue to dashboard">
                Continue to Dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Sign In</h2>
                <p className="text-sm text-muted-foreground">
                  This application integrates with Auth0 for secure authentication.
                </p>
              </div>

              <Button onClick={handleDemoLogin} className="w-full" size="lg" aria-label="Sign in with Auth0">
                Sign in with Auth0
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Production deployment requires Auth0 configuration.
                  <br />
                  See <code className="text-xs bg-muted px-1 py-0.5 rounded">docs/README_SNOWFLAKE.md</code> for
                  setup.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back to home"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
