import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FlowDiagram } from "@/components/diagram";
import { ShortAnswer } from "@/components/short-answer";

export function GeneratingText() {
  return (
    <div className="prose">
      <h1>Generating Text</h1>

      <p className="lead">
        The AI SDK gives you two main ways to get text from an AI model:{" "}
        <code>generateText</code> for getting a complete response all at once,
        and <code>streamText</code> for streaming it word by word. Knowing when
        to use each one is key to building great AI features.
      </p>

      <h2>generateText &mdash; The Simple One</h2>

      <p>
        Use <code>generateText</code> when you don&apos;t need to show the
        response in real time. It sends your prompt to the AI, waits for the
        full response, and gives it back as a string. This is perfect for
        backend tasks like summarizing content, classifying data, or generating
        metadata &mdash; anything where the user isn&apos;t staring at a screen
        waiting for words to appear.
      </p>

      <CodeBlock filename="Summarizing a blog post" language="typescript">
{`import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

const { text } = await generateText({
  model: gateway("anthropic/claude-sonnet-4.5"),
  prompt: "Summarize this blog post in 2 sentences.",
});

console.log(text);
// "This post covers the basics of React Server Components..."
`}
      </CodeBlock>

      <p>
        That&apos;s it. You call <code>generateText</code>, pass it a model and
        a prompt, and destructure the <code>text</code> from the result. The
        function is <code>async</code>, so you <code>await</code> it like any
        other server-side operation.
      </p>

      <Callout type="info" title="Where does this code run?">
        <p>
          Both <code>generateText</code> and <code>streamText</code> run on the
          server &mdash; in API routes, Server Actions, or server components.
          Never import them in client components. The AI model call needs to
          happen on the server where your credentials are available.
        </p>
      </Callout>

      <h2>streamText &mdash; The Interactive One</h2>

      <p>
        Use <code>streamText</code> when you want the user to see the response
        as it&apos;s being generated. Instead of waiting for the entire response
        to finish, it sends chunks of text to the browser as they arrive. This
        is what makes chat interfaces feel responsive &mdash; you see words
        appear one by one instead of waiting several seconds for a wall of text.
      </p>

      <FlowDiagram
        steps={[
          { label: "Browser", sublabel: "Sends prompt to API route" },
          { label: "API Route", sublabel: "Calls streamText on the server" },
          { label: "AI Model", sublabel: "Returns tokens one at a time" },
          { label: "Browser", sublabel: "Displays text as it arrives" },
        ]}
      />

      <p>
        Here&apos;s how you use <code>streamText</code> inside a Next.js API
        route:
      </p>

      <CodeBlock filename="app/api/summarize/route.ts" language="typescript">
{`import { streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-4.5"),
    prompt,
  });

  return result.toUIMessageStreamResponse();
}`}
      </CodeBlock>

      <p>
        Notice that <code>streamText</code> is <em>not</em> awaited. It returns
        a result object immediately, and you call{" "}
        <code>toUIMessageStreamResponse()</code> to convert it into a streaming
        HTTP response that the AI SDK&apos;s client hooks can consume.
      </p>

      <Quiz
        question="When should you use generateText instead of streamText?"
        options={[
          {
            label: "When you want a faster response from the AI model",
            explanation:
              "Both functions talk to the same model at the same speed. The difference is how the response is delivered to your code, not how fast the model generates it.",
          },
          {
            label:
              "When you need the complete response before doing something with it (like saving to a database)",
            correct: true,
            explanation:
              "generateText waits for the full response and returns it as a string. This is ideal for backend tasks where you need the complete text before proceeding.",
          },
          {
            label: "When the response will be very long",
            explanation:
              "Long responses are actually a better fit for streamText, since the user can start reading while the rest generates.",
          },
        ]}
      />

      <h2>The System Prompt</h2>

      <p>
        The <code>system</code> parameter lets you give the AI instructions
        about how to behave. Think of it as a set of rules the AI follows for
        the entire conversation. The user never sees the system prompt, but it
        shapes every response.
      </p>

      <CodeBlock filename="Using a system prompt" language="typescript">
{`const { text } = await generateText({
  model: gateway("anthropic/claude-sonnet-4.5"),
  system: "You are a blog editor. Keep summaries under 50 words. Use a friendly, casual tone.",
  prompt: "Summarize this post about React Server Components...",
});`}
      </CodeBlock>

      <p>
        Without a system prompt, the AI will give generic responses. With one,
        you can tailor the AI to your app&apos;s voice and requirements.
      </p>

      <h2>prompt vs. messages</h2>

      <p>
        You&apos;ve seen the <code>prompt</code> parameter &mdash; it&apos;s a
        single string, like asking the AI one question. But for conversations
        where you need back-and-forth context, you use <code>messages</code>{" "}
        instead. This is an array of message objects with roles like{" "}
        <code>user</code> and <code>assistant</code>.
      </p>

      <CodeBlock filename="Single prompt vs. conversation" language="typescript">
{`// Single prompt — one question, one answer
const { text } = await generateText({
  model: gateway("anthropic/claude-sonnet-4.5"),
  prompt: "What is React?",
});

// Messages — a conversation with context
const { text: reply } = await generateText({
  model: gateway("anthropic/claude-sonnet-4.5"),
  messages: [
    { role: "user", content: "What is React?" },
    { role: "assistant", content: "React is a JavaScript library for building UIs." },
    { role: "user", content: "How does it differ from Next.js?" },
  ],
});`}
      </CodeBlock>

      <p>
        Use <code>prompt</code> for one-off tasks like summarization or
        classification. Use <code>messages</code> for chat interfaces where the
        AI needs to remember what was said earlier in the conversation.
      </p>

      <Callout type="tip" title="You rarely build messages by hand">
        <p>
          In practice, the <code>useChat</code> hook (which we&apos;ll cover in
          the next lesson) manages the messages array for you. It automatically
          tracks the conversation history and sends it to your API route with
          each request.
        </p>
      </Callout>

      <Quiz
        question={'What does the "system" parameter do in generateText or streamText?'}
        options={[
          {
            label: "It specifies which operating system to run the model on",
            explanation:
              "The system parameter has nothing to do with operating systems. It provides instructions that guide the AI's behavior.",
          },
          {
            label:
              "It gives the AI background instructions that shape its responses, like tone or rules",
            correct: true,
            explanation:
              "The system prompt acts as invisible instructions for the AI. It controls things like tone, length, format, and what topics to focus on.",
          },
          {
            label: "It sends a system error message to the AI",
            explanation:
              "The system parameter is for instructions, not errors. It tells the AI how to behave across the entire conversation.",
          },
        ]}
      />

      <HandsOn
        title="Add an AI summarize button to your blog"
        projectStep="Step 34 of 40 — Blog Platform Project"
        projectContext="You have the AI SDK installed. Now let's use it to add a real AI feature — a button that summarizes any blog post."
        steps={[
          "Create a new API route at `app/api/summarize/route.ts`. Import `streamText` from `ai` and `gateway` from `@ai-sdk/gateway`. Export a `POST` handler that reads a `prompt` from the request body, passes it to `streamText` with the model `gateway(\"anthropic/claude-sonnet-4.5\")`, and returns `result.toUIMessageStreamResponse()`.",
          "In your blog post page component, add a \"Summarize\" button. When clicked, it should call `fetch('/api/summarize', { method: 'POST', body: JSON.stringify({ prompt: 'Summarize this blog post: ' + postContent }) })`.",
          "Read the streaming response using `response.body.getReader()` and a `TextDecoder`. Append each chunk to a state variable so the summary appears word by word on the page.",
          "Add a system prompt to your `streamText` call: `system: 'You are a helpful blog assistant. Summarize posts in 2-3 concise sentences.'` — then test it again to see how the tone changes.",
          "Try changing the model string to a different provider (like `\"openai/gpt-5.4\"`) and compare the summaries. This is the power of the AI Gateway — one line change, different model.",
        ]}
      />

      <ShortAnswer
        question="When would you use `streamText` vs `generateText`? Pick a concrete scenario for each and explain the user-experience difference."
        rubric={[
          "generateText: short, complete responses where the user waits and gets the full text at once — e.g. classification, JSON extraction, or a summary that's used programmatically (not displayed token-by-token)",
          "streamText: long-form responses displayed to a user (chatbot, on-screen summary) — words appear as they're generated, so the user sees progress instead of a blank screen with a spinner",
          "Bonus: notes that streaming dramatically reduces perceived latency — total time is similar, but seeing partial text feels much faster than waiting for a complete response",
        ]}
        topic="streamText vs generateText: when to use each"
      />
    </div>
  );
}
