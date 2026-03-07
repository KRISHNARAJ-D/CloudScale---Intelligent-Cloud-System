import { serve } from   "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
    try {
        const payload = await req.json()

        // Handle both direct Clerk webhook payload structure and custom payload structure
        const action = payload.type || payload.action
        const clerk_id = payload.data?.id || payload.clerk_id || payload.user_id
        const email = payload.data?.email_addresses?.[0]?.email_address || payload.email

        if (action === "user.created") {
            const { error } = await supabase
                .from('users')
                .insert({
                    clerk_id: clerk_id,
                    email: email,
                    role: 'Free'
                })

            if (error) throw error
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }
})
