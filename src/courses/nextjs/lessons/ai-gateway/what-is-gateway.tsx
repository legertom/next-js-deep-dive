import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FlowDiagram } from "@/components/diagram";
import { ShortAnswer } from "@/components/short-answer";

export function WhatIsGateway() {
  return (
    <div className="prose">
      <h1>What is AI Gateway?</h1>

      <p className="lead">
        You want to use AI in your app. But which provider do you pick &mdash;
        Anthropic, OpenAI, Google? What if you want to switch later? AI Gateway
        gives you one unified API for all of them. Change a single string and
        your app talks to a completely different AI provider.
      </p>

      <h2>The Problem: Too Many APIs</h2>

      <p>
        Every AI provider has its own SDK, its own authentication, and its own
        quirks. If you start with OpenAI and later want to try Anthropic, you
        need to swap out the SDK, change the authentication, and rewrite parts of
        your code. That&apos;s friction you don&apos;t need.
      </p>

      <p>
        Vercel AI Gateway solves this. It sits between your app and the AI
        providers, giving you a single API that works with all of them.
      </p>

      <h2>How It Works</h2>

      <FlowDiagram
        steps={[
          { label: "Your App", sublabel: "calls AI Gateway" },
          { label: "AI Gateway", sublabel: "routes the request" },
          { label: "Provider", sublabel: "Anthropic / OpenAI / Google" },
          { label: "Response", sublabel: "streams back to your app", color: "green" },
        ]}
      />

      <p>
        Your code calls AI Gateway with a model string like{" "}
        <code>&quot;anthropic/claude-sonnet-4.5&quot;</code>. Gateway reads the
        provider prefix, forwards the request to the right API, and streams the
        response back. You never talk to the provider directly.
      </p>

      <h2>The Model String</h2>

      <p>
        The key concept is the <strong>model string</strong>. It follows the
        format <code>provider/model-name</code>:
      </p>

      <CodeBlock filename="Model string examples" language="text">
{`anthropic/claude-sonnet-4.5    → Anthropic's Claude Sonnet 4.5
openai/gpt-4o                  → OpenAI's GPT-4o
google/gemini-2.0-flash        → Google's Gemini 2.0 Flash`}
      </CodeBlock>

      <p>
        That&apos;s it. The provider is everything before the slash. The model
        name is everything after it. When you want to switch providers, you
        change the string.
      </p>

      <h2>Same Code, Different Models</h2>

      <p>
        Here is the magic. Your code stays exactly the same &mdash; only the
        model string changes:
      </p>

      <CodeBlock filename="app/api/chat/route.ts" language="ts">
{`import { generateText } from "ai";

// Use Anthropic
const result = await generateText({
  model: "anthropic/claude-sonnet-4.5",
  prompt: "Summarize this blog post",
});

// Use OpenAI — same code, different model string
const result = await generateText({
  model: "openai/gpt-4o",
  prompt: "Summarize this blog post",
});

// Use Google — still the same code
const result = await generateText({
  model: "google/gemini-2.0-flash",
  prompt: "Summarize this blog post",
});`}
      </CodeBlock>

      <p>
        No SDK swaps. No authentication changes. No code rewrites. Just a
        different string.
      </p>

      <Callout type="tip" title="Gateway is the default provider">
        <p>
          In the AI SDK, AI Gateway is the default provider. When you pass a
          plain string like <code>&quot;anthropic/claude-sonnet-4.5&quot;</code>{" "}
          as the model, the SDK automatically routes it through AI Gateway. You
          don&apos;t need to import anything extra.
        </p>
      </Callout>

      <h2>Setting Up Your API Key</h2>

      <p>
        AI Gateway uses a single API key for all providers. You get this key from
        the Vercel dashboard and add it to your environment:
      </p>

      <CodeBlock filename=".env.local" language="bash">
{`AI_GATEWAY_API_KEY=your_api_key_here`}
      </CodeBlock>

      <p>
        One key. Every provider. The AI SDK picks up this environment variable
        automatically &mdash; you don&apos;t need to pass it in your code.
      </p>

      <h2>What You Get for Free</h2>

      <h3>Zero Data Retention</h3>

      <p>
        Vercel does not store your prompts or responses. Your data flows through
        the gateway and goes straight to the provider. Nothing is saved on
        Vercel&apos;s side.
      </p>

      <h3>Built-in Observability</h3>

      <p>
        Every request through AI Gateway is logged in the Vercel dashboard. You
        can see:
      </p>

      <ul>
        <li>How many requests each model is handling</li>
        <li>Response latency for every call</li>
        <li>Token usage and estimated costs</li>
        <li>Error rates and failed requests</li>
      </ul>

      <p>
        This is the kind of monitoring you would normally need to build yourself.
        With Gateway, it&apos;s there from day one.
      </p>

      <h3>One Bill</h3>

      <p>
        Instead of managing API keys and billing accounts with three or four
        different providers, you get a single bill through Vercel. Less
        administration, fewer surprises.
      </p>

      <Callout type="info" title="You can also use providers directly">
        <p>
          AI Gateway is optional. If you prefer to use a provider&apos;s SDK
          directly (for example, <code>@ai-sdk/anthropic</code>), you absolutely
          can. Gateway just makes it easier to work with multiple providers and
          gives you observability for free.
        </p>
      </Callout>

      <Quiz
        question="What does AI Gateway give you that calling providers directly doesn't?"
        options={[
          {
            label: "Faster AI responses",
            explanation:
              "AI Gateway doesn't make responses faster. It routes requests to the same provider APIs you would call directly.",
          },
          {
            label: "A unified API for all providers, plus built-in observability",
            correct: true,
            explanation:
              "Exactly. One API, one key, one bill, and a dashboard showing every request. Switching providers is a one-line change.",
          },
          {
            label: "Access to exclusive AI models",
            explanation:
              "AI Gateway uses the same models available directly from each provider. It doesn't offer exclusive models.",
          },
          {
            label: "Free unlimited AI usage",
            explanation:
              "AI Gateway still charges for token usage. You pay through Vercel instead of each provider individually.",
          },
        ]}
      />

      <HandsOn
        title={"Switch your blog's AI to use a different model"}
        projectStep="Step 39 of 40 — Blog Platform Project"
        projectContext="Your blog already uses AI through the AI SDK. Now you will see how easy it is to switch providers with AI Gateway."
        steps={[
          'Open your blog\'s AI API route (something like app/api/chat/route.ts). Find the model string — it probably looks like "anthropic/claude-sonnet-4.5".',
          'Change the model string to "openai/gpt-4o". That is it — one string changed, completely different AI provider.',
          "Start your dev server and test it. Ask your blog AI a question. The response comes from OpenAI now instead of Anthropic.",
          'Change it back to "anthropic/claude-sonnet-4.5" (or whichever model you prefer). That is the power of AI Gateway — switching providers is a one-line change.',
        ]}
      />

      <ShortAnswer
        question="AI Gateway lets you switch from `anthropic/claude-sonnet-4.5` to `openai/gpt-4o` with a one-line change. Beyond convenience, what production-grade benefits does using a Gateway provide?"
        rubric={[
          "Failover and fallbacks: if a provider is down or rate-limited, Gateway can automatically route to a configured backup model so your app stays up",
          "Centralized observability: every request flows through one place, so logging, cost tracking, and rate-limit management work uniformly across providers — instead of scattered per-provider dashboards",
          "Bonus: notes that Gateway also handles authentication once (no API keys sprinkled through your code), supports zero-data-retention policies, and lets you A/B-test models with no code change",
        ]}
        topic="Production benefits of AI Gateway beyond model switching"
      />
    </div>
  );
}
