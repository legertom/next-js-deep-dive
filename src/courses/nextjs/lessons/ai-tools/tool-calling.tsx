import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FlowDiagram } from "@/components/diagram";

export function ToolCalling() {
  return (
    <div>
      <h1>Tool Calling: Let AI Use Your Functions</h1>

      <p className="lead">
        What if the AI could search your database, look up the weather, or
        calculate a price -- on its own? Tool calling lets you give the AI a set
        of functions it can choose to call. The AI decides when a tool is
        needed, you execute it, and the AI uses the result.
      </p>

      <h2>What Is Tool Calling?</h2>

      <p>
        Tool calling is a two-step dance between you and the AI. You describe
        the tools available (their names, what they do, what inputs they need).
        The AI reads the user's message, decides if it needs a tool, and
        requests a call with specific arguments. Your code executes the function
        and returns the result. The AI then uses that result to form its final
        response.
      </p>

      <FlowDiagram
        title="How Tool Calling Works"
        steps={[
          "You define tools with descriptions and input schemas",
          "User asks a question (e.g. 'Find posts about React')",
          "AI reads the question and decides to call searchPosts",
          "Your code executes the search and returns results",
          "AI reads the results and writes a response to the user",
        ]}
      />

      <Callout type="info" title="The AI never runs your code">
        The AI does not execute functions directly. It sends back a structured
        request saying &quot;I want to call this tool with these arguments.&quot;
        Your server-side code runs the actual function. This keeps you in full
        control of what happens.
      </Callout>

      <h2>Defining a Tool</h2>

      <p>
        You define tools using the <code>tool()</code> helper from the AI SDK.
        Each tool needs three things: a description (so the AI knows when to use
        it), an <code>inputSchema</code> (what arguments it accepts), and an{" "}
        <code>execute</code> function (what actually runs).
      </p>

      <CodeBlock language="ts" filename="A simple weather tool">
        {`import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';

const result = await generateText({
  model: "anthropic/claude-sonnet-4.5",
  tools: {
    getWeather: tool({
      description: 'Get the current weather for a city',
      inputSchema: z.object({
        city: z.string().describe('The city name'),
      }),
      execute: async ({ city }) => {
        // In a real app, call a weather API here
        return { city, temperature: 72, condition: 'sunny' };
      },
    }),
  },
  stopWhen: stepCountIs(3),
  prompt: 'What is the weather in San Francisco?',
});

console.log(result.text);
// "The weather in San Francisco is 72°F and sunny."`}
      </CodeBlock>

      <h3>Understanding stopWhen</h3>

      <p>
        The <code>stopWhen: stepCountIs(3)</code> option limits how many
        round-trips the AI can make. Each time the AI calls a tool and gets a
        result, that counts as one step. Without a limit, the AI could keep
        calling tools in a loop. Setting a reasonable limit keeps your API calls
        and costs predictable.
      </p>

      <h2>A Real Example: Blog Post Search</h2>

      <p>
        Here is a more practical example. You give the AI a tool to search
        through your blog posts. When a user asks a question, the AI can search
        your posts and respond with relevant information.
      </p>

      <CodeBlock language="ts" filename="app/api/ask/route.ts">
        {`import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const { question } = await req.json();

  const result = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    tools: {
      searchPosts: tool({
        description: 'Search blog posts by keyword. Returns matching titles and snippets.',
        inputSchema: z.object({
          query: z.string().describe('The search term'),
        }),
        execute: async ({ query }) => {
          const posts = await db.post.findMany({
            where: {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
              ],
            },
            select: { title: true, slug: true, content: true },
            take: 5,
          });
          return posts.map(p => ({
            title: p.title,
            slug: p.slug,
            snippet: p.content.slice(0, 150),
          }));
        },
      }),
      getPostBySlug: tool({
        description: 'Get the full content of a specific blog post by its slug.',
        inputSchema: z.object({
          slug: z.string().describe('The post slug'),
        }),
        execute: async ({ slug }) => {
          const post = await db.post.findUnique({ where: { slug } });
          return post ? { title: post.title, content: post.content } : null;
        },
      }),
    },
    stopWhen: stepCountIs(3),
    prompt: question,
  });

  return Response.json({ answer: result.text });
}`}
      </CodeBlock>

      <p>
        Notice the AI has two tools here. It might first search for posts, then
        fetch the full content of a specific result. The AI decides the
        sequence -- you just define what is available.
      </p>

      <Callout type="warning" title="Write good tool descriptions">
        The AI relies on tool descriptions to decide which tool to use. Vague
        descriptions lead to wrong tool choices. Be specific: instead of
        &quot;Get posts&quot;, write &quot;Search blog posts by keyword. Returns
        matching titles and snippets.&quot; The <code>.describe()</code> method
        on Zod fields also helps the AI understand what arguments to pass.
      </Callout>

      <h2>What Happens Under the Hood</h2>

      <p>
        When you provide tools, the AI SDK manages a multi-step conversation:
      </p>

      <ol>
        <li>Your prompt and tool definitions are sent to the AI model.</li>
        <li>
          The AI responds with a tool call request (tool name + arguments).
        </li>
        <li>The SDK automatically runs your <code>execute</code> function.</li>
        <li>The result is sent back to the AI as a new message.</li>
        <li>
          The AI either calls another tool or writes a final text response.
        </li>
      </ol>

      <p>
        This loop continues until the AI decides it has enough information to
        respond, or the <code>stepCountIs</code> limit is reached.
      </p>

      <Quiz
        question="What happens when the AI 'calls a tool'?"
        options={[
          {
            label: "The AI directly executes the function on your server",
            explanation:
              "The AI never executes code. It sends a structured request with the tool name and arguments, and your server-side code runs the function.",
          },
          {
            label:
              "The AI requests a function call with arguments, your code executes it, and the result is sent back to the AI",
            correct: true,
            explanation:
              "Tool calling is a structured request-response cycle. The AI says which tool to call and with what arguments. Your execute function runs on your server. The result goes back to the AI so it can form a final answer.",
          },
          {
            label: "The AI generates code that runs in the browser",
            explanation:
              "Tool calling has nothing to do with code generation or browser execution. The tools run on your server, and the AI only sees the results.",
          },
          {
            label: "The tool is downloaded and installed in the AI model",
            explanation:
              "Tools are not installed in the AI. They are functions you define in your code that the AI can request to call.",
          },
        ]}
      />

      <HandsOn
        title="Let AI search your blog posts"
        projectStep="Step 37 of 40 — Blog Platform Project"
        projectContext="Your blog has posts stored in a data file or database. You will create an API route that lets the AI search through your posts when answering questions."
        steps={[
          "Create a new API route at app/api/ask/route.ts. Import generateText, tool, and stepCountIs from 'ai', and z from 'zod'. Also import your posts data (from your data file or database).",
          "Define a searchPosts tool inside generateText: give it a description of 'Search blog posts by keyword', an inputSchema with a query string field, and an execute function that filters your posts array where the title includes the query (case-insensitive). Return the matching post titles and slugs.",
          "Set stopWhen: stepCountIs(3) to limit tool calls. Read the question from the request body and pass it as the prompt. Return result.text as JSON.",
          "Test it with curl: curl -X POST http://localhost:3000/api/ask -H 'Content-Type: application/json' -d '{\"question\": \"Do you have any posts about React?\"}'. The AI should use your search tool and respond with information about matching posts.",
          "Try different questions like 'What topics do you cover?' or 'Find posts about TypeScript'. Notice how the AI decides when to use the search tool and when to answer directly.",
        ]}
      />
    </div>
  );
}
