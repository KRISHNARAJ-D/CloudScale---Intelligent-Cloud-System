import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";

/**
 * Custom hook to get a Supabase client authenticated with the current Clerk session.
 * This ensures that RLS policies using auth.uid() work correctly.
 */
export function useSupabase() {
    const { session } = useSession();

    return useMemo(() => {
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    fetch: async (url, options = {}) => {
                        const clerkToken = await session?.getToken({
                            template: "supabase", // Matches the template name in Clerk
                        });

                        const headers = new Headers(options.headers);
                        if (clerkToken) {
                            headers.set("Authorization", `Bearer ${clerkToken}`);
                        }

                        return fetch(url, {
                            ...options,
                            headers,
                        });
                    },
                },
            }
        );
    }, [session]);
}
