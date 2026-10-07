export interface NavItem {
  slug: string;
  title: string;
  to: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const sections: NavSection[] = [
  {
    label: "Getting Started",
    items: [
      { slug: "welcome", title: "Welcome", to: "/docs/welcome" },
      { slug: "quickstart", title: "Quickstart", to: "/docs/quickstart" },
    ],
  },
  {
    label: "Concepts",
    items: [
      { slug: "error-envelope", title: "Error envelope", to: "/docs/error-envelope" },
      { slug: "rate-limiting", title: "Rate limiting", to: "/docs/rate-limiting" },
      { slug: "request-ids", title: "Request IDs", to: "/docs/request-ids" },
      { slug: "logging", title: "Logging", to: "/docs/logging" },
    ],
  },
  {
    label: "Endpoints",
    items: [
      { slug: "health", title: "GET /health", to: "/docs/endpoints/health" },
      { slug: "upload", title: "POST /upload", to: "/docs/endpoints/upload" },
      { slug: "list-images", title: "GET /images", to: "/docs/endpoints/list-images" },
      { slug: "delete-image", title: "DELETE /images/:id", to: "/docs/endpoints/delete-image" },
      { slug: "image-preview", title: "GET /images/:id/preview", to: "/docs/endpoints/image-preview" },
      { slug: "chat", title: "POST /chat/:id", to: "/docs/endpoints/chat" },
      { slug: "chat-stream", title: "POST /chat-stream/:id", to: "/docs/endpoints/chat-stream" },
      { slug: "chat-history", title: "GET /chat/:id/history", to: "/docs/endpoints/chat-history" },
    ],
  },
];
