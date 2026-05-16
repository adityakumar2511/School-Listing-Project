"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Star, IndianRupee, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useCompareStore } from "@/store/compare-store";
import type { NormalizedSchool } from "@/lib/schools-api";

export function SchoolCard({ school }: { school: NormalizedSchool }) {
  const selectedIds = useCompareStore((state) => state.selectedIds);
  const toggleSchool = useCompareStore((state) => state.toggleSchool);
  const isSelected = selectedIds.includes(school.id);

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image src={school.image} alt={school.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 380px" />
        <div className="absolute left-3 top-3 flex gap-2">
          {school.isFeatured ? <Badge tone="amber">Featured</Badge> : null}
          {school.admissionOpen ? <Badge tone="success">Admission Open</Badge> : <Badge tone="danger">Closed</Badge>}
        </div>
      </div>
      <div className="grid gap-4 p-5">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="blue">{school.board}</Badge>
            <Badge>{school.type}</Badge>
            <Badge>{school.format}</Badge>
          </div>
          <Link href={`/schools/${school.slug}`} className="font-heading text-xl font-bold leading-tight text-[#0C447C] hover:text-[#185FA5]">
            {school.name}
          </Link>
          <p className="mt-2 flex items-center gap-1 text-sm text-[#55534e]">
            <MapPin size={15} />
            {school.city}
          </p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-[#55534e]">{school.description}</p>
        <div className="flex flex-wrap gap-2">
          {school.facilities.length === 0 ? (
            <span className="text-xs text-[#888780]">Facility details coming soon</span>
          ) : (
            <>
              {school.facilities.slice(0, 4).map((facility) => (
                <span key={facility} className="inline-flex items-center gap-1 text-xs text-[#55534e]">
                  <Check size={13} className="text-[#3B6D11]" />
                  {facility}
                </span>
              ))}
              {school.facilities.length > 4 && (
                <span className="inline-flex items-center rounded-full bg-[#E6F1FB] px-2 py-0.5 text-xs font-medium text-[#185FA5]">
                  +{school.facilities.length - 4} more
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-[#D3D1C7] pt-4">
          <span className="flex items-center gap-1 text-sm font-semibold text-[#2C2C2A]">
            <IndianRupee size={15} />
            {formatCurrency(school.monthlyFee)}/mo
          </span>
          <button
            type="button"
            onClick={() => toggleSchool(school.id)}
            className="inline-flex items-center gap-1 rounded-full border border-[#D3D1C7] px-3 py-1 text-xs font-medium hover:border-[#85B7EB]"
          >
            <Star size={14} fill={isSelected ? "#EF9F27" : "none"} />
            Compare
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline">
            <Link href={`https://wa.me/${school.whatsapp}`} target="_blank">
              <MessageCircle size={17} />
              WhatsApp
            </Link>
          </Button>
          <Button asChild variant="amber">
            <Link href={`/schools/${school.slug}#inquiry`}>Inquiry</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
