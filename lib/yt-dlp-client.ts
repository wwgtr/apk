import type { DownloadFormat, DownloadJob, DownloadQuality } from "@/lib/download-types";

type RemoteJob = Partial<DownloadJob> & { id?: string; jobId?: string };

function normalizeEndpoint(endpoint: string): string {
  return endpoint.trim().replace(/\/+$/, "");
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; message?: string };
    return body.message || body.error || `الخدمة أعادت رمز ${response.status}`;
  } catch {
    return `الخدمة أعادت رمز ${response.status}`;
  }
}

export async function testService(endpoint: string): Promise<void> {
  const response = await fetch(`${normalizeEndpoint(endpoint)}/health`);
  if (!response.ok) throw new Error(await readError(response));
}

export async function createRemoteDownload(
  endpoint: string,
  request: { sourceUrl: string; format: DownloadFormat; quality: DownloadQuality },
): Promise<RemoteJob> {
  const response = await fetch(`${normalizeEndpoint(endpoint)}/api/downloads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as RemoteJob;
}

export async function getRemoteDownload(endpoint: string, jobId: string): Promise<RemoteJob> {
  const response = await fetch(`${normalizeEndpoint(endpoint)}/api/downloads/${encodeURIComponent(jobId)}`);
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as RemoteJob;
}

export async function cancelRemoteDownload(endpoint: string, jobId: string): Promise<void> {
  const response = await fetch(`${normalizeEndpoint(endpoint)}/api/downloads/${encodeURIComponent(jobId)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(await readError(response));
}
