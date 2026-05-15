"use client";

import { motion } from "framer-motion";
import { AlertCircle, Bot, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { School } from "@/data/schools";
import { formatCurrency } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  recommendations?: Recommendation[];
};

type Recommendation = {
  school: School;
  reason?: string;
  matchScore?: string | number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const AI_RECOMMEND_ENDPOINT = API_URL ? `${API_URL}/api/ai/recommend` : "/api/ai/recommend";

function slugify(value: string) {
  return value.toLowerCase().trim().replaceAll("_", "-").replaceAll(" ", "-");
}

function normalizeFacilities(rawFacilities: unknown): string[] {
  if (Array.isArray(rawFacilities)) {
    return rawFacilities.map(String);
  }

  if (rawFacilities && typeof rawFacilities === "object") {
    const labels: Record<string, string> = {
      library: "Library",
      labs: "Labs",
      hostel: "Hostel",
      transport: "Transport",
      smartClassroom: "Smart Classroom",
      wifi: "WiFi",
      cctv: "CCTV",
      gym: "Gym",
      swimmingPool: "Swimming Pool",
      playground: "Playground",
      auditorium: "Auditorium",
      cafeteria: "Canteen"
    };

    return Object.entries(rawFacilities as Record<string, unknown>)
      .filter(([key, value]) => key !== "schoolId" && value === true)
      .map(([key]) => labels[key] ?? key);
  }

  return [];
}

function normalizeSchool(raw: unknown): School {
  const school = raw as Record<string, any>;
  const city = school.city;
  const board = school.board;
  const details = school.details ?? {};
  const address = school.address ?? {};
  const academics = school.academics ?? {};
  const fees = school.fees ?? {};
  const gallery = Array.isArray(school.gallery) ? school.gallery : [];
  const cityName = typeof city === "string" ? city : city?.name ?? address.city ?? "Unknown city";
  const boardName = typeof board === "string" ? board : board?.name ?? "CBSE";
  const facilities = normalizeFacilities(school.facilities);

  return {
    id: String(school.id ?? school.slug ?? school.name),
    name: String(school.name ?? "Recommended school"),
    slug: String(school.slug ?? slugify(String(school.name ?? "school"))),
    city: cityName,
    citySlug: typeof city === "object" ? city?.slug ?? slugify(cityName) : school.citySlug ?? slugify(cityName),
    state: typeof city === "object" ? city?.state?.name ?? "Uttar Pradesh" : school.state ?? address.state ?? "Uttar Pradesh",
    board: boardName as School["board"],
    type: school.type ?? "Co-ed",
    format: school.format ?? (facilities.includes("Hostel") ? "Boarding" : "Day"),
    medium: school.medium ?? "English",
    description: school.description ?? "",
    logo: school.logo ?? "/school-logo.svg",
    image:
      school.image ??
      gallery[0]?.cloudinaryUrl ??
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    phone: details.phone ?? school.phone ?? "",
    whatsapp: details.whatsapp ?? school.whatsapp ?? "",
    address: address.addressLine ?? school.address ?? cityName,
    establishedYear: details.establishedYear ?? school.establishedYear ?? 0,
    affiliationNo: details.affiliationNo ?? school.affiliationNo ?? "N/A",
    classes:
      school.classes ??
      (academics.classesFrom && academics.classesTo ? `${academics.classesFrom} - ${academics.classesTo}` : "N/A"),
    admissionOpen: academics.admissionOpen ?? school.admissionOpen ?? true,
    isFeatured: school.isFeatured ?? false,
    monthlyFee: fees.tuitionFeeMonthly ?? school.monthlyFee ?? 0,
    annualFee: fees.tuitionFeeAnnual ?? school.annualFee ?? 0,
    facilities,
    categories: school.categories ?? [],
    lat: address.lat ?? school.lat ?? 0,
    lng: address.lng ?? school.lng ?? 0
  };
}

function extractRecommendations(payload: unknown): Recommendation[] {
  const data = (payload as { data?: unknown })?.data ?? payload;
  const result = data as Record<string, any>;
  const rawRecommendations =
    result?.recommendations ??
    result?.schools ??
    result?.recommendedSchools ??
    (Array.isArray(data) ? data : []);

  if (!Array.isArray(rawRecommendations) || rawRecommendations.length === 0) {
    return [];
  }

  return rawRecommendations.slice(0, 5).map((item: unknown) => {
    const entry = item as Record<string, any>;
    const rawSchool = entry.school ?? entry;
    return {
      school: normalizeSchool(rawSchool),
      reason: entry.reason ?? entry.reasoning ?? entry.explanation ?? result?.reasoning,
      matchScore: entry.matchScore ?? entry.score
    };
  });
}

async function fetchRecommendations(preferences: string): Promise<Recommendation[]> {
  const response = await fetch(AI_RECOMMEND_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ preferences })
  });

  if (!response.ok) {
    throw new Error("AI recommendation request failed");
  }

  const payload = await response.json();
  return extractRecommendations(payload);
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const { school } = recommendation;

  return (
    <div className="rounded-[12px] border border-[#D3D1C7] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="blue">{school.board}</Badge>
        {recommendation.matchScore ? <Badge tone="amber">{recommendation.matchScore}</Badge> : null}
        {school.admissionOpen ? <Badge tone="success">Admission Open</Badge> : null}
      </div>
      <h3 className="mt-3 font-heading text-xl font-bold leading-tight text-[#0C447C]">{school.name}</h3>
      <p className="mt-1 text-sm text-[#55534e]">
        {school.city} / {school.classes} / {school.medium}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#55534e]">
        {recommendation.reason || school.description || "Recommended based on your school preferences."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#55534e]">
        {school.facilities.slice(0, 4).map((facility) => (
          <span key={facility} className="rounded-full bg-[#E6F1FB] px-3 py-1 text-[#185FA5]">
            {facility}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#D3D1C7] pt-3">
        <span className="text-sm font-semibold text-[#2C2C2A]">
          {school.monthlyFee ? `${formatCurrency(school.monthlyFee)}/mo` : "Fee on request"}
        </span>
        <Button asChild variant="amber" size="sm">
          <a href={`/schools/${school.slug}`}>View school</a>
        </Button>
      </div>
    </div>
  );
}

export function AiChat() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Tell me the class, city, board, budget, commute needs, hostel preference, and goals like IIT/NEET or sports."
    }
  ]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const preferences = input.trim();
    if (!preferences || isLoading) return;

    setInput("");
    setError("");
    setIsLoading(true);
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: preferences
      }
    ]);

    try {
      const recommendations = await fetchRecommendations(preferences);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text:
            recommendations.length > 0
              ? "Here are the strongest school matches based on your preferences."
              : "I could not find a strong match yet. Try adding city, board, budget, and must-have facilities.",
          recommendations
        }
      ]);
    } catch {
      setError("Could not fetch AI recommendations right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="grid min-h-[620px] grid-rows-[1fr_auto] overflow-hidden p-0">
      <div className="grid content-start gap-4 overflow-y-auto bg-[#F1EFE8] p-5">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" ? <Bot className="mt-2 shrink-0 text-[#185FA5]" size={20} /> : null}
            <div className={`max-w-[88%] ${message.role === "user" ? "text-right" : ""}`}>
              <p
                className={`inline-block rounded-[12px] px-4 py-3 text-sm leading-6 ${
                  message.role === "user" ? "bg-[#185FA5] text-white" : "bg-white text-[#2C2C2A]"
                }`}
              >
                {message.text}
              </p>
              {message.recommendations?.length ? (
                <div className="mt-4 grid gap-3 text-left">
                  {message.recommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.school.id} recommendation={recommendation} />
                  ))}
                </div>
              ) : null}
            </div>
            {message.role === "user" ? <UserRound className="mt-2 shrink-0 text-[#888780]" size={20} /> : null}
          </motion.div>
        ))}

        {isLoading ? (
          <div className="flex items-center gap-3">
            <Bot className="text-[#185FA5]" size={20} />
            <div className="inline-flex items-center gap-2 rounded-[12px] bg-white px-4 py-3 text-sm text-[#55534e]">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#185FA5]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#185FA5] [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#185FA5] [animation-delay:240ms]" />
              <span className="ml-1">Finding suitable schools...</span>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center gap-2 rounded-[12px] border border-[#F4B7B7] bg-[#FCEBEB] px-4 py-3 text-sm text-[#A32D2D]">
            <AlertCircle size={17} />
            {error}
          </div>
        ) : null}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-[#D3D1C7] bg-white p-4">
        <div className="relative min-w-0 flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-[#185FA5]" size={18} />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Class 8, Prayagraj, CBSE, budget 5000, transport needed"
            className="h-12 w-full rounded-[8px] border border-[#D3D1C7] pl-10 pr-3 outline-none focus:border-[#185FA5]"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" variant="amber" aria-label="Send preferences" disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </Button>
      </form>
    </Card>
  );
}
