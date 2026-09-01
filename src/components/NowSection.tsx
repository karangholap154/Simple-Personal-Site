import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCommit, BookOpen, GraduationCap, Clock, ExternalLink, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GitHubCommit {
  sha: string;
  message: string;
  url: string;
}

interface GitHubPushPayload {
  commits: GitHubCommit[];
  ref: string;
}

interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
    url: string;
  };
  payload: GitHubPushPayload;
  created_at: string;
}

interface SiteNowStatus {
  id: string;
  status_text: string;
  currently_learning?: string;
  currently_reading?: string;
  updated_at: string;
}

// Clean and humanize raw git commit messages
const cleanCommitMessage = (msg: string): string => {
  if (!msg) return "";
  // Take first line of multi-line commit message
  let clean = msg.split("\n")[0].trim();
  // Strip conventional commit prefixes like feat:, fix:, chore:, docs:
  clean = clean.replace(/^(feat|fix|chore|docs|style|refactor|perf|test)(\([\w-]+\))?:\s*/i, "");
  // Capitalize first letter
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean;
};

export const NowSection = () => {
  // 1. Fetch Supabase Manual Status Override
  const { data: dbStatus } = useQuery<SiteNowStatus | null>({
    queryKey: ["site-now-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_now_status")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data;
    },
  });

  // 2. Fetch Live GitHub Activity
  const { data: latestCommitActivity, isLoading: loadingGithub } = useQuery({
    queryKey: ["github-latest-activity"],
    queryFn: async () => {
      const res = await fetch("https://api.github.com/users/karangholap154/events/public?per_page=15");
      if (!res.ok) throw new Error("Failed to fetch GitHub events");
      const events: GitHubEvent[] = await res.json();
      
      // Filter for recent PushEvents
      const pushEvents = events.filter((e) => e.type === "PushEvent" && e.payload?.commits?.length > 0);
      if (pushEvents.length === 0) return null;

      const latestEvent = pushEvents[0];
      const repoName = latestEvent.repo.name.replace(/^karangholap154\//i, "");
      const commitCount = latestEvent.payload.commits.length;
      const rawMsg = latestEvent.payload.commits[latestEvent.payload.commits.length - 1]?.message || "";
      const cleanedMsg = cleanCommitMessage(rawMsg);
      const relativeTime = formatDistanceToNow(new Date(latestEvent.created_at), { addSuffix: true });
      const repoUrl = `https://github.com/${latestEvent.repo.name}`;

      return {
        repoName,
        repoUrl,
        commitCount,
        message: cleanedMsg,
        relativeTime,
        rawTimestamp: latestEvent.created_at,
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    retry: 1,
  });

  return (
    <section className="py-6">
      <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 via-secondary/20 to-background p-5 relative overflow-hidden shadow-sm">
        {/* Glow effect in background */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Live Indicator */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-1.5">
              <span>What I'm Doing Now</span>
              <Sparkles size={14} className="text-primary/70" />
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Clock size={12} />
            {latestCommitActivity?.relativeTime || "Updated recently"}
          </span>
        </div>

        {/* Dynamic Activity Content */}
        {loadingGithub ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-4">
            {latestCommitActivity ? (
              <div className="p-3.5 bg-background/60 rounded-lg border border-border/60 backdrop-blur-sm">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary mt-0.5 shrink-0">
                    <GitCommit size={16} />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground leading-relaxed">
                      Currently shipping to{" "}
                      <a
                        href={latestCommitActivity.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {latestCommitActivity.repoName}
                        <ExternalLink size={12} />
                      </a>
                      : <span className="text-foreground/90 font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded">{latestCommitActivity.message}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pushed {latestCommitActivity.commitCount} commit{latestCommitActivity.commitCount > 1 ? "s" : ""} {latestCommitActivity.relativeTime}
                    </p>
                  </div>
                </div>
              </div>
            ) : dbStatus?.status_text ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {dbStatus.status_text}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Building & refining full-stack web products with React, TypeScript, and Supabase.
              </p>
            )}

            {/* Extra Info Pills: Currently Learning & Reading */}
            {(dbStatus?.currently_learning || dbStatus?.currently_reading) && (
              <div className="flex flex-wrap gap-3 pt-1 text-xs">
                {dbStatus?.currently_learning && (
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-md border border-border/40">
                    <GraduationCap size={14} className="text-primary" />
                    <span>Learning: <strong className="text-foreground font-medium">{dbStatus.currently_learning}</strong></span>
                  </div>
                )}
                {dbStatus?.currently_reading && (
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-md border border-border/40">
                    <BookOpen size={14} className="text-primary" />
                    <span>Reading: <strong className="text-foreground font-medium">{dbStatus.currently_reading}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default NowSection;
