import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Mail, Github, Linkedin, Instagram, ExternalLink, Send, Loader2, Copy, Check, Clock } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const socialLinks = [
  { name: "GitHub", url: "https://github.com/karangholap154", icon: Github },
  { name: "LinkedIn", url: "https://linkedin.com/in/karangholap", icon: Linkedin },
  { name: "Instagram", url: "https://www.instagram.com/thekarangholap", icon: Instagram },
];

const otherLinks = [
  { name: "Peerlist", url: "https://peerlist.io/karangholap" },
  { name: "X (Twitter)", url: "https://x.com/TheKaranGholap" },
  { name: "LeetCode", url: "https://leetcode.com/u/karangholap/" },
  { name: "Behance", url: "https://www.behance.net/karangholap" },
  { name: "Product Hunt", url: "https://www.producthunt.com/@karangholap" },
  { name: "Medium", url: "https://medium.com/@karan_gholap" },
  { name: "Hashnode", url: "https://hashnode.com/@karangholap" },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  bot_check: z.string().optional(),
});

const Contact = () => {
  usePageMeta({
    title: "Contact",
    description:
      "Get in touch with Karan Gholap for software development opportunities, collaborations, and freelance projects.",
    path: "/contact",
  });

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await navigator.clipboard.writeText("karangholap@zohomail.in");
      setCopiedEmail(true);
      toast({
        title: "Email copied to clipboard!",
        description: "karangholap@zohomail.in",
      });
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy karangholap@zohomail.in manually.",
        variant: "destructive",
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      bot_check: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Honeypot check: If hidden field is filled, silently discard spam submission
    if (values.bot_check) {
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out! I've received your note and usually respond within 24 hours.",
      });
      form.reset();
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out! I've received your note and usually respond within 24 hours.",
      });

      form.reset();
    } catch (error: unknown) {
      console.error("Error submitting contact message:", error);
      toast({
        title: "Error sending message",
        description: "Something went wrong. Please try again or reach out directly via email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />
        
          <section className="py-8">
            <h1 className="text-2xl font-serif font-semibold mb-4">Contact</h1>
            <p className="text-muted-foreground mb-8">
              I'm always open to discussing new opportunities, collaborations, or just having a chat about tech. Feel free to reach out!
            </p>

            {/* Contact Form */}
            <div className="mb-10 p-6 bg-secondary/30 border border-border rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Send a Message</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bot_check"
                    render={({ field }) => (
                      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...field} />
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Project Discussion" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell me about your project, idea, or role..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full flex items-center gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                    <span>Usually responds within 24 hours</span>
                  </p>
                </form>
              </Form>
            </div>
            
            {/* Primary Contact Links */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Connect Directly</h2>
              <div className="space-y-3">
                {/* Email with 1-click Copy and Mailto */}
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail size={20} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Email</span>
                      <a
                        href="mailto:karangholap@zohomail.in"
                        className="text-foreground hover:underline font-medium text-sm truncate block"
                        title="Send email via mail client"
                      >
                        karangholap@zohomail.in
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyEmail}
                      className="h-8 w-8 border-border bg-background/50 hover:bg-background transition-colors"
                      title={copiedEmail ? "Copied to clipboard!" : "Copy email to clipboard"}
                      aria-label="Copy email to clipboard"
                    >
                      {copiedEmail ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </Button>
                    <a
                      href="mailto:karangholap@zohomail.in"
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      title="Open in mail client"
                      aria-label="Open in mail client"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
                  >
                    <link.icon size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="flex-1">{link.name}</span>
                    <ExternalLink size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Other Platforms */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Find Me Elsewhere</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {otherLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-sm group"
                  >
                    <span>{link.name}</span>
                    <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Location */}
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                📍 Based in Pune, India (UTC +5:30)
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Open to remote opportunities across different time zones.
              </p>
            </div>
          </section>
          
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact;
