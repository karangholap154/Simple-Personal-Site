import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Lock, Mail, Briefcase, GraduationCap, Award, Trash2, Edit, Plus, 
  LogOut, CheckCircle, MessageSquare, PlusCircle, X, ExternalLink, RefreshCw, Upload, FileUp, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectItem } from "./Projects";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  duration: string;
  order: number;
}

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  highlights: string[];
  order: number;
}

interface CertificationItem {
  id: string;
  name: string;
  order: number;
}

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("messages");

  // Auth session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({
        title: "Logged in successfully!",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({
        title: "Authentication failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
    });
  };

  // Queries
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data as ProjectItem[];
    },
    enabled: !!session,
  });

  const { data: education, isLoading: loadingEdu } = useQuery({
    queryKey: ["admin-education"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { data: experience, isLoading: loadingExp } = useQuery({
    queryKey: ["admin-experience"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { data: certifications, isLoading: loadingCerts } = useQuery({
    queryKey: ["admin-certifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  // Mutations
  const updateMessageStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast({ title: "Message status updated." });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast({ title: "Message deleted." });
    },
  });

  // Project Crud States
  const [projectForm, setProjectForm] = useState<Partial<ProjectItem>>({
    title: "",
    description: "",
    role: "",
    outcomes: [],
    tech: [],
    link: "",
    type: "web",
    featured: false,
    order: 0,
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [outcomeInput, setOutcomeInput] = useState("");

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        role: projectForm.role,
        outcomes: projectForm.outcomes,
        tech: projectForm.tech,
        link: projectForm.link || null,
        type: projectForm.type,
        featured: projectForm.featured,
        order: Number(projectForm.order),
      };

      if (editingProjectId) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingProjectId);
        if (error) throw error;
        toast({ title: "Project updated successfully!" });
      } else {
        const { error } = await supabase
          .from("projects")
          .insert([payload]);
        if (error) throw error;
        toast({ title: "Project created successfully!" });
      }

      // Reset
      setProjectForm({
        title: "",
        description: "",
        role: "",
        outcomes: [],
        tech: [],
        link: "",
        type: "web",
        featured: false,
        order: 0,
      });
      setTechInput("");
      setOutcomeInput("");
      setEditingProjectId(null);
      setShowProjectForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to save project",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Project deleted." });
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ title: "Failed to delete project", description: errorMsg, variant: "destructive" });
    }
  };

  // Resume Manager CRUD
  const [eduForm, setEduForm] = useState({ degree: "", institution: "", duration: "", order: 0 });
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [showEduForm, setShowEduForm] = useState(false);

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEduId) {
        const { error } = await supabase.from("education").update(eduForm).eq("id", editingEduId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("education").insert([eduForm]);
        if (error) throw error;
      }
      setEduForm({ degree: "", institution: "", duration: "", order: 0 });
      setEditingEduId(null);
      setShowEduForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-education"] });
      queryClient.invalidateQueries({ queryKey: ["education"] });
      toast({ title: "Education entry saved." });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error saving education", description: errorMsg, variant: "destructive" });
    }
  };

  const handleDeleteEdu = async (id: string) => {
    if (!confirm("Delete this education entry?")) return;
    await supabase.from("education").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-education"] });
    queryClient.invalidateQueries({ queryKey: ["education"] });
  };

  const [expForm, setExpForm] = useState({ role: "", company: "", duration: "", highlights: [] as string[], order: 0 });
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [showExpForm, setShowExpForm] = useState(false);
  const [highlightInput, setHighlightInput] = useState("");

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpId) {
        const { error } = await supabase.from("experience").update(expForm).eq("id", editingExpId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("experience").insert([expForm]);
        if (error) throw error;
      }
      setExpForm({ role: "", company: "", duration: "", highlights: [], order: 0 });
      setEditingExpId(null);
      setShowExpForm(false);
      setHighlightInput("");
      queryClient.invalidateQueries({ queryKey: ["admin-experience"] });
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      toast({ title: "Experience entry saved." });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error saving experience", description: errorMsg, variant: "destructive" });
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!confirm("Delete this experience entry?")) return;
    await supabase.from("experience").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-experience"] });
    queryClient.invalidateQueries({ queryKey: ["experience"] });
  };

  const [certForm, setCertForm] = useState({ name: "", order: 0 });
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [showCertForm, setShowCertForm] = useState(false);

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCertId) {
        const { error } = await supabase.from("certifications").update(certForm).eq("id", editingCertId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("certifications").insert([certForm]);
        if (error) throw error;
      }
      setCertForm({ name: "", order: 0 });
      setEditingCertId(null);
      setShowCertForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast({ title: "Certification entry saved." });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error saving certification", description: errorMsg, variant: "destructive" });
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm("Delete this certification?")) return;
    await supabase.from("certifications").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
    queryClient.invalidateQueries({ queryKey: ["certifications"] });
  };

  // Resume PDF Direct File Uploader
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState<string>("/resume.pdf");

  useQuery({
    queryKey: ["admin-resume-pdf-url"],
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "resume_pdf_url")
          .maybeSingle();
        const val = data?.value || "/resume.pdf";
        setActivePdfUrl(val);
        return val;
      } catch {
        return "/resume.pdf";
      }
    },
  });

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdfFile) {
      toast({ title: "Please select a PDF file to upload", variant: "destructive" });
      return;
    }

    setUploadingPdf(true);
    try {
      // 1. Fetch and remove all previous resume files from 'resumes' bucket
      const { data: existingFiles } = await supabase.storage.from("resumes").list();
      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map((f) => f.name);
        await supabase.storage.from("resumes").remove(filesToRemove);
      }

      // 2. Upload the new resume PDF file
      const fileName = "Karan_Gholap_Resume.pdf";
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, selectedPdfFile, { upsert: true, contentType: "application/pdf" });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}. Make sure 'resumes' storage bucket is created in Supabase.`);
      }

      // 3. Obtain public URL with cache-busting timestamp
      const { data: publicUrlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      const finalUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const { error } = await supabase.from("site_settings").upsert({
        key: "resume_pdf_url",
        value: finalUrl,
      });
      if (error) throw error;

      setActivePdfUrl(finalUrl);
      setSelectedPdfFile(null);
      queryClient.invalidateQueries({ queryKey: ["admin-resume-pdf-url"] });
      queryClient.invalidateQueries({ queryKey: ["resume-pdf-url"] });
      toast({ title: "Resume updated! Old resume removed from storage." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Upload Failed", description: msg, variant: "destructive" });
    } finally {
      setUploadingPdf(false);
    }
  };

  // Render Login page if not signed in
  if (!session) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col justify-between">
          <div className="max-w-2xl mx-auto px-6 w-full flex-grow flex flex-col justify-center items-center py-20">
            <div className="w-full max-w-md bg-secondary/30 border border-border p-8 rounded-xl shadow-xl backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Lock className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold">Admin Dashboard Log In</h1>
                <p className="text-sm text-muted-foreground text-center">
                  Sign in to access your portfolio control panel.
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email Address</label>
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    placeholder="karan@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    autoComplete="username"
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Password</label>
                  <Input 
                    id="password"
                    name="password"
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    autoComplete="current-password"
                    required 
                  />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={authLoading}>
                  {authLoading ? "Authenticating..." : "Access Admin Panel"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div className="max-w-4xl mx-auto px-6 w-full py-8">
          <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span>⚙️</span> Portfolio Control Panel
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Signed in as: {session.user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-secondary/40 w-full justify-start border border-border">
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Messages
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Projects
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Resume Sections
              </TabsTrigger>
            </TabsList>

            {/* TAB: MESSAGES */}
            <TabsContent value="messages" className="space-y-4 outline-none">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" /> Submission Inbox
                </h2>
              </div>

              {loadingMessages ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <Skeleton key={n} className="h-28 w-full rounded-lg" />
                  ))}
                </div>
              ) : messages?.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg border-border">
                  <p className="text-muted-foreground text-sm">No messages received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages?.map((msg: ContactMessage) => (
                    <div key={msg.id} className="p-5 bg-secondary/30 border border-border rounded-lg space-y-3 relative group">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold text-sm flex items-center gap-2">
                            {msg.name}
                            <span className="text-xs font-normal text-muted-foreground">({msg.email})</span>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Subject: <span className="text-foreground font-medium">{msg.subject}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={msg.status}
                            onChange={(e) => updateMessageStatusMutation.mutate({ id: msg.id, status: e.target.value })}
                            className="bg-background text-foreground border border-border rounded px-2 py-1 text-xs outline-none"
                          >
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                          </select>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => {
                              if (confirm("Delete this message?")) deleteMessageMutation.mutate(msg.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm bg-background/40 p-3 rounded text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                      <div className="text-[10px] text-muted-foreground flex justify-between">
                        <span>Submitted on: {new Date(msg.created_at).toLocaleString()}</span>
                        <span className="capitalize font-semibold text-primary/80">Status: {msg.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB: PROJECTS */}
            <TabsContent value="projects" className="space-y-4 outline-none">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" /> Projects Portfolio
                </h2>
                {!showProjectForm && (
                  <Button size="sm" onClick={() => setShowProjectForm(true)} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Project
                  </Button>
                )}
              </div>

              {showProjectForm && (
                <form onSubmit={handleSaveProject} className="p-6 bg-secondary/20 border border-border rounded-lg space-y-4 relative">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowProjectForm(false);
                      setEditingProjectId(null);
                    }}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <h3 className="font-bold text-sm">{editingProjectId ? "Edit Project" : "New Project Details"}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title</label>
                      <Input 
                        placeholder="Project Name" 
                        value={projectForm.title || ""} 
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Role</label>
                      <Input 
                        placeholder="Developer, Founder, etc." 
                        value={projectForm.role || ""} 
                        onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
                    <Textarea 
                      placeholder="Brief overview..." 
                      value={projectForm.description || ""} 
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Type</label>
                      <select 
                        value={projectForm.type || "web"} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjectForm({ ...projectForm, type: e.target.value as "web" | "mobile" })}
                        className="bg-background text-foreground w-full border border-border rounded-md px-3 py-2 text-sm outline-none"
                      >
                        <option value="web">Web</option>
                        <option value="mobile">Mobile</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Order Position</label>
                      <Input 
                        type="number" 
                        value={projectForm.order ?? 0} 
                        onChange={(e) => setProjectForm({ ...projectForm, order: Number(e.target.value) })} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">URL Link</label>
                      <Input 
                        placeholder="https://example.com" 
                        value={projectForm.link || ""} 
                        onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })} 
                      />
                    </div>
                  </div>

                  {/* Add Tech Tags */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tech Stack (comma separated or enter to add)</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="React.js, Supabase, Tailwind" 
                        value={techInput} 
                        onChange={(e) => setTechInput(e.target.value)} 
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (!techInput.trim()) return;
                            const items = techInput.split(",").map(t => t.trim()).filter(Boolean);
                            setProjectForm({ ...projectForm, tech: [...(projectForm.tech || []), ...items] });
                            setTechInput("");
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => {
                          if (!techInput.trim()) return;
                          const items = techInput.split(",").map(t => t.trim()).filter(Boolean);
                          setProjectForm({ ...projectForm, tech: [...(projectForm.tech || []), ...items] });
                          setTechInput("");
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {projectForm.tech?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => setProjectForm({ ...projectForm, tech: projectForm.tech?.filter(t => t !== tag) })}
                            className="hover:text-destructive text-[10px]"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Add Outcomes */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Project Outcomes (bullet points)</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Delivered 40% performance gain..." 
                        value={outcomeInput} 
                        onChange={(e) => setOutcomeInput(e.target.value)} 
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (!outcomeInput.trim()) return;
                            setProjectForm({ ...projectForm, outcomes: [...(projectForm.outcomes || []), outcomeInput.trim()] });
                            setOutcomeInput("");
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => {
                          if (!outcomeInput.trim()) return;
                          setProjectForm({ ...projectForm, outcomes: [...(projectForm.outcomes || []), outcomeInput.trim()] });
                          setOutcomeInput("");
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-xs text-muted-foreground">
                      {projectForm.outcomes?.map((outcome, idx) => (
                        <li key={idx} className="flex justify-between items-center gap-2 p-1.5 bg-background/50 rounded border border-border">
                          <span>{outcome}</span>
                          <button 
                            type="button" 
                            onClick={() => setProjectForm({ ...projectForm, outcomes: projectForm.outcomes?.filter((_, i) => i !== idx) })}
                            className="text-destructive hover:text-destructive/80 font-bold"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input 
                      type="checkbox" 
                      id="featured" 
                      checked={projectForm.featured ?? false}
                      onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                      className="rounded border-border bg-background h-4 w-4"
                    />
                    <label htmlFor="featured" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                      Featured Project (Appears on Home preview)
                    </label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProjectId(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProjectId ? "Update Project" : "Create Project"}
                    </Button>
                  </div>
                </form>
              )}

              {loadingProjects ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden bg-secondary/10">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-muted-foreground text-xs font-semibold">
                        <th className="p-3">Pos</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Featured</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {projects?.map((proj) => (
                        <tr key={proj.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="p-3 font-mono text-xs">{proj.order}</td>
                          <td className="p-3 font-semibold">{proj.title}</td>
                          <td className="p-3 capitalize">{proj.type}</td>
                          <td className="p-3">{proj.featured ? "⭐️ Yes" : "No"}</td>
                          <td className="p-3 text-right flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setProjectForm(proj);
                                setEditingProjectId(proj.id!);
                                setShowProjectForm(true);
                              }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleDeleteProject(proj.id!)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* TAB: RESUME */}
            <TabsContent value="resume" className="space-y-6 outline-none">
              {/* PDF Resume Upload Only */}
              <form onSubmit={handleUploadPdf} className="p-5 bg-secondary/30 border border-border rounded-lg space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <FileUp className="h-4 w-4 text-primary" /> Upload Resume PDF
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select a new PDF file from your computer to update your downloadable resume.
                    </p>
                  </div>
                  <Button type="submit" size="sm" disabled={uploadingPdf || !selectedPdfFile} className="flex items-center gap-2">
                    {uploadingPdf ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload PDF Document
                      </>
                    )}
                  </Button>
                </div>

                <div className="pt-1">
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Choose PDF Document (.pdf)</label>
                  <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setSelectedPdfFile(e.target.files?.[0] || null)}
                    className="bg-background cursor-pointer text-xs"
                  />
                  {selectedPdfFile && (
                    <p className="text-[11px] text-primary font-medium mt-1">Selected file: {selectedPdfFile.name}</p>
                  )}
                </div>

                {activePdfUrl && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-border/50">
                    <span>Active Published Resume:</span>
                    <a href={activePdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono truncate max-w-md">
                      {activePdfUrl}
                    </a>
                  </div>
                )}
              </form>

              <Tabs defaultValue="edu" className="space-y-4">
                <TabsList className="bg-secondary/20 justify-start border border-border/80">
                  <TabsTrigger value="edu" className="flex items-center gap-1 text-xs">
                    <GraduationCap className="h-3.5 w-3.5" /> Education
                  </TabsTrigger>
                  <TabsTrigger value="exp" className="flex items-center gap-1 text-xs">
                    <Briefcase className="h-3.5 w-3.5" /> Experience
                  </TabsTrigger>
                  <TabsTrigger value="certs" className="flex items-center gap-1 text-xs">
                    <Award className="h-3.5 w-3.5" /> Certifications
                  </TabsTrigger>
                </TabsList>

                {/* SUB-TAB: EDUCATION */}
                <TabsContent value="edu" className="space-y-4 outline-none">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Manage Education History</h3>
                    {!showEduForm && (
                      <Button size="xs" className="h-8 text-xs flex items-center gap-1" onClick={() => setShowEduForm(true)}>
                        <PlusCircle className="h-3.5 w-3.5" /> Add Entry
                      </Button>
                    )}
                  </div>

                  {showEduForm && (
                    <form onSubmit={handleSaveEdu} className="p-4 bg-secondary/20 border border-border rounded-lg space-y-3 relative">
                      <button type="button" onClick={() => { setShowEduForm(false); setEditingEduId(null); }} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Degree</label>
                          <Input value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} required />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Institution</label>
                          <Input value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Duration (years)</label>
                          <Input placeholder="2022 - 2025" value={eduForm.duration} onChange={(e) => setEduForm({ ...eduForm, duration: e.target.value })} required />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Order Index</label>
                          <Input type="number" value={eduForm.order} onChange={(e) => setEduForm({ ...eduForm, order: Number(e.target.value) })} required />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => { setShowEduForm(false); setEditingEduId(null); }}>Cancel</Button>
                        <Button type="submit" size="sm">{editingEduId ? "Update" : "Add"}</Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {education?.map((item: EducationItem) => (
                      <div key={item.id} className="p-3 bg-secondary/40 border border-border rounded-lg flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold">{item.degree}</p>
                          <p className="text-xs text-muted-foreground">{item.institution} ({item.duration})</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { setEduForm(item); setEditingEduId(item.id); setShowEduForm(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteEdu(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* SUB-TAB: EXPERIENCE */}
                <TabsContent value="exp" className="space-y-4 outline-none">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Manage Experience</h3>
                    {!showExpForm && (
                      <Button size="xs" className="h-8 text-xs flex items-center gap-1" onClick={() => setShowExpForm(true)}>
                        <PlusCircle className="h-3.5 w-3.5" /> Add Job
                      </Button>
                    )}
                  </div>

                  {showExpForm && (
                    <form onSubmit={handleSaveExp} className="p-4 bg-secondary/20 border border-border rounded-lg space-y-3 relative">
                      <button type="button" onClick={() => { setShowExpForm(false); setEditingExpId(null); }} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Role / Job Title</label>
                          <Input value={expForm.role} onChange={(e) => setExpForm({ ...expForm, role: e.target.value })} required />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Company Details</label>
                          <Input placeholder="Company · Full-Time" value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Duration</label>
                          <Input placeholder="Dec 2025 - Present" value={expForm.duration} onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })} required />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Order Position</label>
                          <Input type="number" value={expForm.order} onChange={(e) => setExpForm({ ...expForm, order: Number(e.target.value) })} required />
                        </div>
                      </div>

                      {/* Highlights */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Highlights (Bullet Points)</label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Worked on backend integration..." 
                            value={highlightInput} 
                            onChange={(e) => setHighlightInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (!highlightInput.trim()) return;
                                setExpForm({ ...expForm, highlights: [...expForm.highlights, highlightInput.trim()] });
                                setHighlightInput("");
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              if (!highlightInput.trim()) return;
                              setExpForm({ ...expForm, highlights: [...expForm.highlights, highlightInput.trim()] });
                              setHighlightInput("");
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {expForm.highlights.map((h, i) => (
                            <li key={i} className="flex justify-between items-center gap-2 bg-background p-1.5 rounded border border-border">
                              <span>{h}</span>
                              <button type="button" className="text-destructive font-bold" onClick={() => setExpForm({ ...expForm, highlights: expForm.highlights.filter((_, idx) => idx !== i) })}>Remove</button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => { setShowExpForm(false); setEditingExpId(null); }}>Cancel</Button>
                        <Button type="submit" size="sm">{editingExpId ? "Update" : "Add"}</Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {experience?.map((item: ExperienceItem) => (
                      <div key={item.id} className="p-3 bg-secondary/40 border border-border rounded-lg flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold">{item.role}</p>
                          <p className="text-xs text-muted-foreground">{item.company} ({item.duration})</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { setExpForm(item); setEditingExpId(item.id); setShowExpForm(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteExp(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* SUB-TAB: CERTIFICATIONS */}
                <TabsContent value="certs" className="space-y-4 outline-none">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Manage Certifications</h3>
                    {!showCertForm && (
                      <Button size="xs" className="h-8 text-xs flex items-center gap-1" onClick={() => setShowCertForm(true)}>
                        <PlusCircle className="h-3.5 w-3.5" /> Add Certificate
                      </Button>
                    )}
                  </div>

                  {showCertForm && (
                    <form onSubmit={handleSaveCert} className="p-4 bg-secondary/20 border border-border rounded-lg space-y-3 relative">
                      <button type="button" onClick={() => { setShowCertForm(false); setEditingCertId(null); }} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Certification Name</label>
                          <Input value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} required />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Order Index</label>
                          <Input type="number" value={certForm.order} onChange={(e) => setCertForm({ ...certForm, order: Number(e.target.value) })} required />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => { setShowCertForm(false); setEditingCertId(null); }}>Cancel</Button>
                        <Button type="submit" size="sm">{editingCertId ? "Update" : "Add"}</Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {certifications?.map((item: CertificationItem) => (
                      <div key={item.id} className="p-3 bg-secondary/40 border border-border rounded-lg flex justify-between items-center text-sm">
                        <p className="font-semibold">{item.name}</p>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { setCertForm(item); setEditingCertId(item.id); setShowCertForm(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteCert(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Admin;
