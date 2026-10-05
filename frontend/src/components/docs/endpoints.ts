import type { Endpoint } from "./EndpointCard";

export const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/health",
    summary: "Health check",
    description:
      "Liveness probe. Returns 200 OK when the application is accepting requests. Used by docker-compose healthchecks and load-balancer probes.",
    responses: [
      {
        status: 200,
        description: "Application is alive",
        example: `{
  "status": "ok"
}`,
      },
    ],
    curl: `curl http://localhost:8000/health`,
  },
  {
    method: "POST",
    path: "/upload",
    summary: "Upload image",
    description:
      "Accepts an image file (PNG, JPG, JPEG, or GIF, up to 16 MB). Validates the file type by sniffing magic bytes (not just the extension) and rejects renamed or malformed files. Stores the file on disk, records metadata, and returns an initial mocked vision analysis.",
    request: {
      contentType: "multipart/form-data",
      description: "Attach the image as a form field named 'file'.",
      example: `# Form fields
file: <binary image data>`,
    },
    responses: [
      {
        status: 201,
        description: "Image stored and analyzed",
        example: `{
  "image_id": "img_abc123",
  "filename": "sunset.jpg",
  "size_bytes": 184203,
  "uploaded_at": "2026-10-04T12:00:00+00:00",
  "analysis": {
    "id": "chatcmpl-xyz789",
    "object": "chat.completion",
    "created": 1759493200,
    "model": "mock-gpt-4o",
    "choices": [{
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The image shows..."
      },
      "finish_reason": "stop"
    }],
    "usage": {
      "prompt_tokens": 42,
      "completion_tokens": 68,
      "total_tokens": 110
    }
  }
}`,
      },
      {
        status: 400,
        description: "No file field provided in the request",
      },
      {
        status: 413,
        description: "File exceeds the 16 MB upload limit",
      },
      {
        status: 415,
        description:
          "Unsupported file type, or MIME content does not match the declared extension",
      },
    ],
    curl: `curl -X POST http://localhost:8000/upload \\
  -F "file=@/path/to/image.png"`,
  },
  {
    method: "GET",
    path: "/images",
    summary: "List uploaded images",
    description:
      "Returns metadata for every image uploaded to the server, newest first. Used by the frontend's past-uploads sidebar to let users revisit prior conversations without re-uploading.",
    responses: [
      {
        status: 200,
        description: "List of image summaries, newest first",
        example: `{
  "images": [
    {
      "image_id": "img_abc123",
      "filename": "sunset.jpg",
      "size_bytes": 184203,
      "mime_type": "image/jpeg",
      "uploaded_at": "2026-10-05T14:22:00+00:00"
    }
  ]
}`,
      },
    ],
    curl: `curl http://localhost:8000/images`,
  },
  {
    method: "DELETE",
    path: "/images/<image_id>",
    summary: "Delete an image and its conversation",
    description:
      "Removes the image record, deletes the underlying file from disk, and clears the full chat history for that image. The operation is idempotent at the HTTP level: a repeated call returns 404.",
    responses: [
      {
        status: 204,
        description: "Image, file, and chat history removed",
      },
      {
        status: 404,
        description: "Image ID not found",
      },
    ],
    curl: `curl -X DELETE http://localhost:8000/images/img_abc123`,
  },
  {
    method: "GET",
    path: "/images/<image_id>/preview",
    summary: "Fetch the image file",
    description:
      "Streams the raw image bytes back to the client with the original Content-Type. Used for sidebar thumbnails and for showing the image inline when loading a historical conversation.",
    responses: [
      {
        status: 200,
        description: "Image bytes (Content-Type matches the original upload)",
      },
      {
        status: 404,
        description: "Image ID not found",
      },
    ],
    curl: `curl -o image.png http://localhost:8000/images/img_abc123/preview`,
  },
  {
    method: "POST",
    path: "/chat/<image_id>",
    summary: "Chat about an image",
    description:
      "Sends a prompt about an uploaded image and returns the full response in one shot. Loads prior conversation history and passes it to the assistant as context. Both the user prompt and the assistant reply are saved to history.",
    request: {
      contentType: "application/json",
      example: `{
  "prompt": "What color is the sky?"
}`,
    },
    responses: [
      {
        status: 200,
        description: "OpenAI chat.completion-shaped response",
        example: `{
  "id": "chatcmpl-xyz789",
  "object": "chat.completion",
  "created": 1759493200,
  "model": "mock-gpt-4o",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "..."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 68,
    "total_tokens": 110
  }
}`,
      },
      {
        status: 400,
        description: "Missing, empty, or oversized prompt (max 4000 chars)",
      },
      {
        status: 404,
        description: "Image ID not found",
      },
    ],
    curl: `curl -X POST http://localhost:8000/chat/img_abc123 \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"What is this image about?"}'`,
  },
  {
    method: "POST",
    path: "/chat-stream/<image_id>",
    summary: "Streaming chat (Server-Sent Events)",
    description:
      "Same as /chat but streams the response as SSE. Each chunk matches OpenAI's chat.completion.chunk format. If the client disconnects mid-stream, the partial response is captured and saved to history with partial=true, keeping server state consistent with what the user saw on screen.",
    request: {
      contentType: "application/json",
      example: `{
  "prompt": "Describe this image in detail"
}`,
    },
    responses: [
      {
        status: 200,
        description: "text/event-stream of chat.completion.chunk events",
        example: `retry: 3000

data: {"id":"chatcmpl-x","object":"chat.completion.chunk","created":1759493200,"model":"mock-gpt-4o","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-x","object":"chat.completion.chunk","created":1759493200,"model":"mock-gpt-4o","choices":[{"index":0,"delta":{"content":"The"},"finish_reason":null}]}

data: {"id":"chatcmpl-x","object":"chat.completion.chunk","created":1759493200,"model":"mock-gpt-4o","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]`,
      },
      {
        status: 400,
        description: "Invalid prompt (returned before the stream starts)",
      },
      {
        status: 404,
        description: "Image ID not found (returned before the stream starts)",
      },
    ],
    curl: `curl -N -X POST http://localhost:8000/chat-stream/img_abc123 \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"What is this?"}'`,
  },
  {
    method: "GET",
    path: "/chat/<image_id>/history",
    summary: "Get conversation history",
    description:
      "Returns the full conversation history for an image in chronological order. Each message carries its role, content, timestamp, and a partial flag that is true when a streamed assistant response was interrupted.",
    responses: [
      {
        status: 200,
        description: "Chronological list of messages",
        example: `{
  "image_id": "img_abc123",
  "messages": [
    {
      "role": "user",
      "content": "What color is the sky?",
      "created_at": "2026-10-04T12:01:00+00:00",
      "partial": false
    },
    {
      "role": "assistant",
      "content": "The sky appears to be...",
      "created_at": "2026-10-04T12:01:02+00:00",
      "partial": false
    }
  ]
}`,
      },
      {
        status: 404,
        description: "Image ID not found",
      },
    ],
    curl: `curl http://localhost:8000/chat/img_abc123/history`,
  },
];
