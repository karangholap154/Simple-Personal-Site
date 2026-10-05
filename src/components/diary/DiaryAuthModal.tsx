import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface DiaryAuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DiaryAuthModal: React.FC<DiaryAuthModalProps> = ({ isOpen, onOpenChange }) => {
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
        description: "Welcome back to your private journal sanctuary.",
      });
      onOpenChange(false);
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 sm:p-7 rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Owner Sanctuary Access
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Enter administrator credentials to unlock your private reflections, daily raw logs, and AI coaching.
          </DialogDescription>
        </DialogHeader>

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
              autoFocus
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
                <span>Verifying credentials...</span>
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
              onClick={() => onOpenChange(false)}
              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>Admin Panel</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </form>

        <div className="p-3 rounded-xl border border-border/50 bg-secondary/30 text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>Protected by PostgreSQL Row Level Security (RLS).</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiaryAuthModal;
