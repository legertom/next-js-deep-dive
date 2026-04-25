import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FlowDiagram } from "@/components/diagram";

export function StructuredOutput() {
  return (
    <div>
      <h1>Structured Output: Getting Typed Data from AI</h1>

      <p className="lead">
        AI models return strings. But your app needs objects, arrays, and typed
        data. Structured output lets you define a schema and have the AI fill it
        in -- giving you reliable, typed responses every time.
      </p>

      <h2>The Problem with Raw Text</h2>

      <p>
        In the previous module, you used <code>generateText</code> to get text
        back from the AI. That works great for chat responses, but what if you
        need specific data? Imagine asking AI to analyze a blog post and return
        tags, a category, and a summary. With plain text, you would have to
        parse the response yourself -- and hope the AI formatted it correctly.
      </p>

      <CodeBlock language="ts" filename="The fragile approach (don't do this)">
        {`// Asking AI for structured data as text is fragile:
const { text } = await generateText({
  model: "anthropic/claude-sonnet-4.5",
  prompt: "Return JSON with tags, category, and summary for this post: ...",
});

// Hope it returned valid JSON...
const data = JSON.parse(text); // might throw!
// Hope it has the right fields...
console.log(data.tags); // might be undefined!`}
      </CodeBlock>

      <p>
        This is brittle. The AI might return markdown-wrapped JSON, forget a
        field, or use different key names. You need a better way.
      </p>

      <h2>Output.object() -- Define the Shape You Want</h2>

      <p>
        The AI SDK solves this with <code>Output.object()</code>. You pass a Zod
        schema describing exactly what you want, and the AI SDK guarantees you
        get back a typed object matching that schema.
      </p>

      <CodeBlock language="ts" filename="app/api/analyze/route.ts">
        {`import { generateText, Output } from 'ai';
import { z } from 'zod';

const { output } = await generateText({
  model: "anthropic/claude-sonnet-4.5",
  output: Output.object({
    schema: z.object({
      tags: z.array(z.string()).describe('Relevant topic tags'),
      category: z.enum(['tutorial', 'opinion', 'news', 'guide']),
      summary: z.string().describe('A one-sentence summary'),
    }),
  }),
  prompt: \`Analyze this blog post and extract metadata:

  Title: Getting Started with React Server Components
  Content: React Server Components let you render components
  on the server. They reduce client-side JavaScript...\`,
});

// output is fully typed!
console.log(output.tags);     // string[]
console.log(output.category); // 'tutorial' | 'opinion' | 'news' | 'guide'
console.log(output.summary);  // string`}
      </CodeBlock>

      <Callout type="tip" title="Zod does double duty">
        Your Zod schema serves two purposes: it tells the AI what shape to
        produce, and it validates the response at runtime. If the AI returns
        something that does not match, the SDK handles retries automatically.
        Use <code>.describe()</code> on fields to give the AI hints about what
        you want.
      </Callout>

      <FlowDiagram
        title="How Structured Output Works"
        steps={[
          "You define a Zod schema (tags, category, summary)",
          "AI SDK converts the schema into instructions for the AI",
          "AI generates a response matching that structure",
          "AI SDK validates the response against your schema",
          "You get back a fully typed object",
        ]}
      />

      <h2>Streaming Structured Output</h2>

      <p>
        For larger objects, you can stream structured output with{" "}
        <code>streamText</code>. This gives you partial objects as they are
        generated -- perfect for showing progress in the UI.
      </p>

      <CodeBlock language="ts" filename="app/api/analyze-stream/route.ts">
        {`import { streamText, Output } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { content } = await req.json();

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    output: Output.object({
      schema: z.object({
        tags: z.array(z.string()),
        category: z.string(),
        summary: z.string(),
        readingTime: z.number().describe('Estimated reading time in minutes'),
      }),
    }),
    prompt: \`Analyze this blog post: \${content}\`,
  });

  return result.toTextStreamResponse();
}`}
      </CodeBlock>

      <h2>Practical Use Cases</h2>

      <p>
        Structured output is useful whenever you need the AI to return data your
        code can work with directly:
      </p>

      <ul>
        <li>
          <strong>Content classification</strong> -- categorize blog posts,
          support tickets, or user feedback into predefined buckets
        </li>
        <li>
          <strong>Metadata extraction</strong> -- pull out tags, dates, names,
          or key facts from unstructured text
        </li>
        <li>
          <strong>Form generation</strong> -- have AI suggest form fields based
          on a description
        </li>
        <li>
          <strong>Data transformation</strong> -- convert freeform text into
          structured records for your database
        </li>
      </ul>

      <CodeBlock language="ts" filename="Example: Extracting contact info">
        {`const { output } = await generateText({
  model: "anthropic/claude-sonnet-4.5",
  output: Output.object({
    schema: z.object({
      name: z.string(),
      email: z.string().email().optional(),
      company: z.string().optional(),
      topics: z.array(z.string()),
    }),
  }),
  prompt: \`Extract contact info from this email:
    "Hi, I'm Sarah from Acme Corp. Reach me at sarah@acme.co.
     I'd love to discuss React and TypeScript consulting."\`,
});

// output: { name: "Sarah", email: "sarah@acme.co",
//           company: "Acme Corp", topics: ["React", "TypeScript"] }`}
      </CodeBlock>

      <Callout type="info" title="When to use structured output vs. plain text">
        Use <code>Output.object()</code> when you need to use the AI response as
        data in your application -- storing it in a database, displaying it in
        specific UI components, or passing it to other functions. Stick with
        plain <code>generateText</code> when you just need a text response to
        show the user.
      </Callout>

      <Quiz
        question="What does Output.object() do?"
        options={[
          {
            label: "It converts any JavaScript object into a string",
            explanation:
              "Output.object() works in the other direction -- it ensures the AI returns data matching a schema, not converting objects to strings.",
          },
          {
            label:
              "It defines a Zod schema so the AI returns a validated, typed object instead of raw text",
            correct: true,
            explanation:
              "Output.object() takes a Zod schema and ensures the AI response is validated against it. You get back a fully typed object that matches your schema, with automatic retries if validation fails.",
          },
          {
            label: "It caches the AI response as a JSON object",
            explanation:
              "Output.object() is about structuring the AI response, not caching. Caching is handled separately.",
          },
          {
            label: "It sends a JSON object to the AI as input",
            explanation:
              "Output.object() controls the shape of the AI output, not the input. The prompt string is how you send input to the AI.",
          },
        ]}
      />

      <HandsOn
        title="Auto-generate tags for blog posts"
        projectStep="Step 36 of 40 — Blog Platform Project"
        projectContext="Your blog has posts with titles and content, but no tags or categories. You will add an API route that uses AI to automatically generate tags for any post."
        steps={[
          "Install zod if you haven't already: run npm install zod in your terminal.",
          "Create a new API route at app/api/generate-tags/route.ts. Import generateText and Output from 'ai', and z from 'zod'. Create a POST handler that reads { content } from the request body, calls generateText with Output.object() using a schema of { tags: z.array(z.string()), category: z.string() }, and returns the output as JSON.",
          "Test it with curl: curl -X POST http://localhost:3000/api/generate-tags -H 'Content-Type: application/json' -d '{\"content\": \"Learn how to build React components with TypeScript\"}'. You should get back a JSON object with tags and a category.",
          "Open your blog post page component. Add a button labeled 'Generate Tags'. When clicked, it should fetch your new API route with the post content, then display the returned tags as badges below the post title.",
          "Test it end-to-end: navigate to a blog post, click Generate Tags, and verify that relevant tags appear on the page.",
        ]}
      />
    </div>
  );
}
