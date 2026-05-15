"use client";

import { schools } from "@/data/schools";
import { useCompareStore } from "@/store/compare-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function ComparePage() {
  const selectedIds = useCompareStore((state) => state.selectedIds);
  const clear = useCompareStore((state) => state.clear);
  const selected = schools.filter((school) => selectedIds.includes(school.id));

  return (
    <div className="container-shell py-10">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-[#042C53]">Compare schools</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#55534e]">Select up to three schools from listing cards to compare board, fees, format, and facilities.</p>
        </div>
        <Button variant="outline" onClick={clear}>
          Clear
        </Button>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#E6F1FB] text-left text-[#042C53]">
              <th className="p-4">Metric</th>
              {(selected.length ? selected : schools.slice(0, 3)).map((school) => (
                <th key={school.id} className="p-4">
                  {school.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["city", "board", "format", "monthlyFee", "facilities"].map((metric) => (
              <tr key={metric} className="border-t border-[#D3D1C7]">
                <td className="p-4 font-semibold capitalize">{metric.replace("monthlyFee", "Monthly fee")}</td>
                {(selected.length ? selected : schools.slice(0, 3)).map((school) => (
                  <td key={`${school.id}-${metric}`} className="p-4">
                    {metric === "monthlyFee" ? formatCurrency(school.monthlyFee) : metric === "facilities" ? school.facilities.slice(0, 4).join(", ") : String(school[metric as keyof typeof school])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
