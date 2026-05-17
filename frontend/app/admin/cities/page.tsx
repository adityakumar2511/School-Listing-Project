"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FiLoader } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/schools-api";
import { getAuthToken } from "@/lib/auth-token";

type CityRow = {
  id: string;
  name: string;
  slug: string;
  hasSchools: boolean;
  state?: { name: string; slug: string };
};

type StateRow = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminCitiesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: string };
      if (payload.role !== "admin") router.replace("/");
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  const citiesQuery = useQuery({
    queryKey: ["admin-cities"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/cities`);
      if (!res.ok) throw new Error("Failed to load cities");
      const json = (await res.json()) as { data: CityRow[] };
      return json.data;
    },
  });

  const statesQuery = useQuery({
    queryKey: ["admin-states"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/states`);
      if (!res.ok) throw new Error("Failed to load states");
      const json = (await res.json()) as { data: StateRow[] };
      return json.data;
    },
  });

  return (
    <div className="container-shell py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[#888780]">
        <Link href="/admin" className="hover:text-[#185FA5]">
          Admin
        </Link>
        <span>›</span>
        <span className="font-medium text-[#2C2C2A]">Cities</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-[#042C53]">Cities & States</h1>
      <p className="mt-2 text-sm text-[#888780]">
        Geographic taxonomy. Seeded via{" "}
        <code className="font-mono text-xs">backend/src/prisma/seed.ts</code>.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-heading text-xl font-bold text-[#0C447C]">Cities</h2>
          {citiesQuery.isLoading && (
            <p className="mt-3 flex items-center gap-2 text-sm text-[#888780]">
              <FiLoader className="animate-spin" size={14} /> Loading…
            </p>
          )}
          {citiesQuery.data && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[#D3D1C7]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#185FA5] text-left text-white">
                    <th className="px-4 py-2 font-semibold">Name</th>
                    <th className="px-4 py-2 font-semibold">Slug</th>
                    <th className="px-4 py-2 font-semibold">State</th>
                    <th className="px-4 py-2 font-semibold">Has Schools</th>
                  </tr>
                </thead>
                <tbody>
                  {citiesQuery.data.map((city, i) => (
                    <tr
                      key={city.id}
                      className={`border-t border-[#D3D1C7] ${i % 2 === 1 ? "bg-[#F1EFE8]" : "bg-white"}`}
                    >
                      <td className="px-4 py-2 font-medium text-[#2C2C2A]">{city.name}</td>
                      <td className="px-4 py-2 font-mono text-xs text-[#55534e]">{city.slug}</td>
                      <td className="px-4 py-2 text-[#55534e]">{city.state?.name ?? "—"}</td>
                      <td className="px-4 py-2">
                        <Badge tone={city.hasSchools ? "success" : "neutral"}>
                          {city.hasSchools ? "Yes" : "No"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-[#0C447C]">States</h2>
          {statesQuery.isLoading && (
            <p className="mt-3 flex items-center gap-2 text-sm text-[#888780]">
              <FiLoader className="animate-spin" size={14} /> Loading…
            </p>
          )}
          {statesQuery.data && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[#D3D1C7]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#185FA5] text-left text-white">
                    <th className="px-4 py-2 font-semibold">Name</th>
                    <th className="px-4 py-2 font-semibold">Slug</th>
                  </tr>
                </thead>
                <tbody>
                  {statesQuery.data.map((state, i) => (
                    <tr
                      key={state.id}
                      className={`border-t border-[#D3D1C7] ${i % 2 === 1 ? "bg-[#F1EFE8]" : "bg-white"}`}
                    >
                      <td className="px-4 py-2 font-medium text-[#2C2C2A]">{state.name}</td>
                      <td className="px-4 py-2 font-mono text-xs text-[#55534e]">{state.slug}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
