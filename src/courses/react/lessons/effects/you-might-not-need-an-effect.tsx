import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function YouMightNotNeedAnEffect() {
  return (
    <>
      <h1>You Might Not Need an Effect</h1>

      <p>
        This is the most important lesson in the course. The single
        biggest gap between rusty React and current React is{" "}
        <strong>knowing when not to reach for <code>useEffect</code></strong>.
        The hook is a precision tool for syncing with external systems —
        not a general-purpose &quot;run code when X changes&quot; helper.
      </p>

      <p>
        Most of the bugs and most of the unnecessary complexity in any
        React codebase trace back to effects that shouldn&apos;t have
        been written. This lesson is the guide to recognizing them and
        what to do instead.
      </p>

      <h2>The two-question test</h2>

      <p>Before writing <code>useEffect</code>, answer:</p>

      <ol>
        <li>
          <strong>Am I synchronizing with something OUTSIDE React?</strong>{" "}
          (the DOM, the network, localStorage, a third-party library, a
          subscription, a timer)
        </li>
        <li>
          <strong>Does this need to happen as a result of rendering, not as a result of an event?</strong>
        </li>
      </ol>

      <p>
        If the answer to either question is no, you probably don&apos;t
        need an effect. Let&apos;s walk through the most common
        mistakes.
      </p>

      <h2>Anti-pattern 1: transforming data for rendering</h2>

      <CodeBlock language="tsx">
        {`function Cards({ cards }) {
  const [filtered, setFiltered] = useState(cards);

  // BAD: extra render, easy to drift out of sync
  useEffect(() => {
    setFiltered(cards.filter(c => !c.archived));
  }, [cards]);

  return filtered.map(...)
}`}
      </CodeBlock>

      <p>
        Two problems: every change to <code>cards</code> causes two
        renders (once with stale <code>filtered</code>, once after the
        effect runs <code>setFiltered</code>). And there&apos;s a moment
        where state is inconsistent.
      </p>

      <p>The right way: just compute it.</p>

      <CodeBlock language="tsx">
        {`function Cards({ cards }) {
  const filtered = cards.filter(c => !c.archived); // computed every render
  return filtered.map(...)
}`}
      </CodeBlock>

      <p>
        One render. Always in sync. The mental shift: <strong>derived
        values aren&apos;t state — they&apos;re expressions</strong>.
        Just write the expression where you need it.
      </p>

      <h2>Anti-pattern 2: handling events</h2>

      <CodeBlock language="tsx">
        {`function ProductPage({ product, addToCart }) {
  // BAD: fires on EVERY render where product changes, including initial mount
  useEffect(() => {
    if (justAddedToCart) {
      showNotification(\`Added \${product.name}\`);
      logAnalytics("add_to_cart", product);
    }
  }, [justAddedToCart]);
}`}
      </CodeBlock>

      <p>
        This is logic that should fire when the user clicks
        &quot;Add to cart&quot; — not as a side effect of state changing.
        Effects fire on render, which means they&apos;ll also fire on
        initial mount, on hot reload, on Strict Mode&apos;s double mount.
        Analytics will double up. Notifications will appear at the wrong
        time.
      </p>

      <p>The right way: do the work in the event handler.</p>

      <CodeBlock language="tsx">
        {`function ProductPage({ product, addToCart }) {
  function handleAddToCart() {
    addToCart(product);
    showNotification(\`Added \${product.name}\`);
    logAnalytics("add_to_cart", product);
  }

  return <button onClick={handleAddToCart}>Add to cart</button>;
}`}
      </CodeBlock>

      <Callout type="important" title="The dividing line">
        Effects are about <em>rendering</em>. Event handlers are about{" "}
        <em>specific user actions</em>. If you can answer &quot;why does
        this run?&quot; with &quot;the user clicked something,&quot;
        it&apos;s an event handler. If the answer is &quot;the component
        rendered with new state,&quot; it might be an effect.
      </Callout>

      <h2>Anti-pattern 3: syncing prop → state</h2>

      <CodeBlock language="tsx">
        {`function UserCard({ user }) {
  const [name, setName] = useState(user.name);

  // BAD: extra render every time user changes
  useEffect(() => {
    setName(user.name);
  }, [user.name]);
}`}
      </CodeBlock>

      <p>
        Why does <code>name</code> need to be state at all? If the prop
        is the source of truth, just read the prop. If you need a local
        editable copy that <em>diverges</em> from the prop until the user
        saves, that&apos;s a different pattern (and even then, &quot;reset
        with key&quot; is usually cleaner — see Module 6).
      </p>

      <CodeBlock language="tsx">
        {`function UserCard({ user }) {
  // No state, no effect. Just read the prop.
  return <p>{user.name}</p>;
}`}
      </CodeBlock>

      <h2>Anti-pattern 4: chains of effects</h2>

      <CodeBlock language="tsx">
        {`// BAD: a cascade of effects, each triggering the next
useEffect(() => {
  if (cards.length > 0) setIsEmpty(false);
}, [cards]);

useEffect(() => {
  if (!isEmpty) setShowEmpty(false);
}, [isEmpty]);`}
      </CodeBlock>

      <p>
        Each <code>setState</code> in an effect schedules another
        render. Chains like this take 3+ renders to settle on the right
        UI, and the intermediate states show up to the user. Just derive
        everything during render:
      </p>

      <CodeBlock language="tsx">
        {`const isEmpty = cards.length === 0;
const showEmpty = isEmpty;
// or even simpler — just inline cards.length === 0 wherever you need it`}
      </CodeBlock>

      <h2>Anti-pattern 5: resetting state with effects</h2>

      <CodeBlock language="tsx">
        {`function CardEditor({ cardId }) {
  const [draft, setDraft] = useState("");

  // BAD: extra render on every cardId change, plus the user briefly sees
  // the old draft for the new card before the effect runs.
  useEffect(() => {
    setDraft("");
  }, [cardId]);
}`}
      </CodeBlock>

      <p>
        The right way: change the component&apos;s <code>key</code>.
        Different key = different component instance = state resets
        automatically. No effect needed.
      </p>

      <CodeBlock language="tsx">
        {`<CardEditor key={cardId} card={card} /> // remounts when cardId changes`}
      </CodeBlock>

      <p>
        We&apos;ll cover the &quot;reset state with a key&quot; pattern in
        depth in Module 6. For now, file it: when you reach for an effect
        to clear state on prop change, look for a key first.
      </p>

      <h2>Anti-pattern 6: notifying parents</h2>

      <CodeBlock language="tsx">
        {`function Filter({ onFilterChange }) {
  const [query, setQuery] = useState("");

  // BAD: effect fires on every render where query changed,
  // including initial mount. Tells the parent on mount even
  // though no actual filtering happened.
  useEffect(() => {
    onFilterChange(query);
  }, [query]);
}`}
      </CodeBlock>

      <p>The right way: notify in the event handler.</p>

      <CodeBlock language="tsx">
        {`function Filter({ onFilterChange }) {
  const [query, setQuery] = useState("");

  function handleChange(e) {
    const next = e.target.value;
    setQuery(next);
    onFilterChange(next);  // explicit, fires only on actual user input
  }
}`}
      </CodeBlock>

      <h2>What effects ARE for</h2>

      <p>
        After all that, here&apos;s a clean list of times an effect is
        the right tool:
      </p>

      <ul>
        <li>
          <strong>Syncing to localStorage / sessionStorage</strong>{" "}
          (you did this last lesson).
        </li>
        <li>
          <strong>Setting <code>document.title</code> or other document/window state.</strong>
        </li>
        <li>
          <strong>Subscribing to an external store</strong> — a WebSocket,
          an event emitter, the browser&apos;s online status.
        </li>
        <li>
          <strong>Integrating a third-party library</strong> that needs to
          be told about DOM nodes (charts, maps, drag-and-drop libraries).
        </li>
        <li>
          <strong>Manually managing focus, scroll position, or other DOM-only state</strong>.
        </li>
        <li>
          <strong>Network requests</strong> — though for production apps,
          a data-fetching library or Server Components handle this better.
        </li>
      </ul>

      <p>
        Notice the common thread: all of these talk to systems React
        doesn&apos;t own. That&apos;s the &quot;synchronize with external
        systems&quot; framing. Anything that&apos;s purely about React
        state and props belongs in render or in event handlers.
      </p>

      <h2>The decision flowchart</h2>

      <CodeBlock language="text">
        {`Should I use useEffect?

Is the work I'm doing about something OUTSIDE React?
   (DOM, network, localStorage, third-party lib, subscription, timer)
   |
   +-- No → Don't use useEffect.
   |        Move it to render (if derived from state/props)
   |        or to an event handler (if a response to a user action).
   |
   +-- Yes → Does it need to happen as a result of RENDERING,
            not as a result of an EVENT?
            |
            +-- No → Use an event handler.
            |
            +-- Yes → useEffect is the right tool. Add cleanup if it
                      creates anything that lives past your component.`}
      </CodeBlock>

      <h2>Refactoring your flashcard app</h2>

      <p>
        Your app already does the right thing in most places — but
        let&apos;s deliberately add an anti-pattern, see why it&apos;s
        wrong, and refactor it. Builds the muscle memory.
      </p>

      <HandsOn
        title="Spot and remove an unnecessary effect"
        projectStep="Module 3 · Step 3"
        projectContext="You'll add a derived value the wrong way (in an effect), see the issue, and refactor it. Then add a 'mark all as known' button using an event handler — not an effect."
        steps={[
          "In `src/App.tsx`, find the `filtered` constant you computed during render last lesson. Now imagine a junior dev tried to do it with state + effect. Add this temporarily, just to feel the pain: ```tsx\n// DON'T leave this in — it's an anti-pattern we're about to remove\nconst [filteredAntipattern, setFilteredAntipattern] = useState(cards);\n\nuseEffect(() => {\n  setFilteredAntipattern(\n    searchTerm.trim() === ''\n      ? cards\n      : cards.filter(c =>\n          c.question.toLowerCase().includes(searchTerm.toLowerCase()) ||\n          c.answer.toLowerCase().includes(searchTerm.toLowerCase())\n        )\n  );\n}, [cards, searchTerm]);\n```",
          "Open React DevTools (or just rely on console.log). Add `console.log('App render')` at the top of App. Type in the search box. You'll see App render TWICE per keystroke — once when searchTerm changes, once when the effect fires setFilteredAntipattern.",
          "Now delete that whole `filteredAntipattern` block — both the useState AND the useEffect. Keep using the `filtered` constant from last lesson (the one that just computes inline during render). One render per keystroke, perfectly in sync, less code.",
          "Add a 'Mark all as known' button. Where would you put this logic — in an effect or in an event handler? Right answer: event handler. Add this above the cards list: ```tsx\n<button\n  type=\"button\"\n  className=\"bulk-action\"\n  onClick={() => setKnownIds(new Set(cards.map(c => c.id)))}\n  disabled={knownIds.size === cards.length}\n>\n  Mark all as known\n</button>\n```",
          "Add some CSS: ```css\n.bulk-action { padding: 0.4rem 0.75rem; border: 1px solid #d4d4d8; border-radius: 6px; background: white; font: inherit; cursor: pointer; margin-bottom: 1rem; }\n.bulk-action:disabled { opacity: 0.5; cursor: default; }\n```",
          "Save. Click 'Mark all as known' — every card flips to known, the counter updates instantly. No effect. Just an event handler that updates state, like Module 2 taught you. Clean.",
          "Reflect: anything you accomplish with useState + an event handler is going to be simpler, faster, and less buggy than the equivalent with useState + useEffect. The only time effects are right is when there's something genuinely outside React you need to talk to.",
        ]}
      />

      <Quiz
        question="You want to derive a 'visibleCards' list from 'cards' filtered by 'searchTerm'. What's the right approach?"
        options={[
          {
            label: "Compute it during render: `const visibleCards = cards.filter(c => matches(c, searchTerm));`",
            correct: true,
            explanation:
              "Derived values are expressions, not state. Computing them during render is one render, always in sync, and effectively free for normal-sized lists. Reach for useMemo only when profiling shows real cost.",
          },
          { label: "useState + useEffect: store visibleCards as state, sync it via an effect with [cards, searchTerm] deps" },
          { label: "useRef to hold visibleCards, mutate it on every render" },
          { label: "Always wrap in useMemo to be safe" },
        ]}
      />

      <Quiz
        question="A user clicks 'Save' and you want to show a toast. Effect or event handler?"
        options={[
          { label: "useEffect with [savedAt] in deps — fires when savedAt changes" },
          {
            label: "Event handler — call showToast() inside the click handler that does the save",
            correct: true,
            explanation:
              "The toast is a response to an event, not to rendering. Putting it in an effect means it'll fire on initial mount, on Strict Mode's double mount, and on any re-render where savedAt happens to change. Just call it from the click handler.",
          },
          { label: "useLayoutEffect to fire it before the paint" },
          { label: "Either is fine — it's a stylistic choice" },
        ]}
      />

      <ShortAnswer
        question="Give the two questions you should ask yourself before writing a useEffect, and explain what each is checking for."
        rubric={[
          "Question 1: 'Am I synchronizing with something outside React?' — checking that there's actually an external system involved (DOM, network, storage, third-party lib, subscription, timer) rather than just React state/props",
          "Question 2: 'Does this need to happen as a result of rendering, not as a result of an event?' — checking that the trigger is render-driven, not user-driven (otherwise it belongs in an event handler)",
          "If both answers are yes, useEffect is the right tool; if either is no, use derivation in render or an event handler instead",
        ]}
        topic="When NOT to use useEffect"
      />

      <h2>Module 3 wrap-up</h2>

      <p>
        Effects are a precision tool. Lesson 1 taught the mechanics.
        Lesson 2 taught cleanup. This lesson taught the most valuable
        skill: not writing them when you don&apos;t need to.
      </p>

      <p>
        The next module shifts focus from <em>state</em> to{" "}
        <em>structure</em>. We&apos;ll dig into composition patterns —
        the <code>children</code> prop, components-as-props, and how to
        build flexible APIs that don&apos;t require prop drilling. Your
        flashcard app gains a deck system and a much cleaner component
        boundary.
      </p>
    </>
  );
}
