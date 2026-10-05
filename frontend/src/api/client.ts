const BASE = "/api";

export interface ChatCompletion {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: "assistant"; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ImageUploadResponse {
  image_id: string;
  filename: string;
  size_bytes: number;
  uploaded_at: string;
  analysis: ChatCompletion;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  partial: boolean;
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

export async function chat(imageId: string, prompt: string): Promise<ChatCompletion> {
  const response = await fetch(`${BASE}/chat/${imageId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return parseJson<ChatCompletion>(response);
}

export async function getHistory(imageId: string): Promise<HistoryResponse> {
  const response = await fetch(`${BASE}/chat/${imageId}/history`);
  return parseJson<HistoryResponse>(response);
}

export async function listImages(): Promise<ImagesListResponse> {
  const response = await fetch(`${BASE}/images`);
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
