import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function ParallelSequential() {
  return (
    <>
      <h1>Parallel vs Sequential Data Fetching</h1>
      <p className="lead">
        Sequential fetching — where one request waits for the previous to complete — is
        the number one performance mistake in server-rendered applications. Understanding
        when fetches happen sequentially and how to parallelize them can cut page load
        times by 50% or more.
      </p>

      <h2>The Request Waterfall Problem</h2>
      <p>
        A waterfall occurs when fetch B depends on (or simply waits for) fetch A to
        complete, even though B does not actually need A&apos;s result. This happens
        naturally when you await sequentially in a single component.
      </p>

      <CodeBlock filename="Sequential Fetching (Waterfall)" language="tsx" highlight={[4, 5, 6, 7]}>
{`export default async function ArtistPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // These run one after another — WATERFALL!
  const artist = await fetchArtist(id);        // 300ms
  const albums = await fetchAlbums(id);        // 400ms
  const relatedArtists = await fetchRelated(id); // 200ms

  // Total: 300 + 400 + 200 = 900ms
  return (
    <div>
      <ArtistHeader artist={artist} />
      <AlbumGrid albums={albums} />
      <RelatedArtists artists={relatedArtists} />
    </div>
  );
}`}
      </CodeBlock>

      <Diagram caption="Sequential waterfall: each fetch waits for the previous one">
        <div className="w-full max-w-lg space-y-2 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-muted">fetchArtist</span>
            <div className="h-6 bg-red-200 border border-red-300 rounded flex items-center px-2" style={{ width: "33%" }}>
              <span className="text-xs text-red-800">300ms</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-muted">fetchAlbums</span>
            <div className="h-6" style={{ width: "33%" }} />
            <div className="h-6 bg-red-200 border border-red-300 rounded flex items-center px-2" style={{ width: "44%" }}>
              <span className="text-xs text-red-800">400ms</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-muted">fetchRelated</span>
            <div className="h-6" style={{ width: "77%" }} />
            <div className="h-6 bg-red-200 border border-red-300 rounded flex items-center px-2" style={{ width: "22%" }}>
              <span className="text-xs text-red-800">200ms</span>
            </div>
          </div>
          <div className="text-right text-xs text-red-600 font-semibold pt-1">Total: 900ms</div>
        </div>
      </Diagram>

      <h2>The Fix: Promise.all</h2>
      <p>
        When fetches are independent — none of them need the result of another — fire
        them all at once with <code>Promise.all</code>. The total time equals the
        slowest fetch, not the sum of all fetches.
      </p>

      <CodeBlock filename="Parallel Fetching with Promise.all" language="tsx" highlight={[5, 6, 7, 8, 9]}>
{`export default async function ArtistPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // All three start at the same time — PARALLEL!
  const [artist, albums, relatedArtists] = await Promise.all([
    fetchArtist(id),         // 300ms
    fetchAlbums(id),         // 400ms
    fetchRelated(id),        // 200ms
  ]);

  // Total: max(300, 400, 200) = 400ms (56% faster!)
  return (
    <div>
      <ArtistHeader artist={artist} />
      <AlbumGrid albums={albums} />
      <RelatedArtists artists={relatedArtists} />
    </div>
  );
}`}
      </CodeBlock>

      <Diagram caption="Parallel fetching: all requests fire simultaneously">
        <div className="w-full max-w-lg space-y-2 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-muted">fetchArtist</span>
            <div className="h-6 bg-green-200 border border-green-300 rounded flex items-center px-2" style={{ width: "33%" }}>
              <span className="text-xs text-green-800">300ms</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-muted">fetchAlbums</span>
            <div className="h-6 bg-green-200 border border-green-300 rounded flex items-center px-2" style={{ width: "44%" }}>
              <span className="text-xs text-green-800">400ms</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-muted">fetchRelated</span>
            <div className="h-6 bg-green-200 border border-green-300 rounded flex items-center px-2" style={{ width: "22%" }}>
              <span className="text-xs text-green-800">200ms</span>
            </div>
          </div>
          <div className="text-right text-xs text-green-600 font-semibold pt-1">Total: 400ms</div>
        </div>
      </Diagram>

      <Callout type="important" title="The golden rule">
        <p>
          If fetch B does not need the <em>result</em> of fetch A, they should run in
          parallel. Sequential awaits are only correct when there is a true data
          dependency — e.g., you need a user ID from the first fetch to pass to the
          second fetch.
        </p>
      </Callout>

      <h2>Component Tree Waterfalls</h2>
      <p>
        Waterfalls are not just about sequential awaits in one component. They also
        happen across the component tree. A parent component must finish rendering
        (including its data fetch) before its children begin rendering.
      </p>

      <CodeBlock filename="Hidden waterfall in component tree" language="tsx">
{`// Parent fetches first...
async function ArtistPage({ id }: { id: string }) {
  const artist = await fetchArtist(id); // 300ms — children wait!

  return (
    <div>
      <h1>{artist.name}</h1>
      {/* These don't start fetching until parent resolves */}
      <AlbumGrid artistId={id} />
      <RelatedArtists artistId={id} />
    </div>
  );
}

// Child can only start after parent renders it
async function AlbumGrid({ artistId }: { artistId: string }) {
  const albums = await fetchAlbums(artistId); // +400ms
  return <div>{/* ... */}</div>;
}

// This ALSO waits for parent — another sequential step
async function RelatedArtists({ artistId }: { artistId: string }) {
  const related = await fetchRelated(artistId); // +200ms
  return <div>{/* ... */}</div>;
}`}
      </CodeBlock>

      <Callout type="warning" title="Invisible waterfalls">
        <p>
          This is subtle: the child components <code>AlbumGrid</code> and{" "}
          <code>RelatedArtists</code> only need the <code>artistId</code> (which comes
          from the URL params), but because they are children of a component that
          awaits, they cannot start fetching until the parent resolves. The tree
          structure creates an implicit waterfall.
        </p>
      </Callout>

      <h2>Solution: Lift Fetches Up or Preload</h2>
      <p>
        You have two main strategies to solve component tree waterfalls:
      </p>

      <h3>Strategy 1: Fetch in Parallel at the Top</h3>

      <CodeBlock filename="Parallel fetch at parent level" language="tsx" highlight={[4, 5, 6, 7]}>
{`export default async function ArtistPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [artist, albums, related] = await Promise.all([
    fetchArtist(id),
    fetchAlbums(id),
    fetchRelated(id),
  ]);

  return (
    <div>
      <h1>{artist.name}</h1>
      <AlbumGrid albums={albums} />
      <RelatedArtists artists={related} />
    </div>
  );
}`}
      </CodeBlock>

      <h3>Strategy 2: Preload Pattern</h3>
      <p>
        Start fetches early and pass the promise (not the result) down to child
        components. The children await the already-in-flight promise.
      </p>

      <CodeBlock filename="Preload pattern" language="tsx" highlight={[5, 6, 7, 13, 14]}>
{`export default async function ArtistPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Start fetches immediately — don't await yet!
  const artistPromise = fetchArtist(id);
  const albumsPromise = fetchAlbums(id);
  const relatedPromise = fetchRelated(id);

  const artist = await artistPromise;

  return (
    <div>
      <h1>{artist.name}</h1>
      {/* Pass promises to children — they're already in flight */}
      <AlbumGrid albumsPromise={albumsPromise} />
      <RelatedArtists relatedPromise={relatedPromise} />
    </div>
  );
}

async function AlbumGrid({ albumsPromise }: { albumsPromise: Promise<Album[]> }) {
  const albums = await albumsPromise; // Already started! Minimal wait.
  return <div>{/* render albums */}</div>;
}`}
      </CodeBlock>

      <Callout type="tip" title="Combining with Suspense">
        <p>
          The preload pattern works beautifully with Suspense. Wrap each child in a
          Suspense boundary and they stream independently — the fastest one appears
          first, regardless of component order.
        </p>
      </Callout>

      <h2>When Sequential Fetching is Correct</h2>
      <p>
        Not all sequential fetching is wrong. Sometimes you genuinely need data from
        one request to make the next:
      </p>

      <CodeBlock filename="Legitimate sequential fetch" language="tsx">
{`export default async function OrderPage({
  params,
}: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  // Step 1: Get the order (need it to find the user)
  const order = await fetchOrder(orderId);

  // Step 2: Need order.userId — this MUST be sequential
  const customer = await fetchUser(order.userId);

  // Step 3: But shipping and items are independent of customer!
  const [shipping, items] = await Promise.all([
    fetchShipping(order.trackingId),
    fetchOrderItems(orderId),
  ]);

  return <OrderDetails order={order} customer={customer} shipping={shipping} items={items} />;
}`}
      </CodeBlock>

      <Quiz
        question="You have a page that fetches userData (100ms), userPosts (500ms), and userFollowers (300ms). None depend on each other's results. What's the fastest approach?"
        options={[
          {
            label: "Await each one sequentially for readability",
            explanation: "This takes 100 + 500 + 300 = 900ms. You'd be making users wait 500ms longer than necessary.",
          },
          {
            label: "Use Promise.all to fetch all three in parallel",
            correct: true,
            explanation: "Correct! With Promise.all, the total time is max(100, 500, 300) = 500ms. Since none of the fetches depend on each other, there's no reason to wait.",
          },
          {
            label: "Put each in a separate Server Component so they stream independently",
            explanation: "This would still work but adds complexity. If you need all data before rendering any UI, Promise.all in one component is simpler and equally fast.",
          },
          {
            label: "Cache all three with revalidate so they're instant after the first load",
            explanation: "Caching helps repeat visits, but doesn't solve the first-load waterfall. Promise.all fixes the fundamental ordering problem.",
          },
        ]}
      />

      <h2>Detecting Waterfalls</h2>
      <p>
        How do you know if your page has a waterfall? Here are the signals:
      </p>

      <Diagram caption="Waterfall detection checklist">
        <div className="w-full max-w-md text-sm space-y-2">
          <div className="p-3 rounded bg-red-50 border border-red-200">
            <strong className="text-red-800">Red flags:</strong>
            <ul className="mt-1 text-red-700 list-disc list-inside space-y-1">
              <li>Multiple <code>await</code> statements in sequence</li>
              <li>Parent fetches data that children also fetch independently</li>
              <li>Page load time equals sum of all fetch durations</li>
              <li>DevTools Network shows staircase pattern</li>
            </ul>
          </div>
          <div className="p-3 rounded bg-green-50 border border-green-200">
            <strong className="text-green-800">Healthy patterns:</strong>
            <ul className="mt-1 text-green-700 list-disc list-inside space-y-1">
              <li><code>Promise.all</code> for independent fetches</li>
              <li>Page load time equals slowest single fetch</li>
              <li>DevTools Network shows parallel bars</li>
              <li>Preloaded promises passed to children</li>
            </ul>
          </div>
        </div>
      </Diagram>

      <Quiz
        question="A parent Server Component fetches user data (200ms) and passes the userId to a child component that fetches posts (400ms). What's the total time and why?"
        options={[
          {
            label: "400ms — the child fetch starts immediately in parallel",
            explanation: "The child cannot start fetching until the parent finishes rendering. The parent must resolve its await before the child component is even created.",
          },
          {
            label: "600ms — the child waits for the parent to resolve before it can start fetching",
            correct: true,
            explanation: "Correct! This is a component tree waterfall. The parent awaits for 200ms, then renders the child, which then awaits for 400ms. Total: 200 + 400 = 600ms. To fix this, preload the posts fetch at the parent level.",
          },
          {
            label: "200ms — the parent caches user data for the child",
            explanation: "Caching doesn't apply here. The child is fetching different data (posts), not the same user data.",
          },
          {
            label: "200ms — Next.js automatically parallelizes component tree fetches",
            explanation: "Next.js does not automatically parallelize fetches across the component tree. Each component must resolve before its children render.",
          },
        ]}
      />

      <HandsOn
        title="Fetch two things at the same time"
        projectStep="Step 13 of 40 — Blog Platform Project"
        projectContext="Open your my-blog project. Your posts page fetches posts from an API. Now you will also fetch user data, and learn how to do both at the same time instead of one after the other."
        steps={[
          "Open app/posts/page.tsx. Add a second fetch below your posts fetch: const usersRes = await fetch('https://jsonplaceholder.typicode.com/users?_limit=3'); const users = await usersRes.json(); Display the users below your posts list: <h2>Authors</h2><ul>{users.map((u: any) => <li key={u.id}>{u.name}</li>)}</ul>",
          "Add console.log('Start:', Date.now()) before the first fetch and console.log('End:', Date.now()) after the second fetch. Check the terminal — the total time is the sum of both fetches because they run one after the other.",
          "Now change both fetches to run at the same time using Promise.all: const [postsRes, usersRes] = await Promise.all([ fetch('https://jsonplaceholder.typicode.com/posts?_limit=5'), fetch('https://jsonplaceholder.typicode.com/users?_limit=3') ]); Then parse both: const posts = await postsRes.json(); const users = await usersRes.json();",
          "Check the terminal timestamps again. The total time should now be roughly equal to whichever fetch was slower, not the sum of both. When two fetches do not depend on each other, always use Promise.all to run them at the same time.",
        ]}
      />

      <Callout type="important" title="Performance rule of thumb">
        <p>
          Every time you write <code>await</code> in a Server Component, ask yourself:
          &quot;Does this <em>need</em> to wait for the previous await?&quot; If the
          answer is no, reach for <code>Promise.all</code>. This single habit will
          prevent the majority of server-side performance issues.
        </p>
      </Callout>
    </>
  );
}
