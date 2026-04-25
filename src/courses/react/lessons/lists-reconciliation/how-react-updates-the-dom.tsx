import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function HowReactUpdatesTheDom() {
  return (
    <>
      <h1>How React Updates the DOM</h1>

      <p>
        Time to demystify the &quot;virtual DOM.&quot; You&apos;ve been
        working with React long enough to feel it — the diffing, the
        commits, the way component instances persist across renders. This
        lesson zooms back to the start (Module 1&apos;s Render Cycle
        lesson) and fills in the missing piece: <strong>how does React
        actually decide what to do</strong> in the commit phase?
      </p>

      <p>
        You don&apos;t need to understand this to write working React.
        You do need it to debug performance, weird state-loss bugs, and
        anything involving keys, refs, or layout. It&apos;s also
        immensely satisfying.
      </p>

      <h2>The two trees</h2>

      <p>
        Every render, React builds a tree of React Elements (those plain
        objects JSX compiles to). Every previous render produced a tree
        too. Reconciliation is the process of comparing the new tree to
        the previous one and figuring out what to change in the DOM.
      </p>

      <CodeBlock language="text">
        {`Previous tree                       New tree
(from last render)                  (from this render)
                       diff
       App ─────────────────────────► App
        |                              |
       div                            div
       / \\                            / \\
      h1  ul                         h1  ul
          |                              |
         li × 3                          li × 4    ← one new item
                                                   ← what does React do?`}
      </CodeBlock>

      <p>
        For every node in the new tree, React asks: <strong>does the
        previous tree have a corresponding node?</strong> The answer
        determines what happens.
      </p>

      <h2>The matching rules</h2>

      <p>React&apos;s rules for matching are deliberately simple:</p>

      <ol>
        <li>
          <strong>Same position, same type → reuse.</strong> A{" "}
          <code>&lt;div&gt;</code> at the same spot as before is the same
          DOM node, just maybe with updated props. A{" "}
          <code>&lt;Flashcard&gt;</code> at the same spot is the same
          component instance — its hooks keep their state, its refs keep
          their nodes, only props get updated.
        </li>
        <li>
          <strong>Same position, different type → throw away the old, mount fresh.</strong>{" "}
          If the new tree has a <code>&lt;section&gt;</code> where the
          old tree had a <code>&lt;div&gt;</code>, the entire subtree is
          unmounted and a new one is mounted. State is lost. DOM is
          rebuilt. Children are remounted too.
        </li>
        <li>
          <strong>Different position (in a list) → matched by key.</strong>{" "}
          Keys override position. If the keys match, React treats them as
          the same item even if they&apos;ve moved. If the keys
          don&apos;t match (or a key is gone), it&apos;s an
          unmount/mount.
        </li>
      </ol>

      <h2>Why this explains some weird behaviors</h2>

      <h3>Conditional component types reset state</h3>

      <CodeBlock language="tsx">
        {`{showFancy
  ? <FancyInput value={value} onChange={onChange} />
  : <PlainInput value={value} onChange={onChange} />
}`}
      </CodeBlock>

      <p>
        Toggling <code>showFancy</code> swaps the component type at that
        position. Different type → unmount + mount. Any internal state in{" "}
        <code>FancyInput</code> or <code>PlainInput</code> is gone. Focus
        is lost. Refs are re-created.
      </p>

      <p>
        Two ways to avoid this if you don&apos;t want the reset:
      </p>

      <ul>
        <li>
          Render both, hide one with CSS — same component types every
          render.
        </li>
        <li>
          Restructure so they&apos;re siblings in the same component, not
          conditional swaps.
        </li>
      </ul>

      <h3>Wrapping in a div changes everything below</h3>

      <CodeBlock language="tsx">
        {`{loading
  ? <p>Loading...</p>
  : <ContentTree />}

// vs

<div>{loading ? <p>Loading...</p> : <ContentTree />}</div>`}
      </CodeBlock>

      <p>
        These render identically the first time. But if you toggle{" "}
        <code>loading</code> in the second version, React reuses the{" "}
        <code>div</code> wrapper and only swaps its child — fast. In the
        first, the position 1 element changes type from{" "}
        <code>p</code> to <code>ContentTree</code>, which means
        unmount/mount of the entire content tree. The wrapper is a tiny
        thing that changes a lot.
      </p>

      <h3>Moving a component up the tree resets its state</h3>

      <CodeBlock language="tsx">
        {`{count > 5 ? <Counter /> : <div><Counter /></div>}`}
      </CodeBlock>

      <p>
        At <code>count = 5</code>, the Counter is wrapped in a div.
        At <code>count = 6</code>, it&apos;s at the top. Different
        position. React unmounts and remounts. Counter&apos;s state
        resets.
      </p>

      <p>
        This sounds like a contrived example, but it&apos;s the same
        rule that makes &quot;changing a component&apos;s key resets its
        state&quot; work. Identity in React is determined by{" "}
        <em>position + type + key</em>. Change any of those, and React
        treats it as a new component instance.
      </p>

      <h2>What about the &quot;virtual DOM&quot;?</h2>

      <p>
        You&apos;ve probably heard React described as &quot;the library
        with the virtual DOM.&quot; The phrase is dated. The mental
        model that&apos;s actually accurate today:
      </p>

      <ul>
        <li>
          You return a tree of plain JS objects (React Elements) from
          your components.
        </li>
        <li>
          React stores these objects in an internal data structure
          called the <strong>fiber tree</strong>. Each fiber represents
          one component instance and holds its hooks, props, and
          relationships to siblings/children/parent.
        </li>
        <li>
          On re-render, React produces a new tree of React Elements,
          walks the fiber tree, and figures out what changed using the
          rules above. Then it commits the minimum DOM operations.
        </li>
      </ul>

      <p>
        It&apos;s less &quot;virtual DOM&quot; and more &quot;React
        keeps a parallel data structure that mirrors the rendered tree
        and uses it to make smart decisions.&quot; Both descriptions
        point to the same machinery.
      </p>

      <Callout type="tip" title="When this knowledge pays off">
        You don&apos;t need to recall this lesson during normal feature
        work. It pays off when something weird happens: a state reset
        you didn&apos;t expect, focus jumping, an animation restarting,
        a third-party DOM library getting confused. The first question
        becomes: &quot;is React unmounting and remounting where I
        thought it was reusing?&quot; The answer is almost always yes,
        and the rules above tell you why.
      </Callout>

      <h2>Tools to see this in action</h2>

      <p>
        <strong>React DevTools.</strong> Install the browser extension if
        you haven&apos;t. The Components tab lets you see your component
        tree. The Profiler tab shows which components rendered in the
        last commit and how long each took. We&apos;ll go deeper on
        profiling in Module 11.
      </p>

      <p>
        For now, just open it on your flashcard app: every interaction
        you do shows you the components that re-rendered. Most edits to
        one card cause only that card and its parents (which read{" "}
        <code>cards</code>/<code>knownIds</code>) to re-render. That&apos;s
        reconciliation working as designed.
      </p>

      <HandsOn
        title="Watch reconciliation in DevTools"
        projectStep="Module 6 · Step 2"
        projectContext="You'll install React DevTools and use the Profiler to see exactly what gets re-rendered when you interact with your app. This is the most useful debugging skill in React."
        steps={[
          "Install **React Developer Tools** from your browser's extension store. (Chrome and Firefox both have it. Safari has a less-good version; if you're on Safari, switch browsers for this exercise.)",
          "Open your flashcards app in the browser, then open DevTools and switch to the **Components** tab. You should see a tree starting at App. Click around — you'll see Flashcard, Card, Deck, etc., each with their props and hook state.",
          "Switch to the **Profiler** tab and click the blue circle to start recording. Click 'Mark as known' on one card, then stop the recording.",
          "DevTools shows a flame chart of every component that rendered. Hover any component to see *why* it rendered (props change, state change, parent rendered).",
          "Try another scenario: type one letter in the search box, then stop recording. You'll see App and the search input re-rendered, but most Flashcards did NOT re-render (their props didn't change). That's reconciliation: React figured out which subtrees needed work and skipped the rest.",
          "Bonus experiment: temporarily wrap your cards `.map()` in `<div>{...}</div>` vs leaving it bare, and watch how that affects the profiler output. Wrappers can hide identity changes.",
          "Reflect: the Profiler is your debugging superpower for everything performance-related. When something feels slow in React, profile first, theorize second.",
        ]}
      />

      <Quiz
        question="You have `<>{a ? <UserCard /> : <UserCard />}</>` — same component, conditional. The condition flips. What happens to the component's state?"
        options={[
          { label: "It gets reset because the condition changed" },
          {
            label: "It's preserved — same position, same type means React reuses the instance, only re-renders with potentially new props",
            correct: true,
            explanation:
              "React's matching rule is position + type. The condition's value doesn't matter to the matcher; it just determines which expression evaluates. As long as the resulting JSX is the same component type at the same position, the instance is reused.",
          },
          { label: "It depends on whether `a` is truthy" },
          { label: "It's a runtime error to put the same component in both branches" },
        ]}
      />

      <Quiz
        question="What's the easiest way to force a component's state to reset when a prop changes?"
        options={[
          { label: "useEffect with that prop in the dependency array, calling setState to clear it" },
          {
            label: "Pass that prop as the `key` — when it changes, React treats it as a new instance and remounts with fresh state",
            correct: true,
            explanation:
              "The `key` is React's identity primitive for any component, not just list items. Passing a changing value as `key` is the cleanest way to say 'a new logical instance starts now.' We saw this preview in Module 3 ('You Might Not Need an Effect') and it's exactly this lesson's reconciliation rules in action.",
          },
          { label: "Wrap the component in a Fragment with that prop spread on it" },
          { label: "Use forceRemount() — a built-in React API for this" },
        ]}
      />

      <ShortAnswer
        question="Your animation library glitches every time the user toggles a layout switch. The two layouts use different wrapper elements (a `div` becomes a `section`). Explain what's happening in terms of reconciliation, and suggest the smallest fix."
        rubric={[
          "Different element type at the same position triggers unmount/mount of the entire subtree, which destroys and recreates DOM nodes that the animation library was tracking",
          "React sees `div` → `section` as 'replace this whole thing' rather than 'update props on this thing'",
          "Smallest fix: keep the same wrapper element type and toggle a class instead — `<div className={layout === 'wide' ? 'wide' : 'narrow'}>` — so reconciliation reuses the DOM node and the animation state is preserved",
        ]}
        topic="Reconciliation and DOM identity"
      />

      <h2>Module 6 wrap-up</h2>

      <p>
        Two short lessons. Module 6 was about <em>identity</em>: how
        React decides which JSX corresponds to which previous render,
        and what happens when that decision changes. Keys for lists,
        position + type for everything else. Now you have a concrete
        mental model for &quot;why did this re-render?&quot; and &quot;why
        did this state get reset?&quot; — the questions every React
        debugger eventually asks.
      </p>

      <p>
        Module 7 returns to building features: <strong>forms</strong>.
        We&apos;ll cover controlled vs uncontrolled, and then the React
        19 form actions API (<code>useActionState</code>,{" "}
        <code>useFormStatus</code>, <code>useOptimistic</code>) — the
        modern way to handle form submission with built-in pending and
        optimistic states.
      </p>
    </>
  );
}
