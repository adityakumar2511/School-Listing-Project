import Link from "next/link";
import { Card } from "@/components/ui/card";

const adminRoutes = ["schools", "moderation", "inquiries", "featured", "blog", "seo", "analytics", "cities", "payments"];

export default function AdminPage() {
  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold text-[#042C53]">Admin panel</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {adminRoutes.map((route) => (
          <Card key={route}>
            <Link href={`/admin/${route}`} className="font-semibold capitalize text-[#185FA5]">
              {route}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
