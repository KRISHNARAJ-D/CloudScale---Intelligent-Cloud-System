import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role (bypasses RLS to allow server-side writes)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("Missing CLERK_WEBHOOK_SECRET env variable.");
        return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get raw headers for Svix verification
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Verify the webhook signature
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response("Invalid webhook signature", { status: 400 });
    }

    const eventType = evt.type;

    // ── user.created ─────────────────────────────────────────────────────────
    if (eventType === "user.created") {
        const { id, email_addresses, full_name, first_name, last_name, image_url } = evt.data as any;

        const email = email_addresses?.[0]?.email_address ?? "";
        const name = full_name ?? `${first_name ?? ""} ${last_name ?? ""}`.trim();

        const { error } = await supabase.from("users").upsert({
            clerk_id: id,
            email,
            full_name: name || null,
            avatar_url: image_url ?? null,
            role: "Free",
        }, { onConflict: "clerk_id" });

        if (error) {
            console.error("Supabase insert error (user.created):", error);
            return new Response("Database error", { status: 500 });
        }

        console.log(`✅ User created in Supabase: ${email}`);
    }

    // ── user.updated ─────────────────────────────────────────────────────────
    if (eventType === "user.updated") {
        const { id, email_addresses, full_name, first_name, last_name, image_url } = evt.data as any;

        const email = email_addresses?.[0]?.email_address ?? "";
        const name = full_name ?? `${first_name ?? ""} ${last_name ?? ""}`.trim();

        const { error } = await supabase.from("users").update({
            email,
            full_name: name || null,
            avatar_url: image_url ?? null,
            updated_at: new Date().toISOString(),
        }).eq("clerk_id", id);

        if (error) {
            console.error("Supabase update error (user.updated):", error);
            return new Response("Database error", { status: 500 });
        }

        console.log(`✅ User updated in Supabase: ${email}`);
    }

    // ── user.deleted ─────────────────────────────────────────────────────────
    if (eventType === "user.deleted") {
        const { id } = evt.data as any;

        const { error } = await supabase.from("users").delete().eq("clerk_id", id);

        if (error) {
            console.error("Supabase delete error (user.deleted):", error);
            return new Response("Database error", { status: 500 });
        }

        console.log(`✅ User deleted from Supabase: ${id}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
}
