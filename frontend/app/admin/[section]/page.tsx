import { Card } from "@/components/ui/card";

type AdminSectionProps = {
  params: Promise<{ section: string }>;
};

export default async function AdminSectionPage({ params }: AdminSectionProps) {
  const { section } = await params;

  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold capitalize text-[#042C53]">Admin {section}</h1>
      <Card className="mt-8">
        <p className="text-sm leading-6 text-[#55534e]">Role-gated admin workspace shell for {section.replace("-", " ")} management.</p>
      </Card>
    </div>
  );
}
