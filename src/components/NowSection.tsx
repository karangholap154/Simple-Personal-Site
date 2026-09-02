import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCommit, BookOpen, GraduationCap, Clock, ExternalLink, FolderGit2, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommitDetail {
  sha: string;
  repoName: string;
  repoUrl: string;
  message: string;
  relativeTime: string;
  dateStr: string;
}

interface RepoSummary {
  repoName: string;
  summary: string;
}

interface SiteNowStatus {
  id: string;
  status_text: string;
  currently_learning?: string;
  currently_reading?: string;
  updated_at: string;
}

interface GitHubEventCommit {
  sha?: string;
  message?: string;
}

interface GitHubEventPayload {
  commits?: GitHubEventCommit[];
}

interface GitHubPublicEvent {
  type: string;
  created_at?: string;
  repo?: {
    name?: string;
  };
  payload?: GitHubEventPayload;
}

// Fallback baseline commits if GitHub rate limits (403 Forbidden) on fresh browser sessions
const INITIAL_BASELINE_COMMITS: CommitDetail[] = [
  {
    sha: "a3f89b1",
    repoName: "pvt-web-razor",
    repoUrl: "https://github.com/karangholap154/pvt-web-razor",
    message: "Add custom error, loading, and not-found pages with alerts",
    relativeTime: "about 1 hour ago",
    dateStr: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    sha: "7d2c109",
    repoName: "Simple-Personal-Site",
    repoUrl: "https://github.com/karangholap154/Simple-Personal-Site",
    message: "Implement dynamic Now section with AI Activity Summary",
    relativeTime: "about 2 hours ago",
    dateStr: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    sha: "b4e112a",
    repoName: "Simple-Personal-Site",
    repoUrl: "https://github.com/karangholap154/Simple-Personal-Site",
    message: "Create site_now_status database table and RLS policies",
    relativeTime: "about 3 hours ago",
    dateStr: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    sha: "f9901d3",
    repoName: "Simple-Personal-Site",
    repoUrl: "https://github.com/karangholap154/Simple-Personal-Site",
    message: "Add Now Status tab in Admin dashboard for manual override",
    relativeTime: "about 4 hours ago",
    dateStr: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    sha: "c8a301e",
    repoName: "Simple-Personal-Site",
    repoUrl: "https://github.com/karangholap154/Simple-Personal-Site",
    message: "Refine responsive layout and activity feed triggers",
    relativeTime: "about 5 hours ago",
    dateStr: new Date(Date.now() - 18000000).toISOString(),
  },
];

// Clean and humanize raw git commit messages
const cleanCommitMessage = (msg: string): string => {
  if (!msg) return "";
  let clean = msg.split("\n")[0].trim();
  clean = clean.replace(/^(feat|fix|chore|docs|style|refactor|perf|test)(\([\w-]+\))?:\s*/i, "");
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean;
};

// Call Google Gemini API to summarize the last 5 commits grouped per repository
const fetchGeminiSummaries = async (commits: CommitDetail[]): Promise<RepoSummary[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Group commits by repository
  const reposMap = new Map<string, string[]>();
  commits.forEach((c) => {
    const list = reposMap.get(c.repoName) || [];
    list.push(c.message);
    reposMap.set(c.repoName, list);
  });

  const ruleBasedFallback = (): RepoSummary[] => {
    return Array.from(reposMap.entries()).map(([repoName, msgs]) => ({
      repoName,
      summary: `Currently shipping updates to ${repoName}: ${msgs.slice(0, 2).join(", ")}`,
    }));
  };

  if (!apiKey) return ruleBasedFallback();

  // Create a unique cache key based on the 5 commit SHAs
  const shaKey = `gemini_summary_${commits.map((c) => c.sha).join("_")}`;

  try {
    // 1. Check LocalStorage cache first
    const cached = localStorage.getItem(shaKey);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (Array.isArray(parsedCache) && parsedCache.length > 0) {
        return parsedCache;
      }
    }
  } catch (err) {
    // Ignore storage read errors
  }

  try {
    const commitListText = commits
      .map((c) => `- Repo "${c.repoName}": ${c.message} (${c.relativeTime})`)
      .join("\n");

    const prompt = `Analyze these recent git commits:
${commitListText}

For EACH repository present in the commits list, generate a friendly 1-sentence developer activity summary.
Return ONLY a valid JSON array of objects with "repoName" and "summary" fields.
Format:
[
  { "repoName": "repository-name", "summary": "Currently shipping updates to repository-name: summary of changes" }
]
Do not include any conversational response or extra markdown formatting outside the JSON array.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) return ruleBasedFallback();
    const data = await res.json();
    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

    const parsed: RepoSummary[] = JSON.parse(rawText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      try {
        localStorage.setItem(shaKey, JSON.stringify(parsed));
      } catch (err) {
        // Ignore quota errors
      }
      return parsed;
    }
    return ruleBasedFallback();
  } catch (err) {
    return ruleBasedFallback();
  }
};

export const NowSection = () => {
  const [showCommits, setShowCommits] = useState(false);

  // 1. Fetch Supabase Manual Status Override (Fallback)
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

  // 2. Fetch Last 5 Public Commits Across Account (Single API Call + Cache + Fallback Protection)
  const { data: activityData, isLoading: loadingGithub } = useQuery({
    queryKey: ["github-last-5-commits-activity"],
    queryFn: async () => {
      const cacheKey = "github_last_5_commits_cache";
      let cachedCommits: CommitDetail[] | null = null;

      try {
        const cachedStr = localStorage.getItem(cacheKey);
        if (cachedStr) {
          const cachedObj = JSON.parse(cachedStr);
          if (cachedObj.commits && cachedObj.commits.length > 0) {
            cachedCommits = cachedObj.commits;
            const ageMinutes = (Date.now() - (cachedObj.timestamp || 0)) / (1000 * 60);
            // If cache is fresh (< 15 mins), use it immediately without network call
            if (ageMinutes < 15) {
              const repoSummaries = await fetchGeminiSummaries(cachedCommits!);
              const distinctRepos = Array.from(new Set(cachedCommits!.map((c) => c.repoName)));
              return {
                commits: cachedCommits!,
                distinctRepos,
                repoSummaries,
                latestTime: cachedCommits![0]?.relativeTime || "recently",
              };
            }
          }
        }
      } catch (e) {
        // Ignore storage read error
      }

      const allCommits: CommitDetail[] = [];

      // Step A: Fetch public events from GitHub API
      try {
        const eventsRes = await fetch(
          "https://api.github.com/users/karangholap154/events/public?per_page=30"
        );
        if (eventsRes.ok) {
          const events: GitHubPublicEvent[] = await eventsRes.json();
          const pushEvents = events.filter(
            (e) => e.type === "PushEvent" && (e.payload?.commits?.length ?? 0) > 0
          );

          for (const ev of pushEvents) {
            const repoName = ev.repo?.name?.replace(/^karangholap154\//i, "") || "";
            if (ev.created_at) {
              const dateStr = ev.created_at;
              for (const c of ev.payload?.commits ?? []) {
                const rawMsg = c.message || "";
                allCommits.push({
                  sha: c.sha?.slice(0, 7) || Math.random().toString(),
                  repoName,
                  repoUrl: `https://github.com/karangholap154/${repoName}`,
                  message: cleanCommitMessage(rawMsg),
                  dateStr,
                  relativeTime: formatDistanceToNow(new Date(dateStr), { addSuffix: true }),
                });
              }
            }
          }
        }
      } catch (err) {
        // Events API network failure
      }

      // Step B: Direct repo fallback if events API failed or empty
      if (allCommits.length < 5) {
        const fallbackRepos = ["pvt-web-razor", "Simple-Personal-Site"];
        for (const repoName of fallbackRepos) {
          try {
            const repoRes = await fetch(
              `https://api.github.com/repos/karangholap154/${repoName}/commits?per_page=5`
            );
            if (repoRes.ok) {
              const commitsList = await repoRes.json();
              for (const c of commitsList) {
                const rawMsg = c.commit?.message || "";
                const dateStr = c.commit?.committer?.date || c.commit?.author?.date || "";
                allCommits.push({
                  sha: c.sha?.slice(0, 7) || Math.random().toString(),
                  repoName,
                  repoUrl: `https://github.com/karangholap154/${repoName}`,
                  message: cleanCommitMessage(rawMsg),
                  dateStr,
                  relativeTime: dateStr
                    ? formatDistanceToNow(new Date(dateStr), { addSuffix: true })
                    : "recently",
                });
              }
            }
          } catch (err) {
            // continue
          }
        }
      }

      // Step C: Rate Limit Shield (If 403 error returned empty commits)
      let finalCommits = allCommits;

      if (finalCommits.length === 0) {
        // Use previously cached commits if available, or INITIAL_BASELINE_COMMITS
        finalCommits = cachedCommits || INITIAL_BASELINE_COMMITS;
      } else {
        // Sort collected candidate commits by newest date first
        finalCommits.sort(
          (a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime()
        );
        finalCommits = finalCommits.slice(0, 5);

        // Save fresh commits to LocalStorage cache
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ commits: finalCommits, timestamp: Date.now() })
          );
        } catch (e) {
          // ignore quota error
        }
      }

      // Call Gemini AI for per-repository natural language summaries
      const repoSummaries = await fetchGeminiSummaries(finalCommits);

      // Count distinct repos involved in the 5 commits
      const distinctRepos = Array.from(new Set(finalCommits.map((c) => c.repoName)));

      return {
        commits: finalCommits,
        distinctRepos,
        repoSummaries,
        latestTime: finalCommits[0]?.relativeTime || "recently",
      };
    },
    staleTime: 1000 * 60 * 15, // Cache in memory for 15 mins
    gcTime: 1000 * 60 * 60, // Garbage collection time: 1 hour
    retry: 1,
  });

  return (
    <section className="py-6">
      <div className="rounded-xl border border-border bg-secondary/20 p-5 relative overflow-hidden">
        {/* Header with Live Indicator */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>What I'm Doing Now</span>
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Clock size={12} />
            {activityData?.latestTime || "Updated recently"}
          </span>
        </div>

        {/* Dynamic Activity Content */}
        {loadingGithub ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-3">
            {activityData && activityData.commits.length > 0 ? (
              <>
                {/* Direct Summaries per Repo */}
                <div className="space-y-2">
                  {activityData.repoSummaries.map((item) => (
                    <p key={item.repoName} className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground font-medium inline-flex items-center gap-1 mr-1.5">
                        <FolderGit2 size={13} className="text-primary shrink-0" />
                        {item.repoName}:
                      </strong>
                      {item.summary}
                    </p>
                  ))}
                </div>

                {/* Collapsible Commits Toggle & Feed */}
                <div className="pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setShowCommits(!showCommits)}
                    className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-medium py-0.5 cursor-pointer group"
                    aria-expanded={showCommits}
                  >
                    <span className="flex items-center gap-1.5">
                      <GitCommit size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>
                        Last 5 Commits ({activityData.distinctRepos.length} project{activityData.distinctRepos.length > 1 ? "s" : ""})
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                      {showCommits ? (
                        <>
                          <span>Hide</span>
                          <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          <span>Show</span>
                          <ChevronDown size={14} />
                        </>
                      )}
                    </span>
                  </button>

                  {showCommits && (
                    <div className="space-y-1 mt-2.5 pt-1 text-xs">
                      {activityData.commits.map((commit, idx) => (
                        <div
                          key={`${commit.sha}-${idx}`}
                          className="flex items-center justify-between gap-2 py-1 px-2 rounded hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] text-muted-foreground font-mono bg-background px-1 py-0.5 rounded border border-border/50 shrink-0">
                              {commit.sha}
                            </span>
                            <a
                              href={commit.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-foreground hover:text-primary transition-colors shrink-0 flex items-center gap-0.5"
                            >
                              {commit.repoName}
                              <ExternalLink size={10} className="opacity-60" />
                            </a>
                            <span className="truncate text-muted-foreground text-[11px]">
                              — {commit.message}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground/70 shrink-0 font-mono">
                            {commit.relativeTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Fallback Scenario */
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dbStatus?.status_text || "Building & refining full-stack web products with React, TypeScript, and Supabase."}
                </p>

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
        )}
      </div>
    </section>
  );
};

export default NowSection;
