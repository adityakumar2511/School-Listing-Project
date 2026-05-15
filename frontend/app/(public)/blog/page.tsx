import { Card } from "@/components/ui/card";

const posts = [
  "CBSE vs ICSE: Which board is right for your child?",
  "Admission checklist for Tier-2 city parents",
  "How to evaluate school facilities beyond brochures"
];

export default function BlogPage() {
  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold text-[#042C53]">Admission guides</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <Card key={post}>
            <p className="font-heading text-xl font-bold text-[#0C447C]">{post}</p>
            <p className="mt-3 text-sm leading-6 text-[#55534e]">CMS-backed content can be managed from the admin panel in Phase 2.</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
