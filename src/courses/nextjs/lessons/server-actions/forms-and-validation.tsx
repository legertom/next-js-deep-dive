import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";
import { ShortAnswer } from "@/components/short-answer";

export function FormsAndValidation() {
  return (
    <div className="prose">
      <h1>Forms and Validation with Server Actions</h1>

      <p>
        HTML forms have worked for decades without JavaScript. Server Actions bring
        that simplicity back while adding the power of React&apos;s component model.
        By passing a Server Action to a form&apos;s <code>action</code> prop, you get
        mutations that work before JavaScript loads, with pending states and error
        handling layered on top.
      </p>

      <h2>The action Prop</h2>

      <p>
        React 19 extended the <code>&lt;form&gt;</code> element to accept a function
        as its <code>action</code> prop. When the form submits, React calls your
        Server Action with the <code>FormData</code> object automatically:
      </p>

      <CodeBlock filename="app/contact/page.tsx" language="tsx">
{`import { sendMessage } from "@/app/actions";

export default function ContactPage() {
  return (
    <form action={sendMessage}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" required />

      <button type="submit">Send</button>
    </form>
  );
}`}
      </CodeBlock>

      <CodeBlock filename="app/actions.ts" language="typescript">
{`"use server";

import { redirect } from "next/navigation";

export async function sendMessage(formData: FormData) {
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  await db.message.create({
    data: { email, message },
  });

  redirect("/contact/success");
}`}
      </CodeBlock>

      <FlowDiagram
        steps={[
          { label: "User submits form", sublabel: "Browser creates FormData" },
          { label: "POST to Server Action", sublabel: "FormData sent to server" },
          { label: "Action executes", sublabel: "Validates, mutates DB" },
          { label: "Response", sublabel: "Redirect or return result" },
        ]}
      />

      <h2>Progressive Enhancement</h2>

      <p>
        This is one of the most powerful features of Server Actions with forms.
        Because the form uses standard HTML submission semantics, it works even
        when JavaScript hasn&apos;t loaded yet or is disabled:
      </p>

      <ul>
        <li><strong>Without JS:</strong> The browser does a full-page form submission to the Server Action endpoint. The action runs, and the server responds with a redirect or new page.</li>
        <li><strong>With JS:</strong> React intercepts the submission, sends it via fetch, and updates the UI without a full page reload. You get seamless SPA-like behavior.</li>
      </ul>

      <Callout type="tip" title="Progressive enhancement is free">
        <p>
          You don&apos;t need to write any extra code for progressive enhancement.
          If your form uses the <code>action</code> prop with a Server Action, it
          works with and without JavaScript automatically. This is great for
          forms that matter &mdash; login, checkout, critical data entry.
        </p>
      </Callout>

      <h2>useActionState for Pending States and Errors</h2>

      <p>
        Real forms need feedback: loading spinners, error messages, success states.
        React 19&apos;s <code>useActionState</code> hook (imported from <code>react</code>)
        wraps a Server Action and gives you state management for free:
      </p>

      <CodeBlock filename="app/signup/signup-form.tsx" language="tsx">
{`"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions";

const initialState = {
  error: null as string | null,
  success: false,
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signup,
    initialState
  );

  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" required />

      {state.error && (
        <p className="text-red-500">{state.error}</p>
      )}

      {state.success && (
        <p className="text-green-500">Account created!</p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}`}
      </CodeBlock>

      <CodeBlock filename="app/actions.ts" language="typescript">
{`"use server";

import { z } from "zod";

const SignupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signup(
  previousState: { error: string | null; success: boolean },
  formData: FormData
) {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
      success: false,
    };
  }

  const existingUser = await db.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { error: "Email already taken", success: false };
  }

  await db.user.create({
    data: {
      email: parsed.data.email,
      password: await hash(parsed.data.password),
    },
  });

  return { error: null, success: true };
}`}
      </CodeBlock>

      <Callout type="important" title="useActionState signature">
        <p>
          When using <code>useActionState</code>, your Server Action receives the
          <strong> previous state</strong> as its first argument and <code>FormData</code> as
          its second. This is different from a plain Server Action which only receives
          <code>FormData</code>. The hook returns <code>[state, wrappedAction, isPending]</code>.
        </p>
      </Callout>

      <h2>Server-Side Validation Patterns</h2>

      <p>
        Client-side validation (HTML attributes like <code>required</code>, or JS
        libraries) provides instant feedback. But it&apos;s easily bypassed. Server
        Actions are your last line of defense &mdash; always validate on the server.
      </p>

      <p>
        A robust pattern returns structured errors that your form can display
        field-by-field:
      </p>

      <CodeBlock filename="app/actions.ts" language="typescript">
{`"use server";

import { z } from "zod";

const CreatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.enum(["tech", "design", "business"], {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
});

type FormState = {
  errors: Record<string, string[]>;
  message: string | null;
};

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = CreatePostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Validation failed",
    };
  }

  try {
    await db.post.create({ data: parsed.data });
  } catch (e) {
    return {
      errors: {},
      message: "Database error. Please try again.",
    };
  }

  redirect("/posts");
}`}
      </CodeBlock>

      <CodeBlock filename="app/posts/new/form.tsx" language="tsx">
{`"use client";

import { useActionState } from "react";
import { createPost } from "@/app/actions";

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPost, {
    errors: {},
    message: null,
  });

  return (
    <form action={formAction}>
      <div>
        <input name="title" placeholder="Post title" />
        {state.errors.title && (
          <p className="text-red-500 text-sm">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <textarea name="content" placeholder="Write your post..." />
        {state.errors.content && (
          <p className="text-red-500 text-sm">{state.errors.content[0]}</p>
        )}
      </div>

      <div>
        <select name="category">
          <option value="">Select category</option>
          <option value="tech">Tech</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
        </select>
        {state.errors.category && (
          <p className="text-red-500 text-sm">{state.errors.category[0]}</p>
        )}
      </div>

      {state.message && (
        <p className="text-red-500">{state.message}</p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? "Publishing..." : "Publish Post"}
      </button>
    </form>
  );
}`}
      </CodeBlock>

      <Callout type="warning" title="Never rely on client-side validation alone">
        <p>
          HTML validation attributes (<code>required</code>, <code>minLength</code>,
          <code>pattern</code>) and JavaScript validation libraries are UX
          enhancements, not security measures. A user can open DevTools and remove
          them. Your Server Action must validate every field independently.
        </p>
      </Callout>

      <Quiz
        question="What is the key benefit of using the form's action prop with a Server Action instead of an onSubmit handler with fetch?"
        options={[
          { label: "It's faster because it skips HTTP" },
          {
            label: "The form works even before JavaScript loads (progressive enhancement)",
            correct: true,
            explanation:
              "When you use the action prop, the form leverages native HTML form submission. If JavaScript hasn't loaded yet, the browser submits the form as a standard POST request. Once JS hydrates, React enhances it with client-side submission. This ensures the form always works.",
          },
          { label: "It provides automatic client-side validation" },
          { label: "It allows GET requests instead of POST" },
        ]}
      />

      <Quiz
        question="When using useActionState, what is the first argument your Server Action receives?"
        options={[
          { label: "The FormData object" },
          { label: "The event object" },
          {
            label: "The previous state returned by the last invocation",
            correct: true,
            explanation:
              "useActionState wraps your action so that it receives (previousState, formData) instead of just (formData). The previous state is whatever the action returned last time (or the initial state on first call). This lets you build up state across submissions — like accumulating errors.",
          },
          { label: "The form element reference" },
        ]}
      />

      <HandsOn
        title={'Build a "New Post" form with a Server Action'}
        projectStep="Step 28 of 40 — Blog Platform Project"
        projectContext="You have a working Server Action in app/actions.ts from the last exercise. Now turn it into a real form that creates blog posts."
        steps={[
          "Create a new page at app/posts/new/page.tsx. Add a <form> with two inputs: <input name='title' placeholder='Post title' /> and <textarea name='content' placeholder='Write your post...' />. Add a <button type='submit'>Publish</button> at the end.",
          "In app/actions.ts, update your createPost function to read both fields: const title = formData.get('title') and const content = formData.get('content'). For now, just console.log them both. Pass createPost to the form's action prop.",
          "Go to /posts/new in your browser, fill in both fields, and click Publish. Check your terminal — you should see the title and content printed there.",
          "Now add a redirect after the action succeeds: import { redirect } from 'next/navigation' at the top of actions.ts, and add redirect('/posts') as the last line of createPost. Submit the form again — you should be sent back to the posts page automatically.",
          "Try submitting the form with empty fields. Notice it still works — in a real app you would add validation. For now, add the HTML required attribute to both inputs so the browser blocks empty submissions.",
        ]}
      />

      <ShortAnswer
        question="The `action` prop on `<form>` plus `useActionState` give you progressive enhancement — the form works even before JavaScript hydrates. Why is this valuable, and what changes the moment JS finishes loading?"
        rubric={[
          "Before JS hydrates, the form falls back to native HTML submission: a real navigation happens, the server handles the form, the page reloads with the result — the form is functional immediately",
          "After hydration, React intercepts the submit, sends FormData via fetch, applies the response (including useActionState updates) without a full reload — fast, stateful, no page flash",
          "Bonus: notes the value for users on slow connections or cheap devices — the form is usable during the entire first-paint-to-interactive window, not just after JS finishes",
        ]}
        topic="How form actions enable progressive enhancement"
      />
    </div>
  );
}
