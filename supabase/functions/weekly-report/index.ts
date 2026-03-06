import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase environment variables.")
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Execute weekly cron job logic
        console.log("cron [weekly-report]: Starting optimization report generation...")

        // 1. Fetch all active users
        const { data: users, error: userError } = await supabase
            .from("users")
            .select("id, email, first_name")

        if (userError) throw userError
        if (!users || users.length === 0) {
            return new Response(JSON.stringify({ message: "No users found." }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            })
        }

        // 2. Determine 7-day window
        const lastWeek = new Date()
        lastWeek.setDate(lastWeek.getDate() - 7)
        const cutoffIso = lastWeek.toISOString()

        let processedCount = 0
        let totalSavingsTracked = 0

        // 3. Process each user's weekly metrics
        for (const user of users) {
            const { data: analyses, error: analysisError } = await supabase
                .from("analyses")
                .select("original_cost, optimized_cost")
                .eq("user_id", user.id)
                .gte("created_at", cutoffIso)

            if (analysisError) {
                console.error(`Error fetching analyses for user ${user.id}:`, analysisError)
                continue
            }

            if (!analyses || analyses.length === 0) continue

            let userSavings = 0
            analyses.forEach(a => {
                userSavings += (a.original_cost - a.optimized_cost)
            })

            // Update aggregate savings history
            totalSavingsTracked += userSavings
            processedCount++

            // Mock sending email securely here via Resend/SendGrid API
            console.log(`[weekly-report] -> Delivered to ${user.email} (Saved: $${userSavings.toFixed(2)})`)

            // Log to compliance audit trace
            await supabase.from("audit_logs").insert({
                user_id: user.id,
                action: `Weekly optimization report generated automatically (Tracked Savings: $${userSavings.toFixed(2)})`,
                entity_type: "system",
                entity_id: "cron_weekly"
            })
        }

        return new Response(
            JSON.stringify({
                success: true,
                summary: \`Processed \${processedCount} active users. Tracked $totalSavingsTracked in savings.\`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )

  } catch (error) {
    console.error("Critical Weekly Report Engine Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})
