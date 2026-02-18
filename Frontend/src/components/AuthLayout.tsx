import { ReactNode } from "react";
import { Shield } from "lucide-react";

const AuthLayout = ({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) => {
  return (
    <div className="min-h-screen flex dark">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-8">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">SecureBank</h1>
          <p className="text-muted-foreground text-lg">
            Modern banking infrastructure. Fast, secure, and reliable financial services at your fingertips.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl gradient-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SecureBank</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
