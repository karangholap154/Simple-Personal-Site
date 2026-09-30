# 📓 Personal Life Journal & Nightly Reflection System --- Detailed Specification

> **Document Version**: 2.0.0\
> **Previous Version**: 1.0.0\
> **Status**: Detailed Implementation Specification\
> **Target Path**: `src/pages/Diary.tsx` (`/diary`)\
> **Privacy Level**: **Private by Default** --- authenticated access +
> Supabase Row Level Security\
> **Primary Principle**: **Your Words First. AI Second.**\
> **Primary Goal**: Build a long-term personal journal that records what
> happened, preserves the user's authentic voice, optionally structures
> the day with AI, and gradually becomes a searchable personal history.

------------------------------------------------------------------------

# 1. Executive Summary & Vision

The **Personal Life Journal & Nightly Reflection System** is a private,
zero-friction evening journaling and reflection tool built directly into
the user's personal digital workspace.

It is intentionally broader than a productivity tracker.

The system should allow the user to record:

-   What they worked on
-   What they learned
-   How they spent their time
-   What happened during the day
-   Good news and bad news
-   Family and social events
-   Important conversations
-   Personal thoughts
-   Emotional experiences
-   Projects and technical work
-   Things they are proud of
-   Things they regret
-   Things they want to improve
-   Ideas that occurred during the day
-   Anything else they want to remember

The user should be able to write everything in one free-form entry
without completing a rigid form.

AI can then **extract, organize, summarize, and analyze** the entry, but
AI must never become the source of truth.

The long-term vision is:

``` text
Daily Journal
      ↓
Structured Daily Information
      ↓
Weekly / Monthly / Yearly Insights
      ↓
Important Memories
      ↓
Personal Knowledge Base
      ↓
Search My Life / Ask My Journal
```

The system should become a historical record of the user's life rather
than merely another productivity dashboard.

------------------------------------------------------------------------

# 2. Core Philosophy

## 2.1 The Raw Entry is Sacred

The user's original writing is the primary source of truth.

The system must preserve:

-   Exact words
-   Spelling mistakes
-   Grammar mistakes
-   Hinglish
-   Hindi
-   Marathi
-   English
-   Marathi written using Latin characters
-   Informal slang
-   Emojis
-   Line breaks
-   Emotional wording
-   Repetitions
-   Stream-of-consciousness writing

AI must **never overwrite, rewrite, sanitize, or replace** the original
entry.

The original entry should remain readable exactly as it was written.

### Example

User writes:

> "Aaj office madhe khup kaam hota but somehow mala asa vatla ki
> productive navto. 2 taas reels baghitlya. Python thoda shiklo. Mom
> sobat dinner mast hota."

The original must remain exactly as entered.

AI may create:

``` text
Work:
~7 hours

Learning:
Python

Entertainment:
~2 hours

Family:
Dinner with mother

Possible mood:
Neutral / mixed

AI confidence:
Medium
```

But these are **derived observations**, not replacements for the
original writing.

------------------------------------------------------------------------

# 3. AI is an Additive Companion Layer

AI exists to reduce manual work and provide useful structure.

AI can:

-   Extract activities
-   Estimate time
-   Identify explicit events
-   Suggest tags
-   Summarize
-   Identify wins
-   Identify struggles
-   Identify learning
-   Suggest reflection questions
-   Generate reports
-   Detect recurring themes
-   Connect entries with projects/goals
-   Help search historical entries

AI must not:

-   Rewrite the original journal
-   Pretend uncertain information is factual
-   Diagnose mental-health conditions
-   Make medical conclusions
-   Make strong causal claims from limited journal data
-   Decide that an activity was objectively "wasted"
-   Invent events
-   Invent people
-   Invent accomplishments
-   Invent emotions
-   Pretend to know the user's intention when it was not stated

When AI is uncertain, it must say so through confidence metadata or mark
the value as estimated.

------------------------------------------------------------------------

# 4. Product Identity

The long-term identity should be:

> **A private record of what I built, learned, experienced, felt, and
> thought about.**

This is intentionally different from:

-   A task manager
-   A habit tracker
-   A time tracker
-   A mood tracker
-   A traditional diary
-   A productivity scoring system

It combines aspects of all of these, but the **journal remains the
center of the product**.

The system should encourage:

> **Record → Reflect → Understand → Improve**

rather than:

> **Record → Score yourself → Judge yourself**

------------------------------------------------------------------------

# 5. User Journey

## 5.1 Nightly Check-In

``` text
                 ┌───────────────────────────────┐
                 │       Nightly Check-In        │
                 └───────────────────────────────┘
                               │
                               ▼
                    Choose writing mode
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
     Messy Brain Dump                    Timeline Mode
       (Default)                         (Optional)
              │                                 │
              ▼                                 │
       Save raw entry                           │
              │                                 │
              ▼                                 │
       Optional AI analysis                     │
              │                                 │
              ▼                                 │
     Review extracted data ◄────────────────────┘
              │
              ▼
       Edit AI-derived values
              │
              ▼
        Save daily entry
              │
              ▼
       Optional reflection
              │
              ▼
      Daily journal complete
```

------------------------------------------------------------------------

# 6. Mode A --- Messy Brain Dump

This is the **default and recommended mode**.

The user should be able to open `/diary` and immediately see a large,
distraction-free text area.

Example:

> "Woke up around 9. Office at 12. Most of the day worked on React
> dashboard. Around 4 PM got stuck on API thing. Took a break and
> watched YouTube shorts for maybe 1 hour. Later fixed it. Python padha
> for 45 mins. Had dinner with family. Overall day was okay but I feel I
> could have used the evening better."

The user should be able to save this without filling out any additional
fields.

AI analysis should be optional.

------------------------------------------------------------------------

# 7. Mode B --- Hour-by-Hour Timeline

Timeline mode is optional and should be used when the user wants
detailed time auditing.

Example:

``` text
09:00 - 10:00   Morning / Personal
10:00 - 11:00   Travel
12:00 - 14:00   Work
14:00 - 15:00   Lunch
15:00 - 18:00   Deep Work
18:00 - 18:45   Unplanned / Phone
19:00 - 21:00   Work
22:00 - 22:45   Python Learning
23:00 - 23:30   Family
```

The system should not force users to use this mode every day.

------------------------------------------------------------------------

# 8. V1 Zero-Friction Requirement

The most important UX requirement:

> A tired user should be able to record their entire day in
> approximately 3--5 minutes.

The minimum flow should be:

``` text
Open Diary
   ↓
Write
   ↓
Save
   ↓
Done
```

AI, tags, timeline, mood, and analytics must never block saving the
original journal entry.

------------------------------------------------------------------------

# 9. User-Stated Data vs AI-Inferred Data

This distinction is mandatory.

Every structured field should conceptually belong to one of these
categories:

## Explicit

The user directly stated it.

Example:

> "I worked for 7 hours."

``` text
work_hours = 7
confidence = high
source = explicit
```

## Estimated

The user gave an approximate value.

Example:

> "I worked around 6-7 hours."

``` text
work_hours = 6.5
confidence = medium
source = estimated
```

## Inferred

AI derived something that was not directly stated.

Example:

> "The day felt heavy and I struggled to focus."

AI may suggest:

``` text
mood = frustrated
confidence = medium
source = inferred
```

The UI should visually distinguish these.

------------------------------------------------------------------------

# 10. AI Confidence Model

AI-derived values should support:

``` text
high
medium
low
```

Example:

``` text
💼 Work
7 hours
Explicit · High confidence

📚 Learning
~1 hour
Estimated · Medium confidence

🙂 Mood
Positive
Inferred · Medium confidence
```

The user must be able to edit any AI-generated value.

------------------------------------------------------------------------

# 11. Time Classification

The system should avoid treating every non-work activity as wasted.

Recommended categories:

-   Work
-   Learning
-   Project Building
-   Family
-   Social
-   Health
-   Travel
-   Personal
-   Entertainment
-   Rest
-   Unplanned
-   Other

A separate optional concept may be:

### User-identified unproductive time

This allows the user to decide whether an activity felt wasteful.

For example:

> Watching a movie for two hours

should normally be:

``` text
Entertainment · 2h
```

not automatically:

``` text
Wasted · 2h
```

------------------------------------------------------------------------

# 12. Time Audit

The system can calculate:

``` text
Total recorded time
Work
Learning
Project building
Personal
Family
Entertainment
Rest
Unplanned
```

Example:

``` text
Today's Time

Work             7h 20m
Learning         1h 00m
Family           1h 10m
Entertainment    1h 30m
Unplanned        0h 50m
```

The system should avoid judging the user based solely on these numbers.

------------------------------------------------------------------------

# 13. Events

Events should be a first-class concept.

Possible event types:

-   Work
-   Career
-   Family
-   Friends
-   Personal
-   Education
-   Project
-   Achievement
-   Bad news
-   Good news
-   Travel
-   Social
-   Other

Example:

``` json
{
  "type": "family",
  "description": "Had dinner with family",
  "importance": "normal",
  "source": "explicit"
}
```

Important events may later become memory candidates.

------------------------------------------------------------------------

# 14. People

If the user explicitly mentions people, AI may identify them as
entities.

Example:

> "Had a discussion with my manager."

AI may extract:

``` text
Person:
Manager

Context:
Work

Event:
Discussion
```

The system should not infer identities that were not provided.

The user should be able to remove or correct extracted people.

------------------------------------------------------------------------

# 15. Projects

Projects should eventually become reusable entities.

Examples:

-   Private Academy
-   SmartTools Hub
-   Portfolio
-   Diary System
-   Personal SaaS
-   Work Project

If the user repeatedly mentions a project, the journal can associate
entries with it.

Example:

``` text
Project: Private Academy

Oct 1
Fixed Supabase authentication

Sep 28
Worked on admin panel

Sep 24
Updated SEO

Total journal mentions: 37
```

This creates a useful connection between the journal and the user's
technical history.

------------------------------------------------------------------------

# 16. Goals

The system may support optional long-term goals.

Example:

``` text
🎯 Improve TypeScript
🎯 Learn Python
🎯 Build AI project
🎯 Improve career
🎯 Build portfolio
```

Journal entries can optionally be connected to goals.

Do not automatically generate arbitrary percentage completion.

Goal progress should be:

-   manually defined, or
-   based on explicit milestones.

------------------------------------------------------------------------

# 17. Memories

Not every journal entry should become a long-term memory.

AI may identify potential memories:

``` text
⭐ Potential Memory

"You deployed your first Python backend today."
```

The user decides:

``` text
[Save as Memory]
[Ignore]
```

Memory categories:

-   Career
-   Education
-   Projects
-   Family
-   Friends
-   Travel
-   Personal
-   Achievements
-   Important Life Events
-   Other

The memory should always retain a link back to the original journal
entry.

------------------------------------------------------------------------

# 18. "On This Day"

Add an historical memory feature.

Example:

``` text
October 1, 2027

📅 One Year Ago Today

October 1, 2026

You wrote:

"Today I finally fixed the Supabase auth issue..."
```

The user should be able to open the original entry.

This feature should prioritize original writing rather than AI
summaries.

------------------------------------------------------------------------

# 19. Daily Mood & Energy

Mood tracking is optional.

Suggested mood values:

-   Ecstatic
-   Happy
-   Calm
-   Neutral
-   Tired
-   Anxious
-   Frustrated
-   Down

Mood score:

``` text
1–10
```

Energy:

``` text
High
Medium
Low
Burned Out
```

Important:

These are journal reflections, not medical or psychological diagnoses.

AI must not diagnose the user.

------------------------------------------------------------------------

# 20. Reflection

After saving the entry, AI may optionally ask one or two useful
reflection questions.

Example:

> You mentioned being frustrated with the API integration. What
> specifically made it difficult?

Then:

> What could make tomorrow's attempt easier?

The goal is reflection, not motivational speeches.

The user may skip reflection entirely.

------------------------------------------------------------------------

# 21. Daily AI Analysis

The AI extraction schema should include:

``` typescript
export interface ParsedDailyDiaryAI {
  work_hours: number;
  work_hours_confidence: "high" | "medium" | "low";

  learning_hours: number;
  learning_hours_confidence: "high" | "medium" | "low";

  wasted_hours: number;
  wasted_hours_confidence: "high" | "medium" | "low";

  wasted_reasons: string[];

  time_categories: {
    category: string;
    hours: number;
    confidence: "high" | "medium" | "low";
  }[];

  mood:
    | "ecstatic"
    | "happy"
    | "calm"
    | "neutral"
    | "tired"
    | "anxious"
    | "frustrated"
    | "down";

  mood_score: number;
  mood_confidence: "high" | "medium" | "low";

  energy_level: "high" | "medium" | "low" | "burned_out";
  energy_confidence: "high" | "medium" | "low";

  wins_and_good_news: string[];
  struggles_and_bad_news: string[];

  events: {
    type: string;
    description: string;
    importance: "low" | "normal" | "high";
  }[];

  projects_mentioned: string[];
  people_mentioned: string[];

  learnings_and_reflections: string;

  tomorrow_priority: string | null;

  suggested_tags: string[];

  potential_memories: string[];

  summary: string;

  reflection_question: string | null;

  ai_coach_feedback: string;
}
```

------------------------------------------------------------------------

# 22. AI Prompt Rules

The AI system prompt must enforce:

1.  Never modify the original journal.
2.  Never invent information.
3.  Distinguish explicit facts from estimates and inferences.
4.  Use confidence values.
5.  Understand English, Hindi, Marathi, Hinglish, Romanized Marathi,
    slang, and typos.
6.  Preserve the meaning of informal language.
7.  Never diagnose health or mental-health conditions.
8.  Never make strong causal claims from diary data.
9.  Do not judge entertainment as wasted time automatically.
10. Do not fabricate names, events, projects, or accomplishments.
11. Return valid structured JSON.
12. Use `null` when information is unavailable.
13. Keep summaries concise.
14. Keep feedback practical and non-judgmental.

------------------------------------------------------------------------

# 23. AI "Coach" Rules

The coach should not behave like a motivational influencer.

Avoid:

> "You are amazing! Keep pushing! Tomorrow you will crush it! 🔥"

Prefer:

> "You completed the difficult API integration despite losing focus
> after lunch. If the same issue happens tomorrow, consider starting the
> task before opening social media."

The feedback should be:

-   Specific
-   Evidence-based
-   Short
-   Non-judgmental
-   Actionable

------------------------------------------------------------------------

# 24. Search

Traditional search should exist before AI search.

Search across:

-   Raw journal content
-   Tags
-   Projects
-   Events
-   People
-   Memories
-   Dates

Example:

``` text
🔍 Search my journal...

"Python"
```

Results:

``` text
March 12 — Started learning Python
April 02 — Built Flask API
May 17 — Fixed Python deployment issue
```

------------------------------------------------------------------------

# 25. Ask My Journal

This should be a later feature.

Example questions:

> When did I start learning Python?

> What projects was I working on in March?

> What did I accomplish this year?

> What problems kept appearing in my work?

> What did I write about Private Academy?

> What were my biggest achievements in 2026?

The system should retrieve relevant journal entries first and then ask
the LLM to answer from those records.

It must not answer from general assumptions.

If insufficient journal evidence exists:

> "I couldn't find enough information in your journal to answer that
> confidently."

------------------------------------------------------------------------

# 26. Weekly Reports

Weekly AI reports should include:

### Time Summary

``` text
Work
Learning
Projects
Personal
Entertainment
Unplanned
```

### Technical Progress

Projects and technologies mentioned.

### Wins

Explicit accomplishments.

### Challenges

Repeated problems.

### Lessons

Important learnings.

### Themes

Topics repeatedly appearing during the week.

### Reflection

One or two useful observations.

Avoid unsupported psychological or causal conclusions.

------------------------------------------------------------------------

# 27. Monthly Reports

Monthly report:

``` text
October 2026

Entries:
24

Work:
172h

Learning:
28h

Project Building:
21h

Entertainment:
31h

Unplanned:
14h
```

Then:

-   Major achievements
-   Projects
-   Technologies
-   Important events
-   Memories
-   Recurring themes
-   Lessons
-   Challenges
-   Goal activity
-   Selected original quotes
-   Month-over-month descriptive changes

------------------------------------------------------------------------

# 28. Yearly Review

At the end of the year:

``` text
MY 2026

Journal Entries: 287

Major Projects
- ...
- ...

Technologies
- React
- TypeScript
- Python

Major Memories
- ...
- ...

Achievements
- ...

Important Events
- ...

Things I Learned
- ...

Things I Repeatedly Thought About
- ...

Year in Numbers
- ...
```

The yearly review should preserve a human feeling rather than becoming
only a statistics dashboard.

------------------------------------------------------------------------

# 29. UI / UX

The interface should maintain the existing portfolio's visual language:

-   Dark aesthetic
-   Subtle borders
-   Clean typography
-   Poppins where consistent with the portfolio
-   Framer Motion transitions
-   Responsive design
-   Desktop and mobile support

The diary should feel calmer and more private than the public portfolio.

------------------------------------------------------------------------

# 30. Main Dashboard

Suggested structure:

``` text
┌───────────────────────────────────────────────────────────────┐
│ 🔒 Private Journal                         Oct 1, 2026       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Today's Overview                                              │
│                                                               │
│ Work       7h 20m     Learning    1h 00m                     │
│ Mood       8/10       Energy      Medium                     │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ 📝 What happened today?                                       │
│                                                               │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Write anything...                                        │ │
│ │                                                           │ │
│ │                                                           │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Save Only]                     [✨ Analyze with AI]           │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ AI Insights                                                   │
│                                                               │
│ 💼 Work: ~7h · High confidence                               │
│ 📚 Learning: ~1h · Medium confidence                         │
│ 🙂 Mood: Positive · Medium confidence                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 31. Navigation

Recommended private navigation:

``` text
Diary
├── Today
├── Calendar
├── Timeline
├── Search
├── Insights
├── Reports
├── Memories
├── Projects
└── Ask My Journal
```

Some sections can remain hidden until V2/V3.

------------------------------------------------------------------------

# 32. History View --- "Your Words First"

When opening an old day:

### Primary

The exact original journal entry.

### Secondary

AI-derived information:

-   Summary
-   Time
-   Mood
-   Events
-   Projects
-   Tags
-   Memories
-   Reflection
-   AI feedback

The user's words must remain the visual hero.

------------------------------------------------------------------------

# 33. Calendar Heatmap

The heatmap should show journal consistency and optionally day type.

Avoid making colors represent a simplistic "good person / bad person"
score.

Possible visual modes:

``` text
Entry consistency
Mood
Day type
Activity
```

The user can switch the metric.

------------------------------------------------------------------------

# 34. Database Design

## `daily_logs`

Core fields:

``` sql
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  date DATE NOT NULL,

  -- Immutable user source
  raw_content TEXT NOT NULL,

  -- Time audit
  work_hours NUMERIC(5,2) DEFAULT 0,
  learning_hours NUMERIC(5,2) DEFAULT 0,
  project_hours NUMERIC(5,2) DEFAULT 0,
  unplanned_hours NUMERIC(5,2) DEFAULT 0,

  -- Mood / energy
  mood VARCHAR(30),
  mood_score INT CHECK (mood_score BETWEEN 1 AND 10),
  energy_level VARCHAR(20),

  -- Reflection
  learnings_and_reflections TEXT,
  tomorrow_priority TEXT,

  -- AI-derived content
  ai_summary TEXT,
  ai_coach_feedback TEXT,
  ai_analysis_version VARCHAR(30),
  ai_analyzed_at TIMESTAMPTZ,

  -- Organization
  tags TEXT[] DEFAULT '{}',
  is_starred BOOLEAN DEFAULT FALSE,
  memory_candidate BOOLEAN DEFAULT FALSE,

  -- Optional timeline
  hourly_blocks JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_daily_log
    UNIQUE (user_id, date)
);
```

------------------------------------------------------------------------

# 35. Explicit vs AI Metadata

For important AI fields, the implementation should eventually support
metadata such as:

``` json
{
  "value": 7,
  "source": "explicit",
  "confidence": "high"
}
```

or:

``` json
{
  "value": 6.5,
  "source": "estimated",
  "confidence": "medium"
}
```

This can initially be represented inside an AI analysis JSON object
rather than adding many columns.

------------------------------------------------------------------------

# 36. Future `time_blocks` Table

V1 may keep timeline blocks in JSONB.

If detailed analytics are required later, migrate to:

``` text
time_blocks

id
daily_log_id
start_time
end_time
category
description
source
confidence
created_at
```

This allows queries such as:

> How much time did I spend learning Python in September?

------------------------------------------------------------------------

# 37. Future `memories` Table

Suggested structure:

``` text
memories

id
user_id
daily_log_id
title
description
category
importance
created_at
```

Every memory should reference the journal entry from which it
originated.

------------------------------------------------------------------------

# 38. Future `projects` Table

``` text
projects

id
user_id
name
description
status
created_at
updated_at
```

A linking table can associate journal entries with projects.

------------------------------------------------------------------------

# 39. RLS / Privacy

Every private table must use Row Level Security.

Example:

``` sql
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only select their own daily logs"
ON public.daily_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own daily logs"
ON public.daily_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own daily logs"
ON public.daily_logs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own daily logs"
ON public.daily_logs
FOR DELETE
USING (auth.uid() = user_id);
```

All future journal-related tables must have equivalent user isolation.

------------------------------------------------------------------------

# 40. Security Principles

The system should follow:

1.  Authentication required.
2.  RLS enforced at database level.
3.  Never rely only on frontend route guards.
4.  Never expose service-role keys in frontend code.
5.  AI API keys must remain server-side.
6.  `/diary` must not be included in the public sitemap.
7.  Public portfolio pages must never expose private journal data.
8.  Do not log raw journal contents unnecessarily.
9.  Provide a way to permanently delete journal data.
10. AI processing should be optional.
11. Clearly communicate when journal content is sent to an external AI
    provider.
12. Verify the current provider's privacy/data-retention terms before
    making specific privacy claims.

------------------------------------------------------------------------

# 41. AI Privacy Modes

The UI should provide:

### Save Only

``` text
Your entry is saved without AI processing.
```

### Save + AI Analysis

``` text
Your entry will be sent to the configured AI provider
for structured analysis.
```

This gives the user control.

------------------------------------------------------------------------

# 42. Important Privacy Language

Avoid absolute claims such as:

> "100% encrypted"

unless the complete infrastructure has been verified.

Preferred wording:

> **Private by default, protected by authentication, database-level Row
> Level Security, and encrypted network communication.**

Similarly, avoid claiming a provider has zero data retention unless the
exact current API/provider policy has been verified.

------------------------------------------------------------------------

# 43. AI Performance

Do not hard-code promises such as:

> 200ms 200--400ms

AI latency depends on:

-   Network
-   Provider
-   Model
-   Prompt size
-   Output size
-   Load
-   Retries

UX should instead show:

``` text
Analyzing...
```

and provide a graceful error/retry state.

------------------------------------------------------------------------

# 44. Offline / Draft Support

The user should never lose an entry because of:

-   Network failure
-   Browser refresh
-   AI failure
-   Supabase timeout

Recommended behavior:

``` text
User typing
   ↓
Local draft
   ↓
Save
   ↓
Supabase
```

If the network fails:

> "Saved locally. We'll sync when you're back online."

This is especially important for a diary.

------------------------------------------------------------------------

# 45. Autosave

The editor should optionally autosave drafts locally.

Autosave should never overwrite the permanent raw journal entry until
the user explicitly saves it.

Suggested states:

``` text
Draft
Saved locally
Saving...
Saved
Sync failed
```

------------------------------------------------------------------------

# 46. Error Handling

If AI fails:

``` text
Your journal is safe.

AI analysis couldn't be completed.
You can retry later.
```

The raw journal must still save.

If Supabase fails:

``` text
Your entry couldn't sync.
It is stored as a local draft.
```

Never discard the user's writing.

------------------------------------------------------------------------

# 47. Accessibility

Support:

-   Keyboard navigation
-   Focus states
-   Screen readers
-   Proper labels
-   Reduced motion
-   Sufficient contrast
-   Mobile keyboard behavior
-   Large touch targets

Diary writing should be comfortable for long text.

------------------------------------------------------------------------

# 48. Public vs Private Journal

The default should be:

> **100% private journal entries.**

If a future public journal is added, it should be a separate deliberate
publishing action.

For example:

``` text
Private Entry
     ↓
[Publish as Public Note]
     ↓
Public Journal / Blog
```

Never automatically expose private entries.

A public entry should be a separate copy or explicitly published
representation.

------------------------------------------------------------------------

# 49. Public Journal Possibility

Optional future feature:

### `/journal`

Only entries specifically marked public.

Possible content:

-   Developer learnings
-   Project progress
-   Technical reflections
-   Career lessons
-   Personal growth reflections that the user intentionally chooses to
    share

Sensitive/private material should remain in `/diary`.

------------------------------------------------------------------------

# 50. "Life Archive" Concept

The long-term architecture should support:

``` text
Daily Entries
     ↓
Events
     ↓
Projects
     ↓
Goals
     ↓
Memories
     ↓
Insights
```

This turns the journal into a personal historical archive.

------------------------------------------------------------------------

# 51. AI Search Architecture --- Future

For "Ask My Journal":

``` text
Question
   ↓
Search / Retrieval
   ↓
Relevant journal entries
   ↓
Relevant memories
   ↓
Relevant projects
   ↓
LLM
   ↓
Answer + source dates
```

The answer should show references such as:

``` text
Based on:
• March 12, 2026
• April 2, 2026
• May 17, 2026
```

The user should be able to open those entries.

------------------------------------------------------------------------

# 52. Avoid Hallucination in Ask My Journal

The AI should never answer:

> "You started Python in February."

unless relevant entries actually support that.

If evidence is missing:

> "I couldn't find enough information in your journal to determine
> this."

This is mandatory.

------------------------------------------------------------------------

# 53. Analytics Principles

Analytics should describe patterns rather than judge the user.

Good:

> "You recorded an average of 6.8 work hours on weekdays this month."

Good:

> "Most unplanned time was recorded between 2 PM and 5 PM."

Avoid:

> "You are wasting too much of your life."

Avoid:

> "Your productivity is poor."

The user should interpret their own data.

------------------------------------------------------------------------

# 54. Implementation Roadmap

## Phase 0 --- Product Foundation

Deliverables:

-   Final data model
-   Privacy model
-   User vs AI data distinction
-   AI confidence model
-   AI opt-in behavior
-   Deletion requirements
-   Error handling strategy

------------------------------------------------------------------------

## Phase 1 --- Basic Journal

Build only:

-   Supabase Auth
-   RLS
-   Create entry
-   Edit entry
-   Delete entry
-   Daily date
-   Calendar
-   History
-   Local draft/autosave

No AI required.

Goal:

> Use the diary every night for 2--4 weeks.

------------------------------------------------------------------------

## Phase 2 --- AI Extraction

Add:

-   AI parser
-   Structured JSON
-   Confidence values
-   Explicit/estimated/inferred source
-   Editable AI result
-   AI summary
-   AI tags
-   AI events

------------------------------------------------------------------------

## Phase 3 --- Timeline & Analytics

Add:

-   Time blocks
-   Time categories
-   Heatmap
-   Daily statistics
-   Weekly statistics
-   Search
-   Filters

------------------------------------------------------------------------

## Phase 4 --- Reflection

Add:

-   Reflection question
-   Daily debrief
-   Weekly report
-   Monthly report
-   Yearly report

------------------------------------------------------------------------

## Phase 5 --- Personal Knowledge

Add:

-   Memories
-   Projects
-   Goals
-   People
-   Events
-   On This Day

------------------------------------------------------------------------

## Phase 6 --- Ask My Journal

Add:

-   Semantic retrieval
-   Journal search
-   Relevant entry retrieval
-   LLM answer generation
-   Source/date references
-   Hallucination prevention

------------------------------------------------------------------------

# 55. V1 Scope --- Keep It Small

V1 should contain only:

``` text
Authentication
+
Daily journal
+
Calendar
+
History
+
Local draft
+
Optional AI extraction
+
Basic mood/time/tags
```

Do not initially build:

-   AI chatbot
-   Complex vector database
-   Advanced correlations
-   Dozens of dashboards
-   Complicated gamification
-   Automatic psychological interpretation

The user must first prove that they will actually use the diary.

------------------------------------------------------------------------

# 56. V2 Scope

Add:

-   Timeline
-   Search
-   Weekly reports
-   Monthly reports
-   Reflection questions
-   Events
-   Projects
-   Better analytics
-   On This Day

------------------------------------------------------------------------

# 57. V3 Scope

Add:

-   Memories
-   Goals
-   Ask My Journal
-   Semantic search
-   Personal knowledge graph
-   Yearly review
-   Optional public journal publishing

------------------------------------------------------------------------

# 58. Success Criteria

The system is successful if:

### Daily

The user can record a day in under 5 minutes.

### Weekly

The user can understand where their time went.

### Monthly

The user can understand what they worked on and learned.

### Yearly

The user can look back and understand how their life changed.

### Long term

The user can search their history and recover information they would
otherwise have forgotten.

------------------------------------------------------------------------

# 59. Product Principles

These principles should remain stable even when the implementation
changes.

### Principle 1

**Your words first.**

### Principle 2

**AI is an assistant, not the authority.**

### Principle 3

**Never invent.**

### Principle 4

**Never judge the user from the data.**

### Principle 5

**Privacy before convenience.**

### Principle 6

**Saving the journal must never depend on AI.**

### Principle 7

**Uncertainty must be visible.**

### Principle 8

**Important memories belong to the user, not the AI.**

### Principle 9

**The system should become more useful as historical data grows.**

### Principle 10

**Build the smallest version that the user will actually use every
night.**

------------------------------------------------------------------------

# 60. Final Vision

The final system should feel like this:

``` text
                    MY LIFE
                       │
                       ▼
               ┌──────────────┐
               │ Daily Journal│
               └──────┬───────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
      Time          Events        Thoughts
        │             │             │
        ▼             ▼             ▼
    Activities      People       Reflection
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                 AI STRUCTURE
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
    Insights       Reports        Patterns
       │              │              │
       └──────────────┼──────────────┘
                      ▼
                  MEMORIES
                      │
                      ▼
              PERSONAL HISTORY
                      │
                      ▼
               ASK MY JOURNAL
```

The most important outcome is not a productivity score.

It is this:

> **Years later, the user can open an old day and still see exactly what
> they wrote, understand what was happening in their life, remember what
> mattered, and learn from the patterns without losing the authenticity
> of the original moment.**

------------------------------------------------------------------------

# 61. Implementation Notes

The implementation should build on the existing project structure where
possible:

``` text
src/
├── pages/
│   └── Diary.tsx
│
├── components/
│   └── diary/
│       ├── DiaryAuthGuard.tsx
│       ├── BrainDumpInput.tsx
│       ├── ParsedResultEditor.tsx
│       ├── DiaryCalendar.tsx
│       ├── DiaryHeatmap.tsx
│       ├── TimelineDayView.tsx
│       ├── DailyReflection.tsx
│       ├── AiWeeklyReportModal.tsx
│       ├── MemoryCard.tsx
│       └── AskJournal.tsx
│
├── hooks/
│   └── useDiary.ts
│
├── lib/
│   ├── groq.ts
│   └── diary/
│       ├── parser.ts
│       ├── analytics.ts
│       └── search.ts
│
└── types/
    └── diary.ts
```

The exact structure can be adjusted to match the existing portfolio
codebase.

------------------------------------------------------------------------

# 62. Final Product Definition

**Name:** Personal Life Journal & Nightly Reflection System

**Primary purpose:**\
A private place to record an authentic daily life entry and gradually
turn those entries into useful historical information.

**Core input:**\
One free-form daily brain dump.

**Core source of truth:**\
The user's original unmodified text.

**Core AI role:**\
Extract, organize, summarize, and help reflect.

**Core database:**\
Supabase/PostgreSQL with strict RLS.

**Core privacy model:**\
Private by default; AI processing is optional and externally processed
content must be clearly disclosed.

**Core long-term value:**\
A searchable personal history containing work, learning, events,
memories, projects, reflections, and life experiences.

**Core philosophy:**

> **Write freely. Preserve honestly. Understand gradually.**