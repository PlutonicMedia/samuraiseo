import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, record } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get notification email from settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("notification_email")
      .eq("id", 1)
      .single();

    const notificationEmail = settings?.notification_email;
    if (!notificationEmail) {
      return new Response(
        JSON.stringify({ message: "No notification email configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let htmlBody = "";

    if (type === "quiz_submission") {
      subject = `New Quiz Lead: ${record.name} (${record.company})`;
      htmlBody = `
        <h2>New Quiz Submission</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:4px 12px;font-weight:bold;">Name</td><td style="padding:4px 12px;">${record.name}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Email</td><td style="padding:4px 12px;">${record.email}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Phone</td><td style="padding:4px 12px;">${record.phone}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Company</td><td style="padding:4px 12px;">${record.company}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Products</td><td style="padding:4px 12px;">${record.product_count ?? "—"}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Volume/mo</td><td style="padding:4px 12px;">${record.expected_volume ?? "—"}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Min/item</td><td style="padding:4px 12px;">${record.time_per_item ?? "—"}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Revenue</td><td style="padding:4px 12px;">${record.revenue_range ?? "—"}</td></tr>
          <tr><td style="padding:4px 12px;font-weight:bold;">Hours Saved</td><td style="padding:4px 12px;">${record.saved_hours ?? "—"}h</td></tr>
        </table>
      `;
    } else if (type === "seo_request") {
      subject = `New SEO Text Request: ${record.website_url}`;
      htmlBody = `
        <h2>New SEO Text Request</h2>
        <p><strong>Website URL:</strong> ${record.website_url}</p>
        <p><strong>Email:</strong> ${record.email || "—"}</p>
      `;
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Samurai SEO <onboarding@resend.dev>",
        to: [notificationEmail],
        subject,
        html: htmlBody,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
