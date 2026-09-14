export interface HealthResponse {
  success: boolean;
  message?: string;
  data?: {
    database: string;
    timestamp: string;
    uptime?: number;
  };
}

export async function checkBackendHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch("http://localhost:5000/api/v1/health");
    if (!res.ok) return null;
    const data: HealthResponse = await res.json();
    return data;
  } catch {
    return null;
  }
}
