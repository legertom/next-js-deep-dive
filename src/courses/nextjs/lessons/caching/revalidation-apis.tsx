import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function RevalidationApis() {
  return (
    <div>
      <h1>Revalidation APIs</h1>
      <p className="lead">
        Cache lifetimes handle time-based expiration, but what about when data changes and you need to invalidate the cache immediately? Next.js 16 provides three revalidation APIs, each designed for a different scenario: <code>revalidateTag</code>, <code>updateTag</code>, and <code>refresh</code>.
      </p>

      <h2>Tagging Cached Content</h2>
      <p>
        Before you can revalidate content on demand, you need to <strong>tag</strong> it. Tags are labels you attach to cached content so you can target it for invalidation later.
      </p>

      <CodeBlock filename="lib/blog.ts" language="typescript" highlight={[6]}>
{`import { cacheLife, cacheTag } from 'next/cache'

export async function getBlogPost(slug: string) {
  "use cache"
  cacheLife('days')
  cacheTag('blog', \`post-\${slug}\`)

  const res = await fetch(\`https://cms.example.com/posts/\${slug}\`)
  return res.json()
}`}
      </CodeBlock>

      <p>
        In this example, the cached blog post is tagged with both <code>&quot;blog&quot;</code> (to invalidate all blog content at once) and <code>&quot;post-my-slug&quot;</code> (to invalidate just that specific post). You can attach as many tags as you need.
      </p>

      <Callout type="info">
        <p>Tags are strings -- keep them descriptive and consistent. A common pattern is to use a category tag (<code>&quot;blog&quot;</code>, <code>&quot;products&quot;</code>) plus a specific identifier tag (<code>&quot;post-123&quot;</code>, <code>&quot;product-abc&quot;</code>).</p>
      </Callout>

      <h2>revalidateTag -- Eventual Consistency</h2>
      <p>
        The <code>revalidateTag</code> function purges cached content matching a tag. In Next.js 16, it has been updated to require a <strong>cacheLife profile</strong> as its second argument:
      </p>

      <CodeBlock filename="app/admin/actions.ts" language="typescript" highlight={[5, 8]}>
{`"use server"

import { revalidateTag } from 'next/cache'

export async function publishPost(slug: string) {
  await db.posts.update({ slug, status: 'published' })

  // Invalidate the specific post AND the blog listing
  revalidateTag(\`post-\${slug}\`, 'days')
  revalidateTag('blog', 'days')
}`}
      </CodeBlock>

      <Callout type="warning" title="New in Next.js 16: profile argument required">
        <p>Unlike older versions, <code>revalidateTag</code> now requires a cacheLife profile as the second argument (e.g., <code>&apos;max&apos;</code>, <code>&apos;hours&apos;</code>, <code>&apos;days&apos;</code>, or a custom profile name). This tells Next.js what freshness guarantee the new content should have when it is regenerated.</p>
      </Callout>

      <p>
        <code>revalidateTag</code> provides <strong>eventual consistency</strong>. When you call it:
      </p>

      <FlowDiagram
        steps={[
          { label: "Action Runs", sublabel: "Data mutated" },
          { label: "Tag Purged", sublabel: "Cache invalidated" },
          { label: "Next Request", sublabel: "Regenerates content", color: "border-amber-300 bg-amber-50 text-amber-800" },
          { label: "Users See Update", sublabel: "Eventually consistent", color: "border-green-300 bg-green-50 text-green-800" },
        ]}
      />

      <p>
        The key word is <em>eventually</em>. The user who triggered the action might still see old content briefly until the regeneration completes. This is fine for most scenarios (publishing a blog post, updating a product), but not ideal when the user expects to immediately see their own change.
      </p>

      <h2>updateTag -- Read-Your-Writes</h2>
      <p>
        <code>updateTag</code> is brand new in Next.js 16 and solves the &quot;I just saved, why don&apos;t I see my changes?&quot; problem. It provides <strong>read-your-writes semantics</strong>: the user who triggered the mutation is guaranteed to see the updated content immediately.
      </p>

      <CodeBlock filename="app/profile/actions.ts" language="typescript" highlight={[8]}>
{`"use server"

import { updateTag } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const name = formData.get('name') as string
  await db.users.update({ id: currentUser.id, name })

  // The current user will immediately see their updated profile
  updateTag('user-profile')
}`}
      </CodeBlock>

      <Callout type="important" title="Server Actions only">
        <p><code>updateTag</code> can only be called inside Server Actions. It uses the request context to identify the current user and ensure they see their own writes immediately. Other users will see the update after normal cache expiration or revalidation.</p>
      </Callout>

      <Diagram caption="revalidateTag vs updateTag: different consistency guarantees">
        <div className="w-full max-w-lg space-y-4">
          <div className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
            <div className="font-bold text-amber-800 mb-1">revalidateTag</div>
            <div className="text-sm text-amber-700">Eventual consistency -- everyone gets fresh data on next request</div>
            <div className="text-xs text-amber-600 mt-1">Best for: admin actions, content publishing, background updates</div>
          </div>
          <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
            <div className="font-bold text-green-800 mb-1">updateTag</div>
            <div className="text-sm text-green-700">Read-your-writes -- the triggering user sees changes immediately</div>
            <div className="text-xs text-green-600 mt-1">Best for: profile updates, settings changes, user-facing mutations</div>
          </div>
        </div>
      </Diagram>

      <h2>refresh -- Refresh Uncached Data</h2>
      <p>
        The <code>refresh</code> function is different from the tag-based APIs. It does not touch cached content at all. Instead, it tells Next.js to <strong>re-fetch any dynamic (uncached) data</strong> on the current page without a full page reload.
      </p>

      <CodeBlock filename="app/feed/refresh-button.tsx" language="tsx">
{`"use client"

import { refresh } from 'next/cache'

export function RefreshButton() {
  return (
    <button onClick={() => refresh()}>
      Load new posts
    </button>
  )
}`}
      </CodeBlock>

      <p>
        When called, <code>refresh()</code> re-executes the dynamic Server Components on the page, fetching fresh data, while leaving cached components untouched. The page updates in place without a navigation.
      </p>

      <FlowDiagram
        steps={[
          { label: "refresh()", sublabel: "Client calls" },
          { label: "Cached Parts", sublabel: "Unchanged", color: "border-green-300 bg-green-50 text-green-800" },
          { label: "Dynamic Parts", sublabel: "Re-fetched", color: "border-purple-300 bg-purple-50 text-purple-800" },
          { label: "Page Updates", sublabel: "In place, no reload" },
        ]}
      />

      <Callout type="tip" title="Think of refresh as a selective reload">
        <p><code>refresh()</code> is perfect for &quot;pull to refresh&quot; patterns, live feeds, or any time a user wants to see the latest data without losing their scroll position or client state. It only re-runs the dynamic parts of the page.</p>
      </Callout>

      <h2>When to Use Each API</h2>

      <Diagram caption="Decision tree for choosing a revalidation strategy">
        <div className="w-full max-w-md space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-subtle border border-border">
            <div className="font-semibold text-foreground mb-2">Did the user just mutate data in a Server Action?</div>
            <div className="pl-4 space-y-2">
              <div className="text-muted">Must they see it immediately? → <code className="bg-success-light px-1 rounded">updateTag</code></div>
              <div className="text-muted">Okay if slightly delayed? → <code className="bg-warning-light px-1 rounded">revalidateTag</code></div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-subtle border border-border">
            <div className="font-semibold text-foreground mb-2">Does the user want fresh dynamic content without a full reload?</div>
            <div className="pl-4">
              <div className="text-muted">Yes → <code className="bg-important-bg px-1 rounded">refresh()</code></div>
            </div>
          </div>
        </div>
      </Diagram>

      <h2>Combining the APIs</h2>
      <p>
        In practice, you will often combine these APIs. Here is a real-world example of a comment system:
      </p>

      <CodeBlock filename="app/post/[id]/actions.ts" language="typescript">
{`"use server"

import { revalidateTag, updateTag } from 'next/cache'

export async function addComment(postId: string, text: string) {
  // Save the comment
  await db.comments.create({ postId, text, userId: currentUser.id })

  // The commenter sees their comment immediately
  updateTag(\`comments-\${postId}\`)

  // The comment count in the blog listing updates eventually
  revalidateTag('blog-listing', 'hours')
}`}
      </CodeBlock>

      <CodeBlock filename="app/post/[id]/comment-list.tsx" language="tsx">
{`"use cache"

import { cacheLife, cacheTag } from 'next/cache'

export async function CommentList({ postId }: { postId: string }) {
  cacheLife('hours')
  cacheTag(\`comments-\${postId}\`)

  const comments = await db.comments.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          <strong>{comment.author}</strong>
          <p>{comment.text}</p>
        </div>
      ))}
    </div>
  )
}`}
      </CodeBlock>

      <Quiz
        question="A user updates their display name in settings. Which revalidation API ensures they immediately see the change reflected in the header?"
        options={[
          { label: "revalidateTag('user-profile', 'hours')", explanation: "revalidateTag provides eventual consistency -- the user might not see their change immediately after the action completes." },
          { label: "updateTag('user-profile')", correct: true, explanation: "Correct! updateTag provides read-your-writes semantics. The user who triggered the mutation is guaranteed to see the updated content immediately, while other users see it after normal cache expiration." },
          { label: "refresh()", explanation: "refresh() re-fetches dynamic data on the current page, but it doesn't invalidate cached components. If the header is cached, refresh won't update it." },
          { label: "revalidateTag('user-profile')", explanation: "In Next.js 16, revalidateTag requires a cacheLife profile as the second argument. Also, it provides eventual rather than immediate consistency." },
        ]}
      />

      <Quiz
        question="What does refresh() do differently from revalidateTag?"
        options={[
          { label: "It invalidates cached content tagged with a specific key" },
          { label: "It re-fetches dynamic (uncached) data on the page without touching cached components", correct: true, explanation: "Correct! refresh() only affects dynamic parts of the page. Cached components remain untouched. It's useful for 'pull to refresh' patterns where you want fresh dynamic data without invalidating your cache strategy." },
          { label: "It forces a full page reload in the browser" },
          { label: "It clears the entire application cache" },
        ]}
      />

      <HandsOn
        title={'Add a "Refresh Posts" button to clear the cache'}
        projectStep="Step 18 of 40 — Blog Platform Project"
        projectContext="Your posts page is cached. Now you will add a button that clears the cache so you can see fresh data without waiting."
        steps={[
          'Create a new file at app/posts/refresh-button.tsx. Add "use client" at the top, import revalidatePath from next/cache, and make a simple button component that calls revalidatePath(\'/posts\') when clicked.',
          "Open app/posts/page.tsx and import your new RefreshButton component. Render it above the posts list, like: <RefreshButton />",
          "Refresh the posts page and note the timestamp. Now click your Refresh Posts button. You should see the timestamp update — the cache was cleared and the page re-rendered with fresh data.",
          "Try it again: wait a moment, then click the button. Each click forces the page to re-render, even though it is cached. This is how you manually clear the cache when new content is available.",
        ]}
      />
    </div>
  );
}
