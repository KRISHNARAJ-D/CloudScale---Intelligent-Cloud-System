import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TelemetryProvider } from "./components/telemetry";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-inter",
    display: "swap",
});

export const viewport: Viewport = {
    themeColor: "#030303",
    width: "device-width",
    initialScale: 1,
};

export const metadata: Metadata = {
    title: "CloudScale Genius | Enterprise Cloud Cost Optimizer",
    description: "CSV → Genius Scaling → 35% Savings. No IAM agents required. Multi-cloud enterprise optimization.",
    openGraph: {
        title: "CloudScale Genius",
        description: "Upload ANY Cloud CSV → Save 35% Instantly. No IAM. No Agents. Pure Genius.",
        type: "website",
        url: "https://cloudscalegenius.ai",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <html lang="en" className={inter.variable}>
                <body className={inter.className}>
                    <TelemetryProvider>
                        {children}
                    </TelemetryProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
