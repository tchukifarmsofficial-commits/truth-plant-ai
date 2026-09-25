import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import AppRoot from "@/AppRoot";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tchuki Farms — AI Plant Doctor & Farming Assistant" },
      {
        name: "description",
        content:
          "Scan a crop photo for an AI plant diagnosis and ask a live AI farming assistant about pests, fertilizer, weather and markets.",
      },
      { property: "og:title", content: "Tchuki Farms — AI Plant Doctor & Farming Assistant" },
      {
        property: "og:description",
        content:
          "Scan a crop photo for an AI plant diagnosis and ask a live AI farming assistant about pests, fertilizer, weather and markets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return <AppRoot />;
}
