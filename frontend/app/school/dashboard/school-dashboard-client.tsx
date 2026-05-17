"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiAlertCircle } from "react-icons/fi";
import { MdHourglassEmpty } from "react-icons/md";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

type InquiryRecord = {
  id: string;
  status: string;
  studentName: string;
  classApplying: string;
  createdAt: string;
  parent?: { name?: string; phone?: string };
};

type GalleryRow = {
  id: string;
  cloudinaryUrl: string;
  order: number;
  type: string;
};

type SectionRow = {
  id: string;
  title: string;
  content: string;
  sectionType: string;
  order: number;
};

type MySchoolFull = {
  id: string;
  name: string;
  status: string;
  description: string;
  type: string;
  medium: string;
  details?: {
    principalName?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
  } | null;
  address?: { addressLine?: string | null; pincode?: string | null } | null;
  fees?: {
    admissionFee?: number | null;
    tuitionFeeMonthly?: number | null;
    tuitionFeeAnnual?: number | null;
  } | null;
  gallery?: GalleryRow[];
  sections?: SectionRow[];
};

const statusOptions = ["new", "contacted", "interested", "converted", "closed"] as const;

const SECTION_TYPE_OPTIONS = [
  { value: "iit_neet", label: "IIT / NEET" },
  { value: "sports", label: "Sports" },
  { value: "hostel", label: "Hostel" },
  { value: "achievements", label: "Achievements" },
  { value: "robotics", label: "Robotics" },
  { value: "scholarship", label: "Scholarship" },
  { value: "custom", label: "Custom" },
] as const;

const REVIEW_BANNER =
  "Changes are under review and will go live after admin approval.";

function fieldClass() {
  return "mt-1 w-full rounded-lg border border-[#D3D1C7] px-3 py-2 text-sm text-[#2C2C2A]";
}

export function SchoolDashboardClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [noteModalId, setNoteModalId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [profileNotice, setProfileNotice] = useState(false);
  const [galleryNotice, setGalleryNotice] = useState(false);
  const [sectionsNotice, setSectionsNotice] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    description: "",
    type: "",
    medium: "",
    principalName: "",
    phone: "",
    addressLine: "",
    pincode: "",
    admissionFee: "",
    tuitionFeeMonthly: "",
    tuitionFeeAnnual: "",
  });

  const [sectionDrafts, setSectionDrafts] = useState<
    { key: string; title: string; content: string; sectionType: string; order: number }[]
  >([]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: string };
    if (payload.role && payload.role !== "school" && payload.role !== "admin") {
      router.replace("/auth/login");
    }
  }, [router]);

  const mySchoolQuery = useQuery({
    queryKey: ["my-school"],
    queryFn: async (): Promise<{ status: "found"; school: MySchoolFull } | { status: "not_registered" }> => {
      const response = await fetch(`${API_URL}/api/schools/me`, { headers: authHeaders() });
      if (response.status === 404) {
        return { status: "not_registered" };
      }
      if (!response.ok) throw new Error("Could not load your school profile");
      const payload = (await response.json()) as { data: MySchoolFull };
      return { status: "found", school: payload.data };
    },
  });

  const school = mySchoolQuery.data?.status === "found" ? mySchoolQuery.data.school : null;

  useEffect(() => {
    if (!school) return;
    setProfileForm({
      name: school.name ?? "",
      description: school.description ?? "",
      type: school.type ?? "",
      medium: school.medium ?? "",
      principalName: school.details?.principalName ?? "",
      phone: school.details?.phone ?? "",
      addressLine: school.address?.addressLine ?? "",
      pincode: school.address?.pincode ?? "",
      admissionFee:
        school.fees?.admissionFee != null ? String(school.fees.admissionFee) : "",
      tuitionFeeMonthly:
        school.fees?.tuitionFeeMonthly != null ? String(school.fees.tuitionFeeMonthly) : "",
      tuitionFeeAnnual:
        school.fees?.tuitionFeeAnnual != null ? String(school.fees.tuitionFeeAnnual) : "",
    });
    setSectionDrafts(
      (school.sections ?? []).map((s, i) => ({
        key: s.id,
        title: s.title,
        content: s.content,
        sectionType: s.sectionType || "custom",
        order: typeof s.order === "number" ? s.order : i,
      }))
    );
  }, [school]);

  const schoolId = school?.id ?? "";

  const inquiriesQuery = useQuery({
    queryKey: ["school-inquiries", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const response = await fetch(`${API_URL}/api/inquiries/for-school`, { headers: authHeaders() });
      if (!response.ok) throw new Error("Could not load inquiries");
      const payload = (await response.json()) as { data: InquiryRecord[] };
      return payload.data;
    },
    enabled: Boolean(schoolId),
  });

  const invalidateSchool = () => queryClient.invalidateQueries({ queryKey: ["my-school"] });

  const putSchoolPending = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const response = await fetch(`${API_URL}/api/schools/${schoolId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || "Update failed");
      }
      return response.json();
    },
    onSuccess: () => {
      setFormError(null);
      invalidateSchool();
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: async (galleryRowId: string) => {
      const response = await fetch(`${API_URL}/api/upload/image/${galleryRowId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Delete failed");
    },
    onSuccess: () => invalidateSchool(),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`${API_URL}/api/inquiries/${id}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Status update failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["school-inquiries", schoolId] }),
  });

  const noteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const response = await fetch(`${API_URL}/api/inquiries/${id}/notes`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ note }),
      });
      if (!response.ok) throw new Error("Could not save note");
    },
    onSuccess: () => {
      setNoteModalId(null);
      setNoteText("");
      queryClient.invalidateQueries({ queryKey: ["school-inquiries", schoolId] });
    },
  });

  const inquiries = inquiriesQuery.data ?? [];
  const newThisWeek = useMemo(
    () =>
      inquiries.filter((item) => {
        const created = new Date(item.createdAt).getTime();
        return Date.now() - created < 7 * 24 * 60 * 60 * 1000;
      }).length,
    [inquiries],
  );

  const gallerySorted = [...(school?.gallery ?? [])].sort((a, b) => a.order - b.order);

  async function uploadGalleryImage(file: File) {
    if (!schoolId) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const up = await fetch(`${API_URL}/api/upload/image`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ imageBase64: dataUrl }),
    });
    if (!up.ok) throw new Error("Upload failed");

    type UploadPayload = {
      data?: { url?: string; secure_url?: string };
    };
    const payload = (await up.json()) as UploadPayload;
    const url = payload.data?.secure_url ?? payload.data?.url ?? "";
    if (!url) throw new Error("No image URL returned");

    const gallery = [...gallerySorted].map((g, i) => ({
      cloudinaryUrl: g.cloudinaryUrl,
      order: typeof g.order === "number" ? g.order : i,
      type: "photo",
    }));
    gallery.push({ cloudinaryUrl: url, order: gallery.length, type: "photo" });

    await putSchoolPending.mutateAsync({ gallery });
    setGalleryNotice(true);
  }

  function submitProfile(ev: React.FormEvent) {
    ev.preventDefault();
    if (!schoolId) return;
    setFormError(null);
    const body: Record<string, unknown> = {
      name: profileForm.name.trim(),
      description: profileForm.description.trim(),
      type: profileForm.type.trim(),
      medium: profileForm.medium.trim(),
      principalName: profileForm.principalName.trim(),
      phone: profileForm.phone.trim(),
      addressLine: profileForm.addressLine.trim(),
      pincode: profileForm.pincode.trim(),
    };
    if (profileForm.admissionFee.trim() !== "") {
      body.admissionFee = Number(profileForm.admissionFee);
    }
    if (profileForm.tuitionFeeMonthly.trim() !== "") {
      body.tuitionFeeMonthly = Number(profileForm.tuitionFeeMonthly);
    }
    if (profileForm.tuitionFeeAnnual.trim() !== "") {
      body.tuitionFeeAnnual = Number(profileForm.tuitionFeeAnnual);
    }
    void putSchoolPending
      .mutateAsync(body)
      .then(() => setProfileNotice(true))
      .catch((e: unknown) => setFormError(e instanceof Error ? e.message : "Save failed"));
  }

  function submitSections(ev: React.FormEvent) {
    ev.preventDefault();
    if (!schoolId) return;
    const sections = sectionDrafts.map((s, i) => ({
      title: s.title.trim(),
      content: s.content.trim(),
      sectionType: s.sectionType,
      order: typeof s.order === "number" ? s.order : i,
    }));
    void putSchoolPending
      .mutateAsync({ sections })
      .then(() => setSectionsNotice(true))
      .catch((e: unknown) => setFormError(e instanceof Error ? e.message : "Save failed"));
  }

  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold text-[#042C53]">School dashboard</h1>
      {mySchoolQuery.isSuccess && mySchoolQuery.data.status === "not_registered" ? (
        <div className="mt-6 rounded-xl border border-[#D3D1C7] bg-[#F5F9FC] px-5 py-4">
          <p className="font-semibold text-[#042C53]">No school on this account yet</p>
          <p className="mt-1 text-sm text-[#55534e]">
            Register your school to receive and manage inquiries from parents.
          </p>
          <Button variant="amber" size="sm" className="mt-4" onClick={() => router.push("/auth/school/register")}>
            Register school
          </Button>
        </div>
      ) : null}

      {school?.status === "pending" && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#EF9F27] bg-[#FAEEDA] px-5 py-4">
          <MdHourglassEmpty className="mt-0.5 shrink-0 text-2xl text-[#633806]" aria-hidden />
          <div>
            <p className="font-semibold text-[#633806]">Your school is under review.</p>
            <p className="mt-0.5 text-sm text-[#55534e]">
              It will appear on the website once approved by our team. This usually takes 1–2 business days.
            </p>
          </div>
        </div>
      )}

      {school ? (
        <Tabs defaultValue="overview" className="mt-10 w-full">
          {formError ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          ) : null}
          <TabsList className="h-auto flex-wrap rounded-xl md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8 space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <p className="font-semibold">Total inquiries</p>
                <p className="mt-2 text-3xl font-bold text-[#185FA5]">{inquiries.length}</p>
              </Card>
              <Card>
                <p className="font-semibold">New this week</p>
                <p className="mt-2 text-3xl font-bold text-[#185FA5]">{newThisWeek}</p>
              </Card>
              <Card>
                <p className="font-semibold">Profile views</p>
                <p className="mt-2 text-3xl font-bold text-[#185FA5]">—</p>
              </Card>
            </div>

            <Card className="flex items-start gap-4 rounded-2xl border border-[#D3D1C7] bg-[#FAEEDA] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EF9F27]/20 text-[#633806]">
                ★
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-heading font-bold text-[#633806]">Get Featured Placement</p>
                  <Badge tone="neutral">Coming soon</Badge>
                </div>
                <p className="mt-1 text-sm text-[#55534e]">
                  Appear at the top of search results and receive more inquiries when payments return.
                </p>
              </div>
              <Button variant="amber" size="sm" disabled className="opacity-50">
                Upgrade
              </Button>
            </Card>

            <section className="overflow-x-auto">
              <h2 className="font-heading text-2xl font-bold text-[#0C447C]">Inquiries</h2>
              <table className="mt-4 w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-[#E6F1FB] text-left">
                    <th className="p-3">Parent</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="border-t border-[#D3D1C7]">
                      <td className="p-3">{inquiry.parent?.name ?? "Parent"}</td>
                      <td className="p-3">{inquiry.parent?.phone ?? "—"}</td>
                      <td className="p-3">{inquiry.studentName}</td>
                      <td className="p-3">{inquiry.classApplying}</td>
                      <td className="p-3">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <select
                          value={inquiry.status}
                          onChange={(event) =>
                            statusMutation.mutate({ id: inquiry.id, status: event.target.value })
                          }
                          className="rounded-lg border border-[#D3D1C7] px-2 py-1"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm" onClick={() => setNoteModalId(inquiry.id)}>
                          Add note
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </TabsContent>

          <TabsContent value="profile" className="mt-8 max-w-2xl">
            {profileNotice ? (
              <div className="mb-6 flex gap-3 rounded-xl border border-[#EF9F27] bg-[#FAEEDA] px-4 py-3 text-sm text-[#633806]">
                <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden />
                <p>{REVIEW_BANNER}</p>
              </div>
            ) : null}
            <form onSubmit={submitProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#888780]">School name</label>
                <input
                  className={fieldClass()}
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#888780]">Description</label>
                <textarea
                  rows={4}
                  className={fieldClass()}
                  value={profileForm.description}
                  onChange={(e) => setProfileForm((p) => ({ ...p, description: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[#888780]">Type</label>
                  <input
                    className={fieldClass()}
                    value={profileForm.type}
                    onChange={(e) => setProfileForm((p) => ({ ...p, type: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#888780]">Medium</label>
                  <input
                    className={fieldClass()}
                    value={profileForm.medium}
                    onChange={(e) => setProfileForm((p) => ({ ...p, medium: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#888780]">Principal name</label>
                <input
                  className={fieldClass()}
                  value={profileForm.principalName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, principalName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#888780]">Phone</label>
                <input
                  className={fieldClass()}
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#888780]">Address</label>
                <input
                  className={fieldClass()}
                  value={profileForm.addressLine}
                  onChange={(e) => setProfileForm((p) => ({ ...p, addressLine: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#888780]">Pincode</label>
                <input
                  className={fieldClass()}
                  value={profileForm.pincode}
                  onChange={(e) => setProfileForm((p) => ({ ...p, pincode: e.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-[#888780]">Admission fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    className={fieldClass()}
                    value={profileForm.admissionFee}
                    onChange={(e) => setProfileForm((p) => ({ ...p, admissionFee: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#888780]">Monthly tuition (₹)</label>
                  <input
                    type="number"
                    min={0}
                    className={fieldClass()}
                    value={profileForm.tuitionFeeMonthly}
                    onChange={(e) => setProfileForm((p) => ({ ...p, tuitionFeeMonthly: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#888780]">Annual fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    className={fieldClass()}
                    value={profileForm.tuitionFeeAnnual}
                    onChange={(e) => setProfileForm((p) => ({ ...p, tuitionFeeAnnual: e.target.value }))}
                  />
                </div>
              </div>
              <Button type="submit" variant="amber" disabled={putSchoolPending.isPending}>
                {putSchoolPending.isPending ? "Submitting…" : "Submit for review"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="gallery" className="mt-8 space-y-6">
            {galleryNotice ? (
              <div className="flex gap-3 rounded-xl border border-[#EF9F27] bg-[#FAEEDA] px-4 py-3 text-sm text-[#633806]">
                <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden />
                <p>{REVIEW_BANNER}</p>
              </div>
            ) : null}
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#D3D1C7] bg-white px-4 py-2 text-sm font-semibold hover:border-[#185FA5]">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (ev) => {
                    const file = ev.target.files?.[0];
                    ev.target.value = "";
                    if (!file) return;
                    try {
                      await uploadGalleryImage(file);
                    } catch (e: unknown) {
                      setFormError(
                        e instanceof Error ? e.message : "Image upload failed. Try a smaller JPG/PNG.",
                      );
                    }
                  }}
                />
              </label>
              <p className="mt-2 text-xs text-[#888780]">
                New photos are queued for admin approval before appearing on your public listing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {gallerySorted.map((g) => (
                <div key={g.id} className="relative overflow-hidden rounded-xl border border-[#D3D1C7]">
                  <div className="relative aspect-square w-full bg-[#F1EFE8]">
                    <Image src={g.cloudinaryUrl} alt="" fill className="object-cover" sizes="200px" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="m-2 w-[calc(100%-1rem)]"
                    disabled={deleteGalleryMutation.isPending}
                    onClick={() => deleteGalleryMutation.mutate(g.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sections" className="mt-8 max-w-3xl space-y-6">
            {sectionsNotice ? (
              <div className="flex gap-3 rounded-xl border border-[#EF9F27] bg-[#FAEEDA] px-4 py-3 text-sm text-[#633806]">
                <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden />
                <p>{REVIEW_BANNER}</p>
              </div>
            ) : null}
            <form onSubmit={submitSections} className="space-y-6">
              {sectionDrafts.map((row, idx) => (
                <Card key={row.key} className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#888780]">Section {idx + 1}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSectionDrafts((rows) => rows.filter((r) => r.key !== row.key))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <div>
                    <label className="text-xs text-[#888780]">Title</label>
                    <input
                      className={fieldClass()}
                      value={row.title}
                      onChange={(e) =>
                        setSectionDrafts((rows) =>
                          rows.map((r) => (r.key === row.key ? { ...r, title: e.target.value } : r))
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#888780]">Section type</label>
                    <select
                      className={fieldClass()}
                      value={row.sectionType}
                      onChange={(e) =>
                        setSectionDrafts((rows) =>
                          rows.map((r) =>
                            r.key === row.key ? { ...r, sectionType: e.target.value } : r
                          )
                        )
                      }
                    >
                      {SECTION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#888780]">Content</label>
                    <textarea
                      rows={4}
                      className={fieldClass()}
                      value={row.content}
                      onChange={(e) =>
                        setSectionDrafts((rows) =>
                          rows.map((r) => (r.key === row.key ? { ...r, content: e.target.value } : r))
                        )
                      }
                    />
                  </div>
                </Card>
              ))}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setSectionDrafts((rows) => [
                      ...rows,
                      {
                        key: `new-${Date.now()}`,
                        title: "",
                        content: "",
                        sectionType: "custom",
                        order: rows.length,
                      },
                    ])
                  }
                >
                  Add section
                </Button>
                <Button type="submit" variant="amber" disabled={putSchoolPending.isPending}>
                  {putSchoolPending.isPending ? "Saving…" : "Save sections for review"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      ) : null}

      {noteModalId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <h3 className="font-heading text-lg font-bold text-[#0C447C]">Add note</h3>
            <textarea
              rows={4}
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              className="mt-3 w-full rounded-lg border border-[#D3D1C7] px-3 py-2"
            />
            <div className="mt-4 flex gap-2">
              <Button variant="amber" onClick={() => noteMutation.mutate({ id: noteModalId, note: noteText })}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setNoteModalId(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
