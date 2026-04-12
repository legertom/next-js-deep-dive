import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function WhatAreServerActions() {
  return (
    <div className="prose">
      <h1>What Are Server Actions?</h1>

      <p>
        In traditional React apps, when you need to mutate data &mdash; create a
        user, update a post, delete a comment &mdash; you write an API route on the
        server and call <code>fetch()</code> from the client. Server Actions eliminate
        that entire ceremony. They let you write a function that runs on the server
        and call it directly from your components, as if it were a local function.
      </p>

      <h2>The Problem Server Actions Solve</h2>

      <p>
        Consider what it takes to submit a form without Server Actions:
      </p>

      <ol>
        <li>Create an API route (e.g., <code>app/api/posts/route.ts</code>)</li>
        <li>Write a POST handler that parses the request body</li>
        <li>On the client, wire up a form submission handler</li>
        <li>Call <code>fetch(&apos;/api/posts&apos;, ...)</code> with the right headers</li>
        <li>Handle loading states, errors, and success redirects manually</li>
      </ol>

      <p>
        That&apos;s five steps of boilerplate for every mutation. Server Actions
        collapse all of this into a single function.
      </p>

      <FlowDiagram
        steps={[
          { label: "Without Server Actions", sublabel: "Component → fetch() → API Route → DB" },
          { label: "With Server Actions", sublabel: "Component → Server Action → DB" },
        ]}
      />

      <h2>The &quot;use server&quot; Directive</h2>

      <p>
        The <code>&quot;use server&quot;</code> directive marks a function (or an entire
        file) as a Server Action. It tells Next.js: &ldquo;This code should only ever
        execute on the server. Generate an HTTP endpoint for it automatically and let
        clients invoke it via RPC.&rdquo;
      </p>

      <CodeBlock filename="app/actions.ts" language="typescript">
{`"use server";

// Every exported function in this file is a Server Action.
// They run ONLY on the server — never shipped to the client bundle.

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await db.post.create({
    data: { title, content },
  });

  revalidatePath("/posts");
}`}
      </CodeBlock>

      <p>
        You can also define Server Actions inline within Server Components:
      </p>

      <CodeBlock filename="app/posts/page.tsx" language="tsx">
{`export default function PostsPage() {
  async function deletePost(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await db.post.delete({ where: { id } });
    revalidatePath("/posts");
  }

  return (
    <form action={deletePost}>
      <input type="hidden" name="id" value="123" />
      <button type="submit">Delete Post</button>
    </form>
  );
}`}
      </CodeBlock>

      <Callout type="important" title="Server Actions are HTTP endpoints">
        <p>
          Under the hood, Next.js creates a POST endpoint for each Server Action.
          When a client calls the action, it sends a POST request with the
          arguments serialized. This means Server Actions are publicly accessible
          endpoints &mdash; you must always validate inputs and check authorization,
          just as you would with any API route.
        </p>
      </Callout>

      <h2>RPC-Style Mutations</h2>

      <p>
        Server Actions work like Remote Procedure Calls (RPC). You define a function
        on the server and invoke it from the client. The framework handles serialization,
        network transport, and deserialization transparently.
      </p>

      <CodeBlock filename="app/components/like-button.tsx" language="tsx">
{`"use client";

import { likePost } from "@/app/actions";

export function LikeButton({ postId }: { postId: string }) {
  return (
    <button onClick={() => likePost(postId)}>
      Like
    </button>
  );
}`}
      </CodeBlock>

      <CodeBlock filename="app/actions.ts" language="typescript">
{`"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function likePost(postId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.like.create({
    data: { postId, userId: session.user.id },
  });

  revalidatePath(\`/posts/\${postId}\`);
}`}
      </CodeBlock>

      <p>
        Notice how <code>likePost</code> is imported and called as if it were a
        normal function. The client component doesn&apos;t know or care that it
        executes on a different machine. This is the RPC abstraction at work.
      </p>

      <h2>How They Replace API Routes for Mutations</h2>

      <p>
        API routes (<code>route.ts</code>) are still useful for webhooks, third-party
        integrations, and public APIs. But for mutations triggered by your own UI,
        Server Actions are almost always the better choice:
      </p>

      <ul>
        <li><strong>Less boilerplate:</strong> No manual fetch calls, no request/response parsing</li>
        <li><strong>Type safety:</strong> Arguments and return values are fully typed end-to-end</li>
        <li><strong>Progressive enhancement:</strong> When used with forms, they work without JavaScript</li>
        <li><strong>Automatic revalidation:</strong> Pair with <code>revalidatePath</code> or <code>revalidateTag</code> to refresh data</li>
      </ul>

      <h2>Security Considerations</h2>

      <p>
        Because Server Actions are exposed as HTTP endpoints, treat them with the
        same security rigor as API routes:
      </p>

      <CodeBlock filename="app/actions.ts" language="typescript">
{`"use server";

import { auth } from "@/lib/auth";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  // 1. Authentication — who is making this request?
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // 2. Input validation — never trust client data
  const raw = {
    name: formData.get("name"),
    bio: formData.get("bio"),
  };
  const parsed = UpdateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  // 3. Authorization — can THIS user do THIS action?
  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Forbidden");

  // 4. Mutation — only after all checks pass
  await db.profile.update({
    where: { userId: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/profile");
}`}
      </CodeBlock>

      <Callout type="warning" title="Never trust the closure">
        <p>
          When you define a Server Action inside a Server Component, any variables
          from the component scope that the action closes over are serialized and
          sent to the client as an encrypted hidden field. While they&apos;re
          encrypted, you should never rely on closure variables for security-sensitive
          values like user IDs. Always re-fetch the session inside the action.
        </p>
      </Callout>

      <Quiz
        question="What does the 'use server' directive do when placed at the top of a file?"
        options={[
          { label: "It makes the file a Server Component" },
          {
            label: "It marks all exported functions in the file as Server Actions that execute only on the server",
            correct: true,
            explanation:
              "The 'use server' directive at the top of a file tells Next.js that every exported async function is a Server Action. These functions will only run on the server and will be exposed as POST endpoints that clients can invoke via RPC.",
          },
          { label: "It prevents the file from being imported by client components" },
          { label: "It enables server-side rendering for the file" },
        ]}
      />

      <Quiz
        question="Why must you always validate inputs and check authentication inside a Server Action?"
        options={[
          { label: "Because TypeScript types aren't checked at runtime" },
          { label: "Because Server Components might pass wrong data" },
          {
            label: "Because Server Actions are exposed as public HTTP endpoints that anyone can call",
            correct: true,
            explanation:
              "Server Actions are compiled into POST endpoints. A malicious user could call them directly with crafted payloads, bypassing your UI entirely. You must validate every input and verify authentication/authorization inside the action itself.",
          },
          { label: "Because Next.js doesn't do any validation automatically" },
        ]}
      />

      <HandsOn
        title="Create Your First Server Action"
        steps={[
          "Create a new file app/actions.ts with 'use server' at the top",
          "Write a createTodo action that accepts FormData, extracts a 'title' field, and logs it to the console",
          "Create a page with a form whose action prop points to your Server Action",
          "Submit the form and verify the log appears in your terminal (server), not the browser console",
          "Add input validation using Zod — reject titles shorter than 3 characters and return an error object",
          "Bonus: Add an auth check that throws if no session exists (mock it with a hardcoded check for now)",
        ]}
      />
    </div>
  );
}
