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
    system: `You are a teaching assistant for the "Next.js 16 Deep Dive" course.

The student is currently on:
- Module: "${lessonContext.moduleTitle}"
- Lesson: "${lessonContext.lessonTitle}"
- Topic: ${lessonContext.lessonDescription}

Guidelines:
- Keep answers concise and focused on this lesson's topic.
- Use code examples when helpful, with brief explanations.
- If the student asks something outside this lesson's scope, briefly answer but guide them to the relevant module.
- Be encouraging and pedagogical — help them understand the "why", not just the "how".`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({ sendReasoning: false });
}
