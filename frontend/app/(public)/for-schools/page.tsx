import Link from "next/link";
import { BarChart3, Inbox, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ForSchoolsPage() {
  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold text-[#042C53]">Free digital presence for schools</h1>
      <p className="mt-4 max-w-3xl leading-7 text-[#55534e]">Create a school landing page, receive verified admission leads, and manage inquiries without paying for basic listing.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          [ShieldCheck, "Moderated profile updates"],
          [Inbox, "Inquiry management"],
          [BarChart3, "Basic admission analytics"]
        ].map(([Icon, title]) => {
          const IconComponent = Icon as typeof ShieldCheck;
          return (
            <Card key={String(title)}>
              <IconComponent className="text-[#185FA5]" />
              <p className="mt-4 font-heading text-xl font-bold">{String(title)}</p>
            </Card>
          );
        })}
      </div>
      <Button asChild variant="amber" className="mt-8">
        <Link href="/auth/register">Register school</Link>
      </Button>
    </div>
  );
}
