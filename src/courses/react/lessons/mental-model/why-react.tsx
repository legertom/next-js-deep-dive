import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function WhyReact() {
  return (
    <>
      <h1>Why React Exists</h1>

      <p>
        Before we touch a single hook, let&apos;s answer the question that
        most React tutorials skip: <strong>why does React exist at all?</strong>{" "}
        You know JavaScript. You know the DOM. So why not just use the DOM
        directly?
      </p>

      <p>
        The answer is the foundation everything else in this course builds on.
        Get it now and the rest of React stops feeling like magic.
      </p>

      <h2>Building UI with the raw DOM</h2>

      <p>
        Imagine a tiny counter widget — a number and a button. Here&apos;s how
        you might build it with the DOM directly:
      </p>

      <CodeBlock filename="counter.js" language="javascript">
        {`let count = 0;

const root = document.getElementById("root");

function render() {
  // Wipe everything and rebuild from scratch
  while (root.firstChild) root.removeChild(root.firstChild);

  const wrapper = document.createElement("div");

  const p = document.createElement("p");
  p.textContent = "Count: " + count;

  const button = document.createElement("button");
  button.textContent = "+1";
  button.addEventListener("click", () => {
    count++;
    render();
  });

  wrapper.appendChild(p);
  wrapper.appendChild(button);
  root.appendChild(wrapper);
}

render();`}
      </CodeBlock>

      <p>
        It works. But notice what happens when the button is clicked: we{" "}
        <em>blow away the entire DOM and rebuild it from scratch</em>. Every
        click destroys and recreates the button, the paragraph, every text
        node. The browser does way more work than necessary, and any focus,
        scroll position, or selection state gets lost in the process.
      </p>

      <p>
        We could fix that by manually updating just the parts that changed:
      </p>

      <CodeBlock filename="counter-manual.js" language="javascript">
        {`let count = 0;

const countEl = document.getElementById("count");
const button = document.getElementById("inc");

button.addEventListener("click", () => {
  count++;
  countEl.textContent = String(count);
});`}
      </CodeBlock>

      <p>
        Better. But now we have two sources of truth: the <code>count</code>{" "}
        variable in JavaScript and <code>countEl.textContent</code> in the DOM.
        Every time <code>count</code> changes, we have to <em>remember</em> to
        update <code>countEl</code>. Forget once and the UI silently lies.
      </p>

      <Callout type="important" title="The core problem">
        Keeping UI in sync with state is the hardest problem in frontend
        development. Every &quot;the UI shows the wrong thing&quot; bug
        you&apos;ve ever seen is a sync failure between data and DOM.
      </Callout>

      <h2>What React does</h2>

      <p>
        React inverts the relationship. Instead of you telling the DOM what to
        change, you describe what the UI should look like for the current
        state, and React figures out the minimum changes needed to make the
        real DOM match.
      </p>

      <CodeBlock filename="Counter.jsx" language="jsx">
        {`function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}`}
      </CodeBlock>

      <p>
        That&apos;s the whole thing. <code>count</code> is the source of truth.
        The JSX describes &quot;here&apos;s what the UI looks like when{" "}
        <code>count</code> is X.&quot; You never touch the DOM. You never
        manually keep things in sync.
      </p>

      <p>
        React calls this <strong>declarative UI</strong>. You declare the
        result you want; React handles the imperative steps to get there.
      </p>

      <h2>The three things React actually gives you</h2>

      <p>Strip away every blog post and tutorial, and React is three things:</p>

      <ol>
        <li>
          <strong>A way to describe UI as a function of state.</strong>{" "}
          Components are functions. Same input → same output.
        </li>
        <li>
          <strong>A way to schedule updates when state changes.</strong> When
          you call <code>setCount</code>, React knows to re-render and
          reconcile.
        </li>
        <li>
          <strong>A reconciler that diffs the new UI against the old DOM.</strong>{" "}
          Only the things that actually changed touch the real DOM.
        </li>
      </ol>

      <p>
        Everything else — hooks, context, Suspense, Server Components, the
        Compiler — is built on top of those three primitives.
      </p>

      <h2>What React is NOT</h2>

      <p>
        This trips up a lot of people coming from frameworks like Angular or
        Vue. React is deliberately small. It does not give you:
      </p>

      <ul>
        <li>A router (you bring one — or use Next.js)</li>
        <li>A data-fetching library (same)</li>
        <li>A way to make HTTP requests</li>
        <li>A way to manage global state (no built-in store)</li>
        <li>A build tool, a bundler, or a dev server</li>
      </ul>

      <p>
        That minimalism is by design. React solves <em>one</em> problem —
        keeping UI in sync with state — and trusts you (or your framework) to
        pick the rest. This is also why people say &quot;React is a library,
        not a framework.&quot; Next.js is the framework you&apos;re layering on
        top of it.
      </p>

      <Callout type="info" title="Why this matters for the rest of the course">
        Every confusing React behavior eventually comes back to one of those
        three primitives. &quot;Why did this re-render?&quot; → reconciliation.
        &quot;Why is my state stale?&quot; → updates are scheduled, not
        immediate. &quot;Why did my component run twice?&quot; → React called
        your function twice because state changed. Hold those three ideas in
        your head and very little will surprise you.
      </Callout>

      <h2>The mini-app you&apos;re going to build</h2>

      <p>
        Across this course, you&apos;ll build a flashcard app. Each lesson
        adds one feature, and by the end you&apos;ll have a real, polished
        study tool with multiple decks, spaced repetition, search, AI-generated
        cards, and a study analytics dashboard. You can use it to study, well,
        anything — including React itself.
      </p>

      <p>Today we&apos;re just bootstrapping the project. Nothing fancy.</p>

      <HandsOn
        title="Set up the flashcard playground"
        projectStep="Project setup"
        projectContext="You'll create a fresh Vite + React + TypeScript project. We're using Vite (not Next.js) for the first 8 modules so you can see exactly what React provides on its own. We'll migrate to Next.js in Module 9 when we introduce Server Components."
        steps={[
          "Open a terminal in a directory where you keep code projects (NOT inside this course's repo). For example: `cd ~/code`",
          "Scaffold a new Vite project: `npm create vite@latest flashcards -- --template react-ts`",
          "Move into it and install: `cd flashcards && npm install`",
          "Start the dev server: `npm run dev`",
          "Open the URL Vite prints (usually `http://localhost:5173`) — you should see a Vite + React starter page with a counter.",
          "Open the project in VS Code: `code .`",
          "Take a moment to look at `src/App.tsx`. That's a React component. We'll be replacing this with our flashcard app over the next ~30 lessons.",
        ]}
      />

      <Quiz
        question="Which of these problems does React solve directly?"
        options={[
          { label: "Routing between pages" },
          {
            label: "Keeping the UI in sync with state",
            correct: true,
            explanation:
              "Exactly. React's core job is to keep what the user sees consistent with the data your app holds. Routing, data fetching, and global state are all things you (or a framework like Next.js) layer on top.",
          },
          { label: "Making HTTP requests to your backend" },
          { label: "Bundling and optimizing JavaScript for production" },
        ]}
      />

      <ShortAnswer
        question="In your own words, why is the imperative DOM approach (where you manually update elements when state changes) error-prone? Aim for 2–3 sentences."
        rubric={[
          "Mentions that there are two sources of truth (data in JS, the rendered DOM) that can drift apart",
          "Mentions that the developer has to remember to update the DOM every time the underlying state changes",
          "Bonus: notes that this gets exponentially harder as the UI grows in complexity",
        ]}
        topic="Why imperative DOM updates are error-prone"
      />

      <h2>What&apos;s next</h2>

      <p>
        Now that you know <em>why</em> React exists, the next lesson digs into{" "}
        <em>what a component actually is</em>: a function that returns JSX,
        and the rules that make JSX different from regular HTML.
      </p>
    </>
  );
}
