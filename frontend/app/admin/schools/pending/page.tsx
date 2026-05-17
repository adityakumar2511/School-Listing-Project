import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// The /admin/schools page already supports filtering by status via tabs.
// /admin/schools/pending is a deep-link shortcut into that filter.
export default function PendingSchoolsRedirect() {
  redirect("/admin/schools?tab=pending");
}
