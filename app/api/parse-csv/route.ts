import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";

// --- Schema Definitions ---
const SCHEMA_SIGNATURES = {
  aws_cloudwatch: {
    timestamp: ["Timestamp", "Time", "Date", "timestamp", "time", "date"],
    cpu_utilization: ["CPUUtilization", "CPU", "cpu_utilization", "cpu", "avg_cpu"],
    memory_utilization: ["MemoryUtilization", "Memory", "memory_utilization", "memory", "mem"],
    instance_count: ["InstanceCount", "Instances", "instance_count", "instances", "count"],
    request_count: ["RequestCount", "Requests", "request_count", "requests", "reqs"]
  },
  gcp_monitoring: {
    timestamp: ["time", "timestamp", "date_time"],
    cpu_utilization: ["cpu_usage", "cpu_utilization", "compute.googleapis.com/instance/cpu/utilization", "cpu"],
    memory_utilization: ["memory_usage", "memory_utilization", "compute.googleapis.com/instance/memory/utilization", "ram"],
    instance_count: ["instance_count", "vm_count", "vms"],
    request_count: ["request_count", "traffic", "https_requests"]
  },
  prometheus: {
    timestamp: ["timestamp", "time", "t"],
    cpu_utilization: ["process_cpu_seconds_total", "container_cpu_usage_seconds_total", "node_cpu_seconds_total"],
    memory_utilization: ["process_resident_memory_bytes", "container_memory_usage_bytes", "node_memory_MemTotal_bytes"],
    instance_count: ["up", "machine_cpu_cores", "instances"],
    request_count: ["http_requests_total", "prometheus_http_requests_total"]
  }
};

type Platform = keyof typeof SCHEMA_SIGNATURES;
type NormalizedRow = {
  timestamp: Date;
  cpu_utilization: number;
  memory_utilization: number;
  instance_count: number;
  request_count: number;
};

// --- Detection & Mapping logic ---
function detectSchema(headers: string[]): { schema: Platform; mapping: Record<keyof NormalizedRow, string | null> } | null {
  const normHeaders = headers.map(h => h.trim().toLowerCase());
  
  let bestMatchCount = -1;
  let detectedSchema: Platform | null = null;
  let bestMapping: Record<string, string | null> = {};

  for (const [platform, signatures] of Object.entries(SCHEMA_SIGNATURES)) {
    let matchCount = 0;
    const mapping: Record<string, string | null> = {
      timestamp: null,
      cpu_utilization: null,
      memory_utilization: null,
      instance_count: null,
      request_count: null
    };

    for (const [canonicalField, possibleNames] of Object.entries(signatures)) {
      for (const possible of possibleNames) {
        const found = normHeaders.find(h => h === possible.toLowerCase());
        if (found) {
          mapping[canonicalField] = headers[normHeaders.indexOf(found)];
          matchCount++;
          break; // Found primary match for this field
        }
      }
    }

    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      detectedSchema = platform as Platform;
      bestMapping = mapping;
    }
  }

  // Require at least a timestamp and CPU to consider it a valid matching schema
  if (bestMatchCount >= 2 && bestMapping.timestamp && bestMapping.cpu_utilization) {
    return { schema: detectedSchema!, mapping: bestMapping as any };
  }

  return null;
}

// Ensure proper timezone handling and normalizations
function normalizeTimestamp(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    // try to handle prometheus epoch if it's strictly numeric
    if (!isNaN(Number(value))) {
      const ms = Number(value) > 1e11 ? Number(value) : Number(value) * 1000;
      return new Date(ms);
    }
    return null;
  }
  return parsed;
}

// --- Main Route ---
export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    if (!bodyText || bodyText.trim().length === 0) {
      return NextResponse.json({ error: "Empty CSV provided" }, { status: 400 });
    }

    const parseResult = Papa.parse(bodyText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return NextResponse.json({ error: "Invalid CSV format", details: parseResult.errors }, { status: 400 });
    }

    const headers = parseResult.meta.fields || [];
    const schemaDetection = detectSchema(headers);

    if (!schemaDetection) {
      return NextResponse.json({ error: "Could not detect metric schema. Ensure timestamp and cpu_utilization columns are present." }, { status: 400 });
    }

    const { schema, mapping } = schemaDetection;

    // --- Process Rows & Handle missing data ---
    const normalizedData: NormalizedRow[] = [];
    let lastValidCpu = 0;
    let lastValidMem = 0;
    let lastValidInstances = 1;
    let lastValidReqs = 0;

    for (const row of parseResult.data as Record<string, string>[]) {
      const rawTime = row[mapping.timestamp!];
      const time = normalizeTimestamp(rawTime);
      if (!time) continue; // Skip unparseable time rows entirely

      // Parse with fallback to previous value (forward fill interpolation)
      const parseNum = (val: string | undefined, fallback: number) => {
        const n = Number(val);
        return !val || isNaN(n) ? fallback : n;
      };

      const cpu = parseNum(mapping.cpu_utilization ? row[mapping.cpu_utilization] : undefined, lastValidCpu);
      const mem = parseNum(mapping.memory_utilization ? row[mapping.memory_utilization] : undefined, lastValidMem);
      const instances = parseNum(mapping.instance_count ? row[mapping.instance_count] : undefined, lastValidInstances);
      const requests = parseNum(mapping.request_count ? row[mapping.request_count] : undefined, lastValidReqs);

      // Store states for forward fill
      lastValidCpu = cpu;
      lastValidMem = mem;
      lastValidInstances = instances;
      lastValidReqs = requests;

      normalizedData.push({
        timestamp: time,
        cpu_utilization: cpu,
        memory_utilization: mem,
        instance_count: instances,
        request_count: requests
      });
    }

    if (normalizedData.length === 0) {
      return NextResponse.json({ error: "No valid data rows found after parsing." }, { status: 400 });
    }

    // --- Compute Metrics ---
    let sumCpu = 0;
    let maxCpu = -Infinity;
    let underutilizedCount = 0;
    const cpuArr: number[] = [];

    // Aggregations for time patterns
    const hourCpuMap: Record<number, number[]> = {};
    const hourReqMap: Record<number, number[]> = {};
    const dayHourCpuMap: Record<string, number[]> = {};

    normalizedData.forEach((row) => {
      const cpu = row.cpu_utilization;
      sumCpu += cpu;
      if (cpu > maxCpu) maxCpu = cpu;
      cpuArr.push(cpu);

      // Assuming "waste" means CPU < 20%
      if (cpu < 20) {
        underutilizedCount++;
      }

      const utcHour = row.timestamp.getUTCHours();
      const dayHourStr = row.timestamp.toLocaleString('en-US', { weekday: 'short', timeZone: 'UTC' }) + '_' + String(utcHour).padStart(2, '0') + ':00';
      
      if (!hourCpuMap[utcHour]) hourCpuMap[utcHour] = [];
      hourCpuMap[utcHour].push(cpu);

      if (!hourReqMap[utcHour]) hourReqMap[utcHour] = [];
      hourReqMap[utcHour].push(row.request_count);

      if (!dayHourCpuMap[dayHourStr]) dayHourCpuMap[dayHourStr] = [];
      dayHourCpuMap[dayHourStr].push(cpu);
    });

    const avgCpu = sumCpu / normalizedData.length;
    const cpuVariance = cpuArr.reduce((acc, val) => acc + Math.pow(val - avgCpu, 2), 0) / normalizedData.length;
    const wastePercent = (underutilizedCount / normalizedData.length) * 100;

    // --- Detect Time Patterns ---
    
    // Calculate average CPU per day_hour to find peaks
    const peaks: { name: string, avg: number }[] = [];
    for (const [dh, vals] of Object.entries(dayHourCpuMap)) {
      const dhAvg = vals.reduce((a, b) => a + b, 0) / vals.length;
      peaks.push({ name: dh, avg: dhAvg });
    }
    peaks.sort((a, b) => b.avg - a.avg);
    // Take top 3 peak hours
    const daily_peaks = peaks.slice(0, 3).filter(p => p.avg > avgCpu).map(p => p.name);

    // Calculate idle periods by finding continuous hours with low CPU below 30%
    const hourAvgs: { h: number, avg: number }[] = [];
    for (let h = 0; h < 24; h++) {
      if (hourCpuMap[h]) {
        hourAvgs.push({ h, avg: hourCpuMap[h].reduce((a,b)=>a+b,0)/hourCpuMap[h].length });
      }
    }
    
    // Determine contiguous idle blocks
    const idleBlocks: string[] = [];
    let idleStartHour = -1;
    let prevHour = -1;

    // Sort by hour
    hourAvgs.sort((a, b) => a.h - b.h);

    const formatHour = (h: number) => String(h).padStart(2, '0') + ':00';
    
    hourAvgs.forEach(({ h, avg }) => {
      if (avg < 30) {
        if (idleStartHour === -1) {
          idleStartHour = h;
        }
      } else {
        if (idleStartHour !== -1) {
          // close block
          idleBlocks.push(`${formatHour(idleStartHour)}-${formatHour(prevHour + 1)}`);
          idleStartHour = -1;
        }
      }
      prevHour = h;
    });
    if (idleStartHour !== -1) {
      // wrap up last block
      // handle logic where wrap goes over midnight (optional complexity skipped)
      idleBlocks.push(`${formatHour(idleStartHour)}-${formatHour(prevHour === 23 ? 24 : prevHour + 1)}`);
    }

    // --- Anomaly Detection ---
    // values that are > avg + 2*sigma
    const stdDev = Math.sqrt(cpuVariance);
    const anomaliesCount = cpuArr.filter(c => Math.abs(c - avgCpu) > 2 * stdDev).length;

    return NextResponse.json({
      schema,
      metrics: {
        avg_cpu: Number(avgCpu.toFixed(2)),
        max_cpu: Number(maxCpu.toFixed(2)),
        cpu_variance: Number(cpuVariance.toFixed(2)),
        waste_percent: Number(wastePercent.toFixed(2)),
        anomalies_detected: anomaliesCount
      },
      time_patterns: {
        daily_peaks,
        idle_periods: idleBlocks
      }
    });

  } catch (error) {
    console.error("Parse Error:", error);
    return NextResponse.json({ error: "Internal server error during CSV parsing." }, { status: 500 });
  }
}
