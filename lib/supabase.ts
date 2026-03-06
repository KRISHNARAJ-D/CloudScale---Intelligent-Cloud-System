import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MetricEntry = {
    id?: string;
    user_id: string;
    provider: 'aws' | 'gcp' | 'azure' | 'k8s';
    metric_name: string;
    value: number;
    unit: string;
    timestamp: string;
    metadata?: any;
};

export type OptimizationLog = {
    id?: string;
    user_id: string;
    savings_amount: number;
    waste_percentage: number;
    last_optimized: string;
    total_savings_to_date: number;
};
