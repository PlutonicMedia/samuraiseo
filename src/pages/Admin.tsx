import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LogOut, Save, Mail, Trash2 } from "lucide-react";
import plutonicLogo from "@/assets/plutonic-logo.png";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [seoRequests, setSeoRequests] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    hubspot_calendar_url: "",
    facebook_pixel_id: "",
    notification_email: "",
    hubspot_url_kasper: "",
    hubspot_url_peter: "",
    hubspot_url_oliver: "",
    specialist_kasper_enabled: true,
    specialist_peter_enabled: true,
    specialist_oliver_enabled: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [subRes, seoRes, settingsRes] = await Promise.all([
      supabase.from("quiz_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("seo_text_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*").limit(1).single(),
    ]);
    if (subRes.error) {
      console.error("Quiz submissions fetch error:", subRes.error);
      toast.error("Could not load form entries. Check admin role permissions.");
    }
    if (seoRes.error) console.error("SEO requests fetch error:", seoRes.error);
    if (subRes.data) setSubmissions(subRes.data);
    if (seoRes.data) setSeoRequests(seoRes.data);
    if (settingsRes.data) {
      const d = settingsRes.data as any;
      setSettings({
        hubspot_calendar_url: d.hubspot_calendar_url || "",
        facebook_pixel_id: d.facebook_pixel_id || "",
        notification_email: d.notification_email || "",
        hubspot_url_kasper: d.hubspot_url_kasper || "",
        hubspot_url_peter: d.hubspot_url_peter || "",
        hubspot_url_oliver: d.hubspot_url_oliver || "",
        specialist_kasper_enabled: d.specialist_kasper_enabled ?? true,
        specialist_peter_enabled: d.specialist_peter_enabled ?? true,
        specialist_oliver_enabled: d.specialist_oliver_enabled ?? true,
      });
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ id: 1, ...settings } as any, { onConflict: "id" });
      if (error) throw error;
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    const { error } = await supabase.from("quiz_submissions").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete entry.");
      return;
    }
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Entry deleted.");
  };

  const handleDeleteSeoRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    const { error } = await supabase.from("seo_text_requests").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete request.");
      return;
    }
    setSeoRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success("Request deleted.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <a href="https://samurai.plutonic.dk/"><img src={plutonicLogo} alt="Samurai SEO" className="h-10 w-auto" /></a>
          <span className="font-sora text-lg font-bold text-primary">Admin</span>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </header>

      <main className="container max-w-6xl mx-auto py-8 px-4">
        <Tabs defaultValue="submissions">
          <TabsList className="mb-6">
            <TabsTrigger value="submissions">Form Entries ({submissions.length})</TabsTrigger>
            <TabsTrigger value="seo">No Requests ({seoRequests.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card>
              <CardContent className="pt-6 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Volume 2026</TableHead>
                      <TableHead>Min/Item</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>SEO Control</TableHead>
                      <TableHead>Hours Saved</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.phone}</TableCell>
                        <TableCell>{s.company}</TableCell>
                        <TableCell>{s.product_count}</TableCell>
                        <TableCell>{s.expected_volume}</TableCell>
                        <TableCell>{s.time_per_item}</TableCell>
                        <TableCell className="text-xs">{s.revenue_range}</TableCell>
                        <TableCell>{s.has_seo_control ? "Yes" : "No"}</TableCell>
                        <TableCell className="font-bold">{s.saved_hours}h</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSubmission(s.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {submissions.length === 0 && (
                      <TableRow><TableCell colSpan={12} className="text-center text-muted-foreground">No entries yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardContent className="pt-6 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Website URL</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seoRequests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <a href={r.website_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            {r.website_url}
                          </a>
                        </TableCell>
                        <TableCell>{r.email || "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSeoRequest(r.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {seoRequests.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No requests yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6 max-w-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sora">Site Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Facebook Pixel ID</label>
                    <Input
                      value={settings.facebook_pixel_id}
                      onChange={(e) => setSettings((s) => ({ ...s, facebook_pixel_id: e.target.value }))}
                      placeholder="123456789012345"
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sora">Specialist Calendar URLs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Kasper", urlKey: "hubspot_url_kasper" as const, enabledKey: "specialist_kasper_enabled" as const },
                    { label: "Peter", urlKey: "hubspot_url_peter" as const, enabledKey: "specialist_peter_enabled" as const },
                    { label: "Oliver", urlKey: "hubspot_url_oliver" as const, enabledKey: "specialist_oliver_enabled" as const },
                  ].map((spec) => (
                    <div key={spec.urlKey} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">{spec.label} — HubSpot Calendar URL</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{settings[spec.enabledKey] ? "Visible" : "Hidden"}</span>
                          <Switch
                            checked={settings[spec.enabledKey]}
                            onCheckedChange={(checked) => setSettings((s) => ({ ...s, [spec.enabledKey]: checked }))}
                          />
                        </div>
                      </div>
                      <Input
                        value={settings[spec.urlKey]}
                        onChange={(e) => setSettings((s) => ({ ...s, [spec.urlKey]: e.target.value }))}
                        placeholder={`https://meetings.hubspot.com/${spec.label.toLowerCase()}...`}
                        className="rounded-xl"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sora flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter an email address to receive a notification whenever a new quiz form or SEO text request is submitted.
                  </p>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Notification Email</label>
                    <Input
                      type="email"
                      value={settings.notification_email}
                      onChange={(e) => setSettings((s) => ({ ...s, notification_email: e.target.value }))}
                      placeholder="admin@plutonic.dk"
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={saveSettings} disabled={savingSettings} className="gap-2 rounded-full">
                <Save className="h-4 w-4" />
                {savingSettings ? "Saving..." : "Save All Settings"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
