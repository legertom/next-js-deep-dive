import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FlowDiagram } from "@/components/diagram";
import { ShortAnswer } from "@/components/short-answer";

export function WhatIsAiSdk() {
  return (
    <div className="prose">
      <h1>What Is the AI SDK?</h1>

      <p className="lead">
        You&apos;ve built a blog with Next.js. Now let&apos;s make it smarter.
        The Vercel AI SDK is a TypeScript library that makes it easy to add AI
        features &mdash; like summarization, chat, and content generation &mdash;
        to your app. Think of it as the bridge between your Next.js code and AI
        models like Claude or GPT.
      </p>

      <h2>Why Not Just Call the API Directly?</h2>

      <p>
        You could absolutely call an AI provider&apos;s REST API with{" "}
        <code>fetch</code>. But you&apos;d quickly run into a wall of
        boilerplate. Here&apos;s what it looks like to stream a response from an
        AI API the hard way:
      </p>

      <CodeBlock filename="The hard way: raw fetch" language="typescript">
{`const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${process.env.API_TOKEN}\`,
  },
  body: JSON.stringify({
    model: "openai/gpt-5.4",
    stream: true,
    messages: [{ role: "user", content: "Summarize this article..." }],
  }),
});

// Now you need to manually parse the SSE stream...
const reader = response.body?.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader!.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse "data: " lines, handle "[DONE]", extract content...
  // This gets messy fast.
}`}
      </CodeBlock>

      <p>
        That&apos;s a lot of code just to get text from an AI. And you still
        need to handle errors, manage message state, update your UI, and deal
        with provider-specific quirks. Now here&apos;s the same thing with the
        AI SDK:
      </p>

      <CodeBlock filename="The easy way: AI SDK" language="typescript">
{`import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

const { text } = await generateText({
  model: gateway("anthropic/claude-sonnet-4.5"),
  prompt: "Summarize this article...",
});`}
      </CodeBlock>

      <p>
        Six lines. No manual headers, no stream parsing, no provider-specific
        formatting. The SDK handles all of that for you.
      </p>

      <Callout type="info" title="What about authentication?">
        <p>
          When you use the AI Gateway with a Vercel-deployed app, authentication
          is handled automatically via OIDC &mdash; no API keys to manage. Just
          run <code>vercel env pull</code> to sync your environment, and the
          gateway takes care of the rest.
        </p>
      </Callout>

      <h2>The Three Layers of the AI SDK</h2>

      <p>
        The AI SDK is organized into three layers, each solving a different
        problem. You don&apos;t need to use all three right away &mdash; most
        people start with just the first one.
      </p>

      <FlowDiagram
        steps={[
          { label: "AI SDK Core", sublabel: "Server-side: generateText, streamText" },
          { label: "AI SDK UI", sublabel: "Client hooks: useChat, useCompletion" },
          { label: "AI Gateway", sublabel: "Provider routing: switch models easily" },
        ]}
      />

      <h3>AI SDK Core</h3>

      <p>
        This is the foundation. It runs on the server (in your API routes or
        Server Actions) and gives you functions like <code>generateText</code>{" "}
        and <code>streamText</code> to call AI models. You&apos;ll use this in
        every AI feature you build.
      </p>

      <h3>AI SDK UI</h3>

      <p>
        These are React hooks like <code>useChat</code> that manage the client
        side of AI interactions. They handle streaming messages into your UI,
        tracking loading states, managing conversation history, and wiring up
        input forms. Instead of building all that state management yourself, you
        get it for free.
      </p>

      <h3>AI Gateway</h3>

      <p>
        The gateway lets you switch between AI providers (Anthropic, OpenAI,
        Google, etc.) by changing a single string. Instead of importing
        provider-specific packages, you use a unified model format like{" "}
        <code>&quot;anthropic/claude-sonnet-4.5&quot;</code>. This means you can
        experiment with different models without rewriting your code.
      </p>

      <h2>How It Fits Into Next.js</h2>

      <p>
        The AI SDK was designed with Next.js in mind. The split between server
        and client maps perfectly to how Next.js works:
      </p>

      <FlowDiagram
        steps={[
          { label: "Client Component", sublabel: "useChat hook manages UI state" },
          { label: "API Route", sublabel: "route.ts calls streamText on server" },
          { label: "AI Provider", sublabel: "Claude, GPT, Gemini, etc." },
        ]}
      />

      <p>
        Your client component uses <code>useChat</code> to send messages and
        display responses. Behind the scenes, it calls an API route in your
        Next.js app. That API route uses <code>streamText</code> to talk to the
        AI provider and streams the response back to the browser. The user sees
        text appear word by word, just like in ChatGPT.
      </p>

      <CodeBlock filename="app/api/chat/route.ts" language="typescript">
{`import { streamText, convertToModelMessages, UIMessage } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-4.5"),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}`}
      </CodeBlock>

      <p>
        Don&apos;t worry about understanding every line here. We&apos;ll break
        down each piece in the next two lessons. The point is that it&apos;s not
        much code to get a fully streaming AI chat working in your Next.js app.
      </p>

      <Quiz
        question="What is the main benefit of using the AI SDK instead of calling AI APIs directly?"
        options={[
          {
            label: "It makes AI responses faster",
            explanation:
              "The SDK doesn't change how fast the AI model responds. The speed depends on the model and provider, not the SDK.",
          },
          {
            label: "It removes boilerplate for streaming, state management, and provider integration",
            correct: true,
            explanation:
              "The AI SDK handles stream parsing, message state, UI updates, and provider-specific details so you can focus on building features instead of plumbing.",
          },
          {
            label: "It only works with one AI provider, keeping things simple",
            explanation:
              "Actually, one of the SDK's strengths is that it works with many providers. You can switch between them by changing a single model string.",
          },
          {
            label: "It replaces the need for API routes in Next.js",
            explanation:
              "You still use API routes. The SDK runs inside your API routes on the server side and provides hooks for the client side.",
          },
        ]}
      />

      <Quiz
        question="Which layer of the AI SDK provides the useChat hook for building chat interfaces?"
        options={[
          {
            label: "AI SDK Core",
            explanation:
              "AI SDK Core provides server-side functions like generateText and streamText. The client-side hooks live in AI SDK UI.",
          },
          {
            label: "AI SDK UI",
            correct: true,
            explanation:
              "AI SDK UI provides React hooks like useChat and useCompletion that manage the client-side state and streaming for your chat interface.",
          },
          {
            label: "AI Gateway",
            explanation:
              "The AI Gateway handles provider routing and model selection, not client-side UI state.",
          },
        ]}
      />

      <Callout type="tip" title="You only need two packages">
        <p>
          For most projects, you install <code>ai</code> (the core SDK) and{" "}
          <code>@ai-sdk/react</code> (the UI hooks). The gateway is included in
          the <code>@ai-sdk/gateway</code> package. That&apos;s it &mdash; no
          need to install provider-specific packages when using the gateway.
        </p>
      </Callout>

      <HandsOn
        title="Install the AI SDK in your blog"
        projectStep="Step 33 of 40 — Blog Platform Project"
        projectContext="Your blog platform is fully functional with posts, comments, and server actions. Now we're adding AI features."
        steps={[
          "Open your terminal in the root of your blog project and install the AI SDK: `npm install ai @ai-sdk/gateway @ai-sdk/react`",
          "Verify the installation worked by checking your package.json. You should see `ai`, `@ai-sdk/gateway`, and `@ai-sdk/react` listed under dependencies.",
          "Link your project to Vercel by running `vercel link`, then pull your environment variables with `vercel env pull`. This sets up OIDC authentication so the AI Gateway handles provider credentials for you automatically.",
          "That's it! The SDK is installed and ready to use. In the next lesson, we'll use it to generate text.",
        ]}
      />

      <ShortAnswer
        question="What problems does the AI SDK solve that you'd otherwise hit if you called provider APIs (OpenAI, Anthropic) directly with `fetch`? Name at least two concrete improvements."
        rubric={[
          "Provider abstraction: a single API (generateText, streamText, useChat) works across providers; switching from OpenAI to Anthropic is a model-string change, not a code rewrite",
          "Built-in features: streaming (SSE parsing), tool calling (loop management), structured output (schema validation), and chat state (message history) — all of which you'd otherwise implement yourself",
          "Bonus: notes that AI Gateway integration handles credential management, fallbacks, and observability through one config",
        ]}
        topic="What the AI SDK does that raw fetch calls don't"
      />
    </div>
  );
}
