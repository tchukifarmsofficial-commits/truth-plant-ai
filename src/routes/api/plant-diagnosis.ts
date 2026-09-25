import { createFileRoute } from "@tanstack/react-router";

import { handlePlantDiagnosis } from "@/lib/plant-diagnosis.server";

export const Route = createFileRoute("/api/plant-diagnosis")({
  server: { handlers: { POST: ({ request }) => handlePlantDiagnosis(request) } },
});
