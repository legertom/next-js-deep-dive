import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const {
    messages,
    lessonContext,
  }: {
    messages: UIMessage[];
    lessonContext: {
      moduleTitle: string;
      lessonTitle: string;
      lessonDescription: string;
    };
  } = await req.json();

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    system: `You're a friendly tutor helping someone learn Next.js 16. Be warm, casual, and concise — like a knowledgeable friend, not a lecturer.

They're reading the lesson "${lessonContext.lessonTitle}" in the "${lessonContext.moduleTitle}" module (${lessonContext.lessonDescription}).

Rules:
- Keep replies short. A few sentences is usually enough. Don't over-explain.
- Match the student's energy — if they say "hello", just say hi back naturally. Don't launch into a lesson overview.
- Use code snippets when they'd help, but skip them for casual chat.
- If they ask about something outside this lesson, give a quick answer and mention which module covers it.
- Focus on the "why" behind things, not just the "how".`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({ sendReasoning: false });
}
