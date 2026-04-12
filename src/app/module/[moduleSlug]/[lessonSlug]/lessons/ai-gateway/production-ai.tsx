import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";

export function ProductionAi() {
  return (
    <div className="prose">
      <h1>Production AI: Errors, Streaming, and Costs</h1>

      <p className="lead">
        Your AI features work in development. But production is a different
        world &mdash; APIs go down, rate limits kick in, and costs add up. This
        lesson covers the patterns you need to ship AI features that are
        reliable, fast, and affordable.
      </p>

      <h2>Error Handling: Plan for Failure</h2>

      <p>
        AI APIs fail. Providers have rate limits. Networks time out. If you
        don&apos;t handle these failures, your users see a blank screen or a
        cryptic error. That&apos;s a terrible experience.
      </p>

      <p>
        The fix is simple: wrap your AI calls in a try/catch and return a
        friendly message when something goes wrong.
      </p>

      <CodeBlock filename="app/api/chat/route.ts" language="ts">
{`import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      prompt,
    });

    return Response.json({ text: result.text });
  } catch (error) {
    console.error("AI error:", error);

    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}`}
      </CodeBlock>

      <p>
        The user never sees a stack trace or a raw error object. They see a
        clear message telling them to try again. Meanwhile, the real error is
        logged to your server console so you can debug it.
      </p>

      <Callout type="tip" title="Common AI API errors">
        <p>
          The most common failures are <strong>rate limits</strong> (you sent
          too many requests), <strong>timeouts</strong> (the model took too long
          to respond), and <strong>invalid requests</strong> (bad model string
          or missing parameters). A good try/catch handles all of them the same
          way &mdash; log the error, tell the user something friendly.
        </p>
      </Callout>

      <h2>Streaming: Show Progress Immediately</h2>

      <p>
        When you use <code>generateText</code>, the user waits for the entire
        response before seeing anything. For short responses that&apos;s fine.
        But for longer responses &mdash; like a blog summary or a chat reply
        &mdash; the wait feels painfully slow.
      </p>

      <p>
        <code>streamText</code> fixes this. It sends words to the user as the
        model generates them. The user sees progress right away instead of
        staring at a loading spinner.
      </p>

      <p>
        Here is when to use each:
      </p>

      <ul>
        <li>
          <strong>generateText</strong> &mdash; background tasks, server-side
          processing, short responses where waiting is fine
        </li>
        <li>
          <strong>streamText</strong> &mdash; user-facing features, long
          responses, chat interfaces where immediate feedback matters
        </li>
      </ul>

      <Quiz
        question="When should you use streamText instead of generateText?"
        options={[
          {
            label: "Always — streaming is better in every situation",
            explanation:
              "Not always. For background tasks where no user is watching, generateText is simpler and works great.",
          },
          {
            label:
              "For user-facing features where showing progress improves the experience",
            correct: true,
            explanation:
              "Exactly. When a user is waiting for a response, streaming lets them see words appear immediately instead of waiting for the full response.",
          },
          {
            label: "Only for chat interfaces",
            explanation:
              "Chat is a great use case, but streaming helps any user-facing feature with longer responses — summaries, explanations, content generation, and more.",
          },
          {
            label: "Never — generateText is always better",
            explanation:
              "generateText is simpler, but for user-facing features the wait time without streaming leads to a poor experience.",
          },
        ]}
      />

      <h2>Cost Awareness: Choose the Right Model</h2>

      <p>
        Different models have very different costs. Using the most powerful
        model for every request is like taking a helicopter to the grocery
        store &mdash; it works, but it&apos;s expensive and unnecessary.
      </p>

      <CodeBlock filename="Choosing the right model" language="ts">
{`// Fast and cheap — good for simple tasks like classification
model: "anthropic/claude-haiku-4.5"

// Balanced — good for most features like summaries and chat
model: "anthropic/claude-sonnet-4.5"

// Most capable — good for complex reasoning and analysis
model: "anthropic/claude-opus-4.6"`}
      </CodeBlock>

      <p>
        Think about what your feature actually needs. A simple &quot;categorize
        this blog post&quot; task does not need the most powerful model. Save
        the expensive models for tasks that genuinely need deep reasoning.
      </p>

      <Callout type="info" title="Monitor your costs in the Vercel dashboard">
        <p>
          Every AI request through AI Gateway is logged in the Vercel dashboard.
          You can see token usage, estimated costs, latency, and error rates
          for every request. Use this data to spot expensive routes and switch
          them to cheaper models when the quality is good enough.
        </p>
      </Callout>

      <h2>Observability: See What Your AI Is Doing</h2>

      <p>
        Once your app is in production, you need to know what&apos;s happening
        with your AI features. The Vercel dashboard gives you this for free
        when you use AI Gateway:
      </p>

      <ul>
        <li>
          <strong>Request logs</strong> &mdash; every AI call, with the model
          used and the response time
        </li>
        <li>
          <strong>Latency tracking</strong> &mdash; see which models are fast
          and which are slow
        </li>
        <li>
          <strong>Cost breakdown</strong> &mdash; token usage and estimated
          costs per request
        </li>
        <li>
          <strong>Error rates</strong> &mdash; catch failures before your users
          report them
        </li>
      </ul>

      <p>
        This is the kind of monitoring that normally takes weeks to build. With
        AI Gateway, it is there from day one.
      </p>

      <Quiz
        question="Why is it important to choose different models for different tasks?"
        options={[
          {
            label: "Smaller models are always more accurate",
            explanation:
              "Actually, larger models tend to be more capable. The point is that simpler tasks don't need that extra capability.",
          },
          {
            label:
              "Different models have different costs — simpler tasks can use cheaper, faster models",
            correct: true,
            explanation:
              "Right. A classification task doesn't need the most powerful model. Using a smaller model saves money and often responds faster too.",
          },
          {
            label: "You can only use one model per project",
            explanation:
              "You can use different models for different API routes. A chat feature might use a powerful model while a tagging feature uses a cheaper one.",
          },
          {
            label: "It doesn't matter — all models cost the same",
            explanation:
              "Models have very different pricing. Using the right model for each task can significantly reduce your AI costs.",
          },
        ]}
      />

      <HandsOn
        title={"Add error handling to your blog's AI features"}
        projectStep="Step 40 of 40 — Blog Platform Project"
        projectContext="Your blog has working AI features. Now you will make them production-ready with proper error handling."
        steps={[
          "Open your AI API route (app/api/chat/route.ts). Look at how the AI call is made — it probably does not have a try/catch around it yet.",
          "Wrap the entire AI call in a try/catch block, just like the example above. In the catch block, log the error with console.error and return a Response.json with a friendly error message and status 500.",
          'Test the error handling by temporarily changing your model string to something invalid like "fake/not-a-model". Start your dev server and send a message. You should see your friendly error message instead of a crash.',
          'Fix the model string back to "anthropic/claude-sonnet-4.5" (or whichever model you prefer). Send another message and confirm everything works normally again.',
          "Congratulations — you have completed the entire course! Your blog now has AI features, and you know Next.js inside and out.",
        ]}
      />

      <h2>You Did It!</h2>

      <p>
        Take a moment to appreciate what you have built. You started with{" "}
        <code>npx create-next-app</code> and ended up with a full blog
        platform powered by AI. Along the way you learned routing, layouts,
        server components, client components, data fetching, caching, forms,
        authentication, middleware, deployment, and AI integration.
      </p>

      <p>
        That is a <em>lot</em> of ground to cover, and you covered all of it.
        You are not just someone who has &quot;used&quot; Next.js &mdash; you
        understand how it works under the hood.
      </p>

      <p>
        Now go build something amazing. You have the skills. Ship it.
      </p>
    </div>
  );
}
