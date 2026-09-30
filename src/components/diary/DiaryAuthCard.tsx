import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const DiaryAuthCard: React.FC = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      toast({
        title: "Authenticated successfully!",
        description: "Welcome back to your private sanctuary.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log in";
      setLoginError(msg);
      toast({
        title: "Authentication failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoginSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 sm:py-16 space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-md shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-foreground">Private Sanctuary Access</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This personal journal is strictly private. Enter your administrator credentials to access your daily reflections.
          </p>
        </div>

        <form onSubmit={handleQuickLogin} className="space-y-3.5 text-left pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground">Admin Email</label>
            <Input
              type="email"
              required
              placeholder="karangholap@zohomail.in"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="text-xs h-9 bg-background/80"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground">Password</label>
            <Input
              type="password"
              required
              placeholder="••••••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="text-xs h-9 bg-background/80"
            />
          </div>

          {loginError && (
            <p className="text-[11px] text-destructive font-medium bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
              {loginError}
            </p>
          )}

          <Button
            type="submit"
            disabled={loginSubmitting}
            className="w-full text-xs h-9 font-medium gap-2 mt-2"
          >
            {loginSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Log In & Enter Sanctuary</span>
              </>
            )}
          </Button>

          <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60">
            <Link
              to="/admin?redirect=/diary"
              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>Admin Panel</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              to="/"
              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>Return Home</span>
            </Link>
          </div>
        </form>
      </div>

      {/* Security Guarantee Note */}
      <div className="p-4 rounded-2xl border border-border/50 bg-secondary/30 text-xs text-muted-foreground space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Privacy Guarantee</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Your daily logs are protected by PostgreSQL Row Level Security (RLS). Entries are never indexed by search engines, excluded from the public sitemap, and strictly accessible only to your authenticated account.
        </p>
      </div>
    </div>
  );
};

export default DiaryAuthCard;
