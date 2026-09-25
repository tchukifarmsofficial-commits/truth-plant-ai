import { createFileRoute } from "@tanstack/react-router";

import { handleFarmChat } from "@/lib/farm-chat.server";

export const Route = createFileRoute("/api/farm-chat")({
  server: { handlers: { POST: ({ request }) => handleFarmChat(request) } },
});
