import { AiChat } from "@/components/ai/ai-chat";

export default function AiRecommendPage() {
  return (
    <div className="container-shell py-10">
      <div className="mb-7">
        <h1 className="font-heading text-4xl font-bold text-[#042C53]">AI School Recommendation Assistant</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#55534e]">
          Share class, location, board, budget, commute needs, hostel preference, and goals to get matching school recommendations.
        </p>
      </div>
      <AiChat />
    </div>
  );
}
