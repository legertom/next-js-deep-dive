import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function OptimisticUpdates() {
  return (
    <div className="prose">
      <h1>Optimistic Updates with useOptimistic</h1>

      <p>
        When a user clicks &ldquo;Like&rdquo; on a post, they expect the heart to
        fill immediately &mdash; not after a 200ms round trip to the server. Optimistic
        updates show the result of an action <em>before</em> the server confirms it.
        If the server fails, you roll back. React 19&apos;s <code>useOptimistic</code>
        hook makes this pattern first-class.
      </p>

      <h2>The Problem with Waiting</h2>

      <p>
        Without optimistic updates, every mutation follows this timeline:
      </p>

      <FlowDiagram
        steps={[
          { label: "User clicks", sublabel: "UI unchanged, spinner shows" },
          { label: "Server processes", sublabel: "50-500ms passes" },
          { label: "Response arrives", sublabel: "UI finally updates" },
        ]}
      />

      <p>
        This feels sluggish. The user wonders: &ldquo;Did my click register?&rdquo;
        Optimistic updates flip this around:
      </p>

      <FlowDiagram
        steps={[
          { label: "User clicks", sublabel: "UI updates immediately" },
          { label: "Server processes", sublabel: "Background request" },
          { label: "Confirmed or rolled back", sublabel: "UI stays or reverts" },
        ]}
      />

      <h2>The useOptimistic Hook</h2>

      <p>
        <code>useOptimistic</code> takes your current state and returns an optimistic
        version of it plus a function to trigger optimistic updates:
      </p>

      <CodeBlock filename="Signature" language="typescript">
{`const [optimisticState, addOptimistic] = useOptimistic(
  actualState,
  // Reducer: how to apply the optimistic update
  (currentState, optimisticValue) => newOptimisticState
);`}
      </CodeBlock>

      <p>
        The optimistic state automatically reverts to the real state when the
        parent Server Component re-renders with fresh data (after revalidation).
      </p>

      <h2>Real-World Example: Like Button</h2>

      <CodeBlock filename="app/posts/[id]/like-button.tsx" language="tsx">
{`"use client";

import { useOptimistic } from "react";
import { toggleLike } from "@/app/actions";

type Props = {
  postId: string;
  liked: boolean;
  likeCount: number;
};

export function LikeButton({ postId, liked, likeCount }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(
    { liked, likeCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      likeCount: newLiked ? state.likeCount + 1 : state.likeCount - 1,
    })
  );

  async function handleLike() {
    const newLiked = !optimistic.liked;
    setOptimistic(newLiked); // Update UI immediately
    await toggleLike(postId); // Send to server in background
  }

  return (
    <button onClick={handleLike} className="flex items-center gap-2">
      <span>{optimistic.liked ? "❤️" : "🤍"}</span>
      <span>{optimistic.likeCount}</span>
    </button>
  );
}`}
      </CodeBlock>

      <CodeBlock filename="app/actions.ts" language="typescript">
{`"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const existing = await db.like.findUnique({
    where: {
      postId_userId: { postId, userId: session.user.id },
    },
  });

  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
  } else {
    await db.like.create({
      data: { postId, userId: session.user.id },
    });
  }

  revalidatePath(\`/posts/\${postId}\`);
}`}
      </CodeBlock>

      <Callout type="tip" title="How rollback works">
        <p>
          You don&apos;t write rollback logic yourself. When the Server Action
          completes and <code>revalidatePath</code> triggers a re-render, the
          parent Server Component fetches fresh data from the database and passes
          new props to <code>LikeButton</code>. The <code>useOptimistic</code> hook
          automatically replaces the optimistic state with the real state. If the
          action failed, the real state reflects the original values &mdash;
          effectively a rollback.
        </p>
      </Callout>

      <h2>Real-World Example: Todo List</h2>

      <p>
        Optimistic updates shine in lists where users add items frequently.
        The new todo appears instantly while the server creates it in the database:
      </p>

      <CodeBlock filename="app/todos/todo-list.tsx" language="tsx">
{`"use client";

import { useOptimistic, useRef } from "react";
import { addTodo } from "@/app/actions";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export function TodoList({ todos }: { todos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTitle: string) => [
      ...state,
      {
        id: \`temp-\${Date.now()}\`,
        title: newTitle,
        completed: false,
      },
    ]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    if (!title.trim()) return;

    formRef.current?.reset();
    addOptimisticTodo(title); // Show immediately
    await addTodo(formData); // Persist on server
  }

  return (
    <div>
      <form ref={formRef} action={handleSubmit}>
        <input
          name="title"
          placeholder="Add a todo..."
          autoComplete="off"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li
            key={todo.id}
            className={todo.id.startsWith("temp-") ? "opacity-60" : ""}
          >
            {todo.title}
            {todo.id.startsWith("temp-") && (
              <span className="text-sm text-gray-400 ml-2">saving...</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}`}
      </CodeBlock>

      <CodeBlock filename="app/actions.ts" language="typescript">
{`"use server";

import { revalidatePath } from "next/cache";

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;

  await db.todo.create({
    data: { title, completed: false },
  });

  revalidatePath("/todos");
}`}
      </CodeBlock>

      <Callout type="important" title="Optimistic items need visual distinction">
        <p>
          In the todo example, temporary items get reduced opacity and a
          &ldquo;saving...&rdquo; label. This is important UX: users should know
          which items are confirmed vs. pending. If the server fails, the item
          disappears on re-render &mdash; without visual distinction, that would
          be confusing.
        </p>
      </Callout>

      <h2>When to Use Optimistic Updates</h2>

      <p>
        Not every action benefits from optimistic UI. Use it when:
      </p>

      <ul>
        <li><strong>The action almost always succeeds</strong> (likes, toggles, adding items)</li>
        <li><strong>Latency is noticeable</strong> and hurts the experience</li>
        <li><strong>The rollback is non-disruptive</strong> (a like disappearing is fine; a payment reverting is not)</li>
      </ul>

      <p>
        Avoid optimistic updates for:
      </p>

      <ul>
        <li>Actions with complex validation that might fail (signup, checkout)</li>
        <li>Destructive actions where a false positive is worse than a delay (deleting accounts)</li>
        <li>Actions where the result depends on server-side computation you can&apos;t predict</li>
      </ul>

      <h2>Error Handling Pattern</h2>

      <p>
        For cases where you want explicit error handling alongside optimistic updates,
        combine <code>useOptimistic</code> with try/catch:
      </p>

      <CodeBlock filename="app/components/follow-button.tsx" language="tsx">
{`"use client";

import { useOptimistic, useState } from "react";
import { toggleFollow } from "@/app/actions";

export function FollowButton({
  userId,
  isFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
    isFollowing,
    (_, newValue: boolean) => newValue
  );

  async function handleClick() {
    setError(null);
    setOptimisticFollowing(!optimisticFollowing);

    try {
      await toggleFollow(userId);
    } catch (e) {
      setError("Failed to update. Please try again.");
      // The revalidation from the failed action will revert
      // the optimistic state automatically
    }
  }

  return (
    <div>
      <button onClick={handleClick}>
        {optimisticFollowing ? "Unfollow" : "Follow"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}`}
      </CodeBlock>

      <Quiz
        question="What happens to the optimistic state when the Server Action completes and revalidatePath triggers a re-render?"
        options={[
          { label: "The optimistic state persists until you manually clear it" },
          { label: "The component unmounts and remounts" },
          {
            label: "The optimistic state is automatically replaced by the real state from the server",
            correct: true,
            explanation:
              "When the parent Server Component re-renders with fresh data (after revalidation), it passes updated props to the client component. useOptimistic automatically uses this new real state, replacing the optimistic version. If the action succeeded, they'll match. If it failed, the UI reverts to the actual server state.",
          },
          { label: "You must call a resetOptimistic function" },
        ]}
      />

      <Quiz
        question="Which scenario is NOT a good fit for optimistic updates?"
        options={[
          { label: "A like button that toggles on click" },
          { label: "Adding a message to a chat thread" },
          {
            label: "A payment form that charges a credit card",
            correct: true,
            explanation:
              "Payment processing has significant failure rates (declined cards, insufficient funds, fraud checks) and showing a false 'Payment successful' state would be very confusing and potentially harmful. Actions with high failure rates or where false positives are dangerous should wait for server confirmation.",
          },
          { label: "Toggling a todo item as complete" },
        ]}
      />

      <HandsOn
        title="Build an Optimistic Todo App"
        steps={[
          "Create a Server Component that fetches todos from a database (or a JSON file for simplicity)",
          "Build a client component TodoList that receives todos as props",
          "Use useOptimistic to show new todos immediately when the form is submitted",
          "Style optimistic (unconfirmed) todos with reduced opacity to distinguish them",
          "Add a Server Action that creates the todo and calls revalidatePath",
          "Test by adding artificial delay (await new Promise(r => setTimeout(r, 2000))) in your action to see the optimistic state clearly",
          "Bonus: Add a delete button with optimistic removal — the item disappears instantly, then the server confirms",
        ]}
      />
    </div>
  );
}
