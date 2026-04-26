import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FlowDiagram } from "@/components/diagram";
import { ShortAnswer } from "@/components/short-answer";

export function ChatUi() {
  return (
    <div className="prose">
      <h1>Chat UI</h1>

      <p className="lead">
        A summarize button is useful, but the real magic happens when you build
        a full chat interface &mdash; where users can have a back-and-forth
        conversation with an AI. The AI SDK makes this surprisingly simple with
        the <code>useChat</code> hook and a single API route.
      </p>

      <h2>The Two Pieces of a Chat</h2>

      <p>
        Every AI chat has two halves: a server-side API route that talks to the
        AI model, and a client-side component that manages the conversation UI.
        The AI SDK gives you tools for both.
      </p>

      <FlowDiagram
        steps={[
          { label: "useChat Hook", sublabel: "Manages messages, input, and streaming" },
          { label: "DefaultChatTransport", sublabel: "Sends messages to your API route" },
          { label: "API Route", sublabel: "Calls streamText, returns streaming response" },
          { label: "AI Model", sublabel: "Generates the reply" },
        ]}
      />

      <h2>The API Route</h2>

      <p>
        The API route receives the conversation history from the client,
        converts it into the format the AI model expects, and streams the
        response back. Here&apos;s the complete route:
      </p>

      <CodeBlock filename="app/api/chat/route.ts" language="typescript">
{`import { streamText, UIMessage, convertToModelMessages } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-4.5"),
    system: "You are a helpful assistant.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}`}
      </CodeBlock>

      <p>
        A few things to note here. The client sends an array of{" "}
        <code>UIMessage</code> objects &mdash; these are the messages as your UI
        sees them. But AI models expect a different format, so you use{" "}
        <code>convertToModelMessages</code> to translate them. Then{" "}
        <code>streamText</code> handles the AI call, and{" "}
        <code>toUIMessageStreamResponse()</code> streams the result back in a
        format the <code>useChat</code> hook understands.
      </p>

      <Callout type="info" title="Why convertToModelMessages?">
        <p>
          The AI SDK separates <em>UI messages</em> (what the user sees) from{" "}
          <em>model messages</em> (what the AI processes). UI messages can
          contain rich content like tool results and multi-part responses. The{" "}
          <code>convertToModelMessages</code> function bridges the gap,
          translating your UI state into something the model can work with.
        </p>
      </Callout>

      <h2>The useChat Hook</h2>

      <p>
        On the client side, <code>useChat</code> from{" "}
        <code>@ai-sdk/react</code> manages everything: the message list,
        the input field, loading states, and streaming. You give it a{" "}
        <code>transport</code> that tells it where your API route lives, and it
        handles the rest.
      </p>

      <CodeBlock filename="components/chat.tsx" language="tsx">
{`"use client";
import { useState } from "react";
import { useChat, DefaultChatTransport } from "@ai-sdk/react";

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function Chat() {
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");

  return (
    <div>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.role === "user" ? "You" : "AI"}:</strong>
            {message.parts.map((part, i) =>
              part.type === "text" ? <p key={i}>{part.text}</p> : null
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />
        <button type="submit" disabled={status === "streaming"}>
          Send
        </button>
      </form>
    </div>
  );
}`}
      </CodeBlock>

      <p>
        The <code>useChat</code> hook returns several useful values.{" "}
        <code>messages</code> is the full conversation history.{" "}
        <code>sendMessage</code> sends a new message to the AI.{" "}
        And <code>status</code> tells you whether the AI is
        currently streaming a response. You manage the input field yourself
        with normal React state.
      </p>

      <h2>Understanding Message Parts</h2>

      <p>
        Each message in the AI SDK has a <code>parts</code> array instead of a
        simple <code>content</code> string. This is because AI responses can
        contain different types of content &mdash; text, tool calls, tool
        results, and more. For a basic chat, you only need to render the{" "}
        <code>text</code> parts:
      </p>

      <CodeBlock filename="Rendering message parts" language="tsx">
{`{message.parts.map((part, i) => {
  if (part.type === "text") {
    return <p key={i}>{part.text}</p>;
  }
  // Other part types: "tool-weather", "reasoning", etc.
  return null;
})}`}
      </CodeBlock>

      <p>
        This parts-based structure might seem like overkill for plain text
        chat, but it becomes essential when you start building AI features that
        use tools &mdash; like an AI that can look up data or perform actions.
      </p>

      <Quiz
        question="What does DefaultChatTransport do in the useChat hook?"
        options={[
          {
            label: "It encrypts the chat messages for security",
            explanation:
              "DefaultChatTransport handles communication, not encryption. HTTPS handles security at the network level.",
          },
          {
            label:
              "It connects the useChat hook to your API route, handling the HTTP requests and streaming",
            correct: true,
            explanation:
              "DefaultChatTransport tells useChat where to send messages (your API route URL) and manages the streaming connection between client and server.",
          },
          {
            label: "It stores messages in a database",
            explanation:
              "The transport only handles communication between the client and your API route. Persistence is a separate concern you would add yourself.",
          },
        ]}
      />

      <h2>How This Course&apos;s Chat Works</h2>

      <p>
        Here&apos;s a fun meta moment: the AI chat in this very course app uses
        the exact same pattern. There&apos;s an API route that calls{" "}
        <code>streamText</code> with a system prompt about being a Next.js
        tutor, and a client component that uses <code>useChat</code> to render
        the conversation. The same pattern you&apos;re learning right now is
        powering the thing teaching you.
      </p>

      <Callout type="tip" title="Inspecting the chat">
        <p>
          Open your browser&apos;s Network tab and send a message in the course
          chat. You&apos;ll see a POST request to the chat API route, and the
          response will stream in as a series of small chunks. That&apos;s{" "}
          <code>toUIMessageStreamResponse()</code> in action.
        </p>
      </Callout>

      <Quiz
        question="Why do AI SDK messages use a parts array instead of a simple content string?"
        options={[
          {
            label: "To make the code more complex",
            explanation:
              "The parts array isn't complexity for its own sake. It solves a real problem: AI responses can contain multiple types of content.",
          },
          {
            label:
              "Because AI responses can contain different content types like text, tool calls, and reasoning",
            correct: true,
            explanation:
              "A single AI response might include text, a tool invocation, a tool result, and more reasoning text. The parts array lets you handle each type appropriately.",
          },
          {
            label: "Because strings are slower than arrays in JavaScript",
            explanation:
              "Performance isn't the reason. The parts array exists to represent the rich, multi-type content that AI models can produce.",
          },
        ]}
      />

      <HandsOn
        title="Build a chat page for your blog"
        projectStep="Step 35 of 40 — Blog Platform Project"
        projectContext="You have a working AI summarize feature. Now let's build a full chat interface where users can ask questions about your blog."
        steps={[
          "Create an API route at `app/api/chat/route.ts`. Import `streamText`, `UIMessage`, and `convertToModelMessages` from `ai`, and `gateway` from `@ai-sdk/gateway`. Export a `POST` handler that reads `messages` from the request body, converts them with `convertToModelMessages`, passes them to `streamText`, and returns `result.toUIMessageStreamResponse()`.",
          "Add a system prompt to your route: `system: 'You are a friendly blog assistant. Help readers understand the blog posts and answer questions about web development.'`",
          "Create a client component at `components/chat.tsx`. Mark it with `'use client'`, import `useChat` and `DefaultChatTransport` from `@ai-sdk/react`, create a transport pointing to `/api/chat`, and build a simple form with an input field and send button.",
          "Render the messages by mapping over `messages` and displaying each message's `parts`. Show the role (You or AI) and render `text` parts as paragraphs.",
          "Create a page at `app/chat/page.tsx` that imports and renders your Chat component. Visit `/chat` in your browser and have a conversation with your AI assistant!",
        ]}
      />

      <ShortAnswer
        question="The `useChat` hook represents messages as an array of `parts` rather than a single text string. Why is the parts model necessary for modern chat UIs?"
        rubric={[
          "A modern assistant message can include text, images, tool calls, tool results, reasoning blocks, files, and structured data — all in one turn — so a single string can't represent it",
          "Treating each piece as a part lets the UI render each appropriately (markdown for text, table for tool result, image preview for vision, code block for code) instead of cramming everything into one rendered string",
          "Bonus: notes that this also makes streaming work naturally — each part can stream independently and the UI updates incrementally as different kinds of content arrive",
        ]}
        topic="Why useChat models messages as parts, not strings"
      />
    </div>
  );
}
