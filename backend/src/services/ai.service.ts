import OpenAI from "openai";
import { env } from "../config/env.js";
import { findSchools, schoolInclude, type SchoolListItem } from "../data/mock-schools.js";
import { prisma } from "../config/prisma.js";

export class AiService {
  private client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

  private async loadSchoolCatalog() {
    const { data } = await findSchools({}, 1, 30);
    return data.map((school: SchoolListItem) => ({
      id: school.id,
      name: school.name,
      slug: school.slug,
      city: school.city.name,
      board: school.board.name,
      type: school.type,
      monthlyFee: school.fees?.tuitionFeeMonthly ?? null,
      admissionOpen: school.academics?.admissionOpen ?? false,
      facilities: school.facilities,
      description: school.description
    }));
  }

  async recommendSchools(preferences: string) {
    const schools = await this.loadSchoolCatalog();

    if (!this.client) {
      const ranked = [...schools]
        .sort((left, right) => {
          const leftScore = [left.city, left.board, left.name].join(" ").toLowerCase();
          const rightScore = [right.city, right.board, right.name].join(" ").toLowerCase();
          const query = preferences.toLowerCase();
          const leftMatches = query.split(/\s+/).filter((token) => leftScore.includes(token)).length;
          const rightMatches = query.split(/\s+/).filter((token) => rightScore.includes(token)).length;
          return rightMatches - leftMatches;
        })
        .slice(0, 3);

      return {
        provider: "local",
        schools: ranked,
        explanation:
          "OpenAI is not configured. These schools are ranked locally using your preferences against city, board, and profile text."
      };
    }

    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You recommend Indian schools for parents. Return JSON with keys: explanation (string), schoolIds (string[] max 5)."
        },
        {
          role: "user",
          content: `Available schools: ${JSON.stringify(schools)}\nParent preferences: ${preferences}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(response.choices[0]?.message.content ?? "{}") as {
      explanation?: string;
      schoolIds?: string[];
    };

    const selectedIds = parsed.schoolIds ?? [];
    const recommendations =
      selectedIds.length > 0
        ? await prisma.school.findMany({
            where: {
              id: {
                in: selectedIds
              },
              status: "approved"
            },
            include: schoolInclude
          })
        : schools.slice(0, 3);

    return {
      provider: "openai",
      schools: recommendations,
      explanation: parsed.explanation ?? "Here are schools that match your preferences."
    };
  }
}

export const aiService = new AiService();
