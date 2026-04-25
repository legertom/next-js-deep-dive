import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function KeysAndLists() {
  return (
    <>
      <h1>Keys &amp; List Rendering</h1>

      <p>
        You&apos;ve been writing <code>cards.map(card =&gt; ...)</code>{" "}
        for several modules now, and React has been quietly nagging
        about a <code>key</code> prop. This lesson is the &quot;why&quot;
        of that key — and the deeper concept it teaches: <strong>how
        React identifies which JSX corresponds to which previous
        render</strong>.
      </p>

      <h2>Rendering arrays</h2>

      <p>
        JSX accepts arrays of elements anywhere it accepts a single
        element. The standard way to produce that array is{" "}
        <code>map</code>:
      </p>

      <CodeBlock language="tsx">
        {`function CardList({ cards }: { cards: Card[] }) {
  return (
    <ul>
      {cards.map(card => (
        <li key={card.id}>{card.question}</li>
      ))}
    </ul>
  );
}`}
      </CodeBlock>

      <p>
        Three things about that snippet:
      </p>

      <ul>
        <li>
          <code>cards.map(...)</code> returns an array of JSX elements.
          React renders the array.
        </li>
        <li>
          Each element has a <code>key</code> prop. <code>key</code> is
          a special React prop, not something you can read inside the
          component.
        </li>
        <li>
          The <code>key</code> goes on the element you return from{" "}
          <code>map</code>, not on a child of it. If you wrap each item
          in a Fragment, the key goes on the Fragment.
        </li>
      </ul>

      <h2>What keys are for</h2>

      <p>
        Keys are React&apos;s answer to one question: <strong>across
        renders, which item in the new array is the same item from the
        old array?</strong>
      </p>

      <p>
        Without keys, React falls back to position. The first item now
        is &quot;the same as&quot; the first item before, the second is
        the second, etc. That&apos;s fine for a static list. As soon as
        items move, get inserted, or get removed, position-matching
        falls apart and you get bugs that look like &quot;state stuck on
        the wrong row&quot; or &quot;input value bleeding to a different
        item.&quot;
      </p>

      <h2>What goes wrong without stable keys</h2>

      <p>
        Imagine a list of editable cards, and you delete the first one:
      </p>

      <CodeBlock language="text">
        {`Before:                          After delete first:
[A] question="Q1"                [B] question="Q2"
[B] question="Q2"                [C] question="Q3"
[C] question="Q3"                (A removed)`}
      </CodeBlock>

      <p>
        Without stable keys, React maps by position:
      </p>

      <ul>
        <li>Old slot 1 (A) → new slot 1 (B). React keeps A&apos;s DOM and React state, just changes the question text. <em>A&apos;s state is now attached to B&apos;s data.</em></li>
        <li>Old slot 2 (B) → new slot 2 (C). Same problem.</li>
        <li>Old slot 3 (C) → unmount. The wrong thing got unmounted.</li>
      </ul>

      <p>
        If each card has internal state (like <code>isFlipped</code>),
        the flipped state from A is now showing on the data for B. Bug.
        With keys:
      </p>

      <CodeBlock language="tsx">
        {`{cards.map(c => <Card key={c.id} card={c} />)}`}
      </CodeBlock>

      <p>
        React uses <code>c.id</code> to track each card across
        renders. Delete A, and React knows: keep B (still id 2) and C
        (still id 3) exactly as they are, unmount A. Internal state
        stays attached to its rightful owner.
      </p>

      <h2>What makes a good key?</h2>

      <ul>
        <li>
          <strong>Stable:</strong> the same logical item gets the same
          key across renders.
        </li>
        <li>
          <strong>Unique among siblings:</strong> two items in the same
          array can&apos;t share a key. (Two items in different arrays can.)
        </li>
        <li>
          <strong>Predictable:</strong> derive it from the data, not from
          render-order or other ephemeral things.
        </li>
      </ul>

      <p>
        Database IDs are perfect. Stable strings work too. Index is{" "}
        <em>almost never</em> a good key in a dynamic list (more on this
        below).
      </p>

      <h2>Why <code>key={`{index}`}</code> is usually wrong</h2>

      <CodeBlock language="tsx">
        {`{cards.map((card, i) => <Card key={i} card={card} />)}  // ⚠️ red flag`}
      </CodeBlock>

      <p>
        Index keys are stable across re-renders only if the list never
        reorders or has items inserted/removed. The moment any of those
        happen, the index of an item changes, so its key changes, and
        React thinks it&apos;s a different item — unmounting the old
        one and mounting a new one. State loss, animation glitches,
        focus loss.
      </p>

      <p>
        The classic hidden bug: a list of inputs with{" "}
        <code>key={`{i}`}</code>. Type into the second input. Delete the
        first item. The text you typed appears on what&apos;s now the
        first row. Subtle and infuriating to debug.
      </p>

      <p>
        Index keys are fine when the list is truly static (no inserts,
        removes, or reorders), no item has internal state, and the items
        have no derived references like refs. Otherwise: avoid.
      </p>

      <Callout type="important" title="The ID rule">
        If your data doesn&apos;t have IDs, generate them. <code>Date.now()</code>{" "}
        for new items is a pragmatic minimum. <code>crypto.randomUUID()</code>{" "}
        is even better. The ID lives with the data, not with the rendering.
      </Callout>

      <h2>Where the key lives</h2>

      <CodeBlock language="tsx">
        {`// ✅ key on the top-level returned element
{cards.map(card =>
  <Card key={card.id} card={card} />
)}

// ✅ key on a Fragment when you have no wrapper
{cards.map(card => (
  <React.Fragment key={card.id}>
    <h3>{card.question}</h3>
    <p>{card.answer}</p>
  </React.Fragment>
))}

// ❌ key on a child — has no effect, will warn
{cards.map(card => (
  <div>
    <Card key={card.id} card={card} />
  </div>
))}`}
      </CodeBlock>

      <h2>Resetting state with a key</h2>

      <p>
        We promised this in Module 3. When you change a component&apos;s{" "}
        <code>key</code>, React unmounts the old one and mounts a fresh
        one. <em>That&apos;s how you reset state without effects.</em>
      </p>

      <CodeBlock language="tsx">
        {`function CardEditor({ cardId, ...rest }: Props) {
  const [draft, setDraft] = useState("");
  // ...
}

// Parent:
<CardEditor key={cardId} cardId={cardId} {...rest} />`}
      </CodeBlock>

      <p>
        When <code>cardId</code> changes, the editor remounts and{" "}
        <code>draft</code> resets to <code>&quot;&quot;</code>.
        That&apos;s pure, no effect needed, no state-syncing
        anti-pattern. The key isn&apos;t just for lists; it&apos;s a
        general identity primitive.
      </p>

      <h2>Adding more cards to feel the bug</h2>

      <HandsOn
        title="Watch state leak with bad keys"
        projectStep="Module 6 · Step 1"
        projectContext="You'll temporarily replace the card key with the array index, then add a new card to the top of the list and watch a flipped card's state apparently jump to a different card. Reverting fixes it. Feeling the bug once is worth a lot of theory."
        steps={[
          "In `src/App.tsx`, find your `filtered.map(card => <Flashcard key={card.id} ... />)` and temporarily change the key: ```tsx\n{filtered.map((card, i) => (\n  <Flashcard key={i} ... />\n))}\n```",
          "In the dev server: flip the second card to its answer. Note which question is now showing its answer.",
          "Add a new card via the form (give it a clearly different question like 'Test card 1' / 'Test answer 1'). Notice that the *new* card now appears in the second position, but the answer is showing for what used to be the second card.",
          "What happened: with `key={i}`, React thinks position 2 is still 'the same component' even though the data is now different. The flipped state stayed at position 2 while the data shifted underneath. State got attached to the wrong card.",
          "Revert the key back to `card.id`: ```tsx\n{filtered.map(card => (\n  <Flashcard key={card.id} ... />\n))}\n```",
          "Repeat the experiment: flip a card, add a new card. The flipped state stays with its original card. React tracked the cards by stable identity (the id) instead of position.",
          "Reflect: position-based keys are the most common subtle React bug in real codebases. The lint rule will warn if you literally write `key={i}` but it can't always catch you using something else equivalent (like a name that isn't unique). When in doubt, generate IDs.",
        ]}
      />

      <Callout type="info" title="What you just felt">
        That &quot;the wrong card is showing its answer&quot; bug is
        what bad keys feel like in production. It&apos;s never a crash,
        never a console error. Just state that&apos;s subtly attached to
        the wrong row. Fixing it is one line; finding it the first time
        can take an hour.
      </Callout>

      <Quiz
        question="What does React use the `key` prop for?"
        options={[
          { label: "Performance — sorting items by key" },
          {
            label: "Identifying which item in a new render corresponds to which item in the previous render, so state and DOM nodes follow the right item across renders",
            correct: true,
            explanation:
              "Keys are about identity. They tell React 'this item now is the same item that had this key before.' With stable keys, React preserves DOM nodes and component state for unchanged items even when the list reorders or has items added/removed.",
          },
          { label: "Storing a unique ID in the DOM that components can read with useKey()" },
          { label: "Required only for performance — the app works the same without them" },
        ]}
      />

      <Quiz
        question="When is `key={index}` actually safe?"
        options={[
          { label: "Always — index is unique within a sibling group" },
          {
            label: "Only when the list is truly static (no inserts, removes, reorders) AND the items have no internal state, refs, or animations to preserve",
            correct: true,
            explanation:
              "Index is stable across renders only if positions never change. The moment items move, get inserted, or get removed, the index of an existing item changes — and React thinks it's a new item. State, DOM identity, focus, and animations all break. Use index only for fully static lists.",
          },
          { label: "Only in Server Components" },
          { label: "Never — keys must always be UUIDs" },
        ]}
      />

      <ShortAnswer
        question="A teammate gave a list of editable inputs `key={index}` and now reports a bug where deleting an item causes the wrong input to clear. Explain what's happening and how to fix it."
        rubric={[
          "With key=index, deleting item N causes every later item to shift up; their indices change, so their keys change",
          "React sees the old keys are gone and the new ones are 'new components' — it unmounts the bottom item (whose old key disappeared) and resets state on every shifted item, even though the actual input data only lost one row",
          "Fix: give each item a stable id (from data, or generated on creation) and use that as the key — state will stay attached to the right item across deletes/reorders",
        ]}
        topic="Why index keys break editable lists"
      />

      <h2>What&apos;s next</h2>

      <p>
        You now understand <em>identity</em> in React. The next lesson
        zooms out one level: how React actually decides which DOM
        operations to apply on each render. It&apos;s the answer to
        &quot;how does React know what changed?&quot; — a process
        called <strong>reconciliation</strong>.
      </p>
    </>
  );
}
