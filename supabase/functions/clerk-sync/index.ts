import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
    try {
        const { action, user_id, email, clerk_id } = await req.json()

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
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }
})
