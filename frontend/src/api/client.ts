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

export function streamChat(imageId: string, prompt: string): Promise<Response> {
  return fetch(`${BASE}/chat-stream/${imageId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
}
