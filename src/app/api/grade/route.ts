import { generateText, Output } from "ai";
import { z } from "zod";

const feedbackSchema = z.object({
  score: z.enum(["strong", "partial", "weak"]),
  summary: z
    .string()
    .describe("One or two sentences summarizing the answer's quality, addressed to the student in second person."),
  hits: z
    .array(z.string())
    .describe("Specific things the answer got right. Empty array if nothing was right."),
  misses: z
    .array(z.string())
    .describe("Specific things the answer should have included or could improve. Empty array if the answer is essentially complete."),
});

export async function POST(req: Request) {
  const { question, rubric, topic, answer } = (await req.json()) as {
    question: string;
    rubric: string[];
    topic: string;
    answer: string;
  };

  const { output } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    output: Output.object({ schema: feedbackSchema }),
    system: `You are a warm, encouraging tutor grading a student's short-answer response. Your goal is to help them learn, not to nitpick.

Grading philosophy:
- "strong": Covers the core ideas in the rubric. Minor wording or detail gaps are fine.
- "partial": Covers some rubric points but misses one or more important ones.
- "weak": Misses the core idea or shows a misconception.

Rules:
- Speak directly to the student in second person ("you noted...", "you missed...").
- Be specific. "You could mention X" beats "you could be more thorough."
- "hits" should be concrete things they actually wrote. Don't invent praise.
- "misses" should be the most useful 1–3 things to add — not an exhaustive list.
- Never include the rubric verbatim. Translate it into natural feedback.
- Keep the summary to 1–2 sentences. Be warm but honest.`,
    prompt: `Topic: ${topic}

Question: ${question}

Rubric (qualities a good answer should cover):
${rubric.map((r) => `- ${r}`).join("\n")}

Student's answer:
"""
${answer}
"""

Grade this answer.`,
  });

  return Response.json(output);
}
