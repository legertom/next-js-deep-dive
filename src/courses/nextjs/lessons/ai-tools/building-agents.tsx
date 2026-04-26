import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FlowDiagram } from "@/components/diagram";
import { ShortAnswer } from "@/components/short-answer";

export function BuildingAgents() {
  return (
    <div>
      <h1>Building Agents: AI That Reasons and Acts</h1>

      <p className="lead">
        A single tool call is useful. But what if the AI could use multiple
        tools in sequence -- searching, thinking, and acting on its own to
        accomplish a goal? That is an agent. Let's build one.
      </p>

      <h2>What Is an Agent?</h2>

      <p>
        In the previous lesson, you gave the AI tools and it could call one or
        two to answer a question. An agent takes this further. An agent is an AI
        that runs in a loop: it observes the situation, thinks about what to do,
        takes an action (calls a tool), observes the result, and repeats until
        the task is done.
      </p>

      <FlowDiagram
        title="The Agent Loop"
        steps={[
          "User gives the agent a task",
          "Agent reads the task and thinks about what to do",
          "Agent calls a tool (search, create, edit, etc.)",
          "Agent observes the tool result",
          "Agent decides: done, or call another tool? (loops back to step 2)",
        ]}
      />

      <p>
        The key difference from a single <code>generateText</code> call with
        tools: an agent can take many steps to accomplish a complex task. It can
        search for posts, read one, draft improvements, and suggest a new title
        -- all in one conversation.
      </p>

      <h2>ToolLoopAgent -- Define Once, Reuse Everywhere</h2>

      <p>
        The AI SDK provides the <code>ToolLoopAgent</code> class for building
        agents. You define the agent once with its model, instructions, and
        tools. Then you can use it across multiple API routes and pages.
      </p>

      <CodeBlock language="ts" filename="lib/agents/writing-assistant.ts">
        {`import { ToolLoopAgent, tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';

export const writingAssistant = new ToolLoopAgent({
  model: "anthropic/claude-sonnet-4.5",
  instructions: \`You are a blog writing assistant. Help users draft, improve,
    and research blog posts. Search existing posts for context when relevant.
    Be concise and helpful.\`,
  tools: {
    searchPosts: tool({
      description: 'Search existing blog posts by keyword',
      inputSchema: z.object({
        query: z.string().describe('The search term'),
      }),
      execute: async ({ query }) => {
        const posts = await db.post.findMany({
          where: { title: { contains: query, mode: 'insensitive' } },
          select: { title: true, slug: true },
          take: 5,
        });
        return posts;
      },
    }),
    suggestTitle: tool({
      description: 'Generate title suggestions for a blog post based on its topic',
      inputSchema: z.object({
        topic: z.string().describe('The blog post topic'),
        style: z.enum(['casual', 'professional', 'clickbait']).describe('The tone'),
      }),
      execute: async ({ topic, style }) => {
        // The AI will use this tool's result to suggest titles
        // In practice, this could call another AI or use templates
        return {
          topic,
          style,
          note: 'Use the topic and style to generate 3 title suggestions',
        };
      },
    }),
  },
});`}
      </CodeBlock>

      <Callout type="tip" title="Agents live in shared files">
        Define your agents in files like <code>lib/agents/</code> so you can
        import them from any API route. This keeps your agent logic separate
        from your route handling code, and lets you reuse the same agent in
        different parts of your app.
      </Callout>

      <h2>Using an Agent in an API Route</h2>

      <p>
        Once defined, using an agent in a route is straightforward. Call{" "}
        <code>agent.stream()</code> to get a streaming response, then return
        it to the client.
      </p>

      <CodeBlock language="ts" filename="app/api/writing-assistant/route.ts">
        {`import { writingAssistant } from '@/lib/agents/writing-assistant';
import { convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = writingAssistant.stream({
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}`}
      </CodeBlock>

      <p>
        That is the entire API route. The agent handles all the tool calling
        loops internally. It will search posts, suggest titles, or take whatever
        actions it decides are needed -- and stream the results back to your
        client.
      </p>

      <h2>Agents vs. Single Tool Calls</h2>

      <p>
        When should you use an agent instead of a simple <code>generateText</code>{" "}
        call with tools? Here is a quick comparison:
      </p>

      <ul>
        <li>
          <strong>Single tool call:</strong> User asks one question, AI calls
          one tool, done. Good for simple lookups like &quot;search posts&quot;
          or &quot;get weather.&quot;
        </li>
        <li>
          <strong>Agent:</strong> User gives a complex task, AI takes multiple
          steps to complete it. Good for &quot;help me write a blog post about
          React&quot; where the AI might search existing posts, draft content,
          and suggest titles.
        </li>
      </ul>

      <Callout type="warning" title="Agents cost more">
        Each step in the agent loop is a separate AI API call. A simple question
        might take 1-2 steps, but a complex task could take 5-10. Keep this in
        mind for cost and latency. Use <code>stopWhen: stepCountIs(N)</code> to
        set an upper bound when needed.
      </Callout>

      <h2>Building a Chat UI for Your Agent</h2>

      <p>
        On the client side, you use <code>useChat</code> from the AI SDK to
        connect to your agent's API route. The chat hook handles sending
        messages, receiving streaming responses, and managing conversation
        state.
      </p>

      <CodeBlock language="tsx" filename="app/assistant/page.tsx">
        {`'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function AssistantPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/writing-assistant',
    }),
  });
  const [input, setInput] = useState('');
  const isActive = status === 'streaming' || status === 'submitted';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Writing Assistant</h1>

      <div className="space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user'
                ? 'bg-blue-100 p-3 rounded-lg'
                : 'bg-gray-100 p-3 rounded-lg'
            }
          >
            <p className="text-sm font-medium mb-1">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </p>
            {message.parts.map((part, i) =>
              part.type === 'text' ? <p key={i}>{part.text}</p> : null
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to help write a blog post..."
          className="flex-1 border rounded-lg px-4 py-2"
          disabled={isActive}
        />
        <button
          type="submit"
          disabled={isActive}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}`}
      </CodeBlock>

      <p>
        This is a fully functional chat interface. The <code>useChat</code> hook
        manages the message list, input state, and streaming -- you just render
        the UI. When the user sends a message, it goes to your API route, the
        agent processes it (potentially calling tools along the way), and the
        response streams back to the chat.
      </p>

      <Quiz
        question="What makes an agent different from a single AI call with tools?"
        options={[
          {
            label: "Agents use a different AI model than regular tool calls",
            explanation:
              "Agents use the same AI models. The difference is in how they run -- agents loop through multiple steps, not which model they use.",
          },
          {
            label:
              "Agents can call multiple tools in sequence, reasoning between each step to accomplish complex tasks",
            correct: true,
            explanation:
              "An agent runs in a loop: think, act, observe, repeat. It can chain multiple tool calls together, using the result of one to decide what to do next. A single generateText call with tools typically handles one question with one or two tool calls.",
          },
          {
            label: "Agents run in the browser, while tool calls run on the server",
            explanation:
              "Both agents and tool calls run on the server. The agent loop and tool execution all happen server-side. Only the chat UI runs in the browser.",
          },
          {
            label: "Agents do not need tools -- they work from memory alone",
            explanation:
              "Agents are built on top of tools. The entire point of an agent is that it can use tools in a reasoning loop to accomplish tasks.",
          },
        ]}
      />

      <HandsOn
        title="Build a writing assistant for your blog"
        projectStep="Step 38 of 40 — Blog Platform Project"
        projectContext="Your blog has posts and an AI-powered tag generator. Now you will create a writing assistant agent that can search your posts and help you write new content."
        steps={[
          "Create a new file at lib/agents/writing-assistant.ts. Import ToolLoopAgent and tool from 'ai', and z from 'zod'. Import your posts data. Define a ToolLoopAgent with instructions like 'You are a blog writing assistant' and a searchPosts tool that filters posts by a keyword query.",
          "Create an API route at app/api/writing-assistant/route.ts. Import your writingAssistant agent and convertToModelMessages from 'ai'. In the POST handler, read messages from the request body, call writingAssistant.streamText() with the converted messages, and return result.toUIMessageStreamResponse().",
          "Create a new page at app/assistant/page.tsx. Add 'use client' at the top. Import useChat from '@ai-sdk/react'. Build a simple chat UI: a list of messages and a form with an input and send button. Point useChat to your API route with { api: '/api/writing-assistant' }.",
          "Start your dev server and navigate to http://localhost:3000/assistant. Try asking 'What posts do I have about React?' -- the assistant should use the search tool and tell you about matching posts.",
          "Try a more complex request like 'Help me outline a blog post about Next.js caching'. The agent should reason about the topic and give you a structured outline, possibly searching your existing posts for related content.",
        ]}
      />

      <ShortAnswer
        question="What's the difference between a single tool-calling response and an 'agent' that uses tools in a loop? When does the loop actually matter?"
        rubric={[
          "Single response: the model calls a tool once, gets the result, returns its final answer — fine for direct lookups like 'find posts tagged X'",
          "Agent loop: the model can call multiple tools across multiple steps, reasoning about each tool's result before deciding the next action — the loop continues until a stopWhen condition is met",
          "Bonus: notes that loops are needed for any task with sub-questions — e.g. 'find posts about React, summarize the top 3, suggest a follow-up topic' requires three sequential tool calls with reasoning between them",
        ]}
        topic="Single tool call vs agent loop — when looping matters"
      />
    </div>
  );
}
