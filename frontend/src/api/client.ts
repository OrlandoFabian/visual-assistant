const BASE = "/api";

export interface OpenAIResponse {
  id: string;
  object: "response";
  created_at: number;
  status: "completed" | "in_progress" | "failed";
  model: string;
  output: Array<{
    id: string;
    type: "message";
    role: "assistant";
    status: "completed";
    content: Array<{
      type: "output_text";
      text: string;
      annotations: unknown[];
    }>;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export function extractText(response: OpenAIResponse): string {
  return response.output[0]?.content[0]?.text ?? "";
}

export interface ImageUploadResponse {
  image_id: string;
  filename: string;
  size_bytes: number;
  uploaded_at: string;
  analysis: OpenAIResponse;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  partial: boolean;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

export interface HistoryResponse {
  image_id: string;
  messages: ChatMessage[];
}

export interface ImageSummary {
  image_id: string;
  filename: string;
  size_bytes: number;
  mime_type: string;
  uploaded_at: string;
}

export interface ImagesListResponse {
  images: ImageSummary[];
  pagination: Pagination;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? response.statusText ?? "Request failed";
    throw new Error(message);
  }
  return response.json();
}

export async function uploadImage(file: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  return parseJson<ImageUploadResponse>(response);
}

export async function chat(imageId: string, prompt: string): Promise<OpenAIResponse> {
  const response = await fetch(`${BASE}/chat/${imageId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return parseJson<OpenAIResponse>(response);
}

export async function getHistory(imageId: string): Promise<HistoryResponse> {
  const response = await fetch(`${BASE}/chat/${imageId}/history`);
  return parseJson<HistoryResponse>(response);
}

export async function listImages(
  limit = 50,
  offset = 0,
): Promise<ImagesListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(`${BASE}/images?${params}`);
  return parseJson<ImagesListResponse>(response);
}

export function imagePreviewUrl(imageId: string): string {
  return `${BASE}/images/${imageId}/preview`;
}

export async function deleteImage(imageId: string): Promise<void> {
  const response = await fetch(`${BASE}/images/${imageId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Delete failed");
  }
}

export function streamChat(imageId: string, prompt: string): Promise<Response> {
  return fetch(`${BASE}/chat-stream/${imageId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
}
