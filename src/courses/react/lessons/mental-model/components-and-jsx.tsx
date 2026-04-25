import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function ComponentsAndJsx() {
  return (
    <>
      <h1>Components &amp; JSX</h1>

      <p>
        Last lesson we said React describes UI as a function of state. This
        lesson is about that <em>function</em>. In React, the unit of UI is
        the <strong>component</strong>, and a component is — almost always —{" "}
        <strong>just a JavaScript function that returns JSX</strong>.
      </p>

      <p>
        That sentence is the whole lesson. Everything else is rules and
        gotchas around it.
      </p>

      <h2>The simplest component</h2>

      <CodeBlock filename="Greeting.tsx" language="tsx">
        {`function Greeting() {
  return <p>Hello, world.</p>;
}`}
      </CodeBlock>

      <p>That&apos;s it. That&apos;s a component. To use it, you call it like a tag:</p>

      <CodeBlock filename="App.tsx" language="tsx">
        {`function App() {
  return (
    <div>
      <Greeting />
      <Greeting />
    </div>
  );
}`}
      </CodeBlock>

      <p>
        Two paragraphs render. The function ran twice. Notice the rules
        already showing up:
      </p>

      <ul>
        <li>
          Component names are <strong>PascalCase</strong> (<code>Greeting</code>),
          which is how React tells your components apart from regular HTML
          tags. <code>&lt;greeting /&gt;</code> would be treated as an unknown
          HTML element.
        </li>
        <li>
          They&apos;re used as <strong>self-closing tags</strong> when they have
          no children: <code>&lt;Greeting /&gt;</code>, not{" "}
          <code>&lt;Greeting&gt;&lt;/Greeting&gt;</code>.
        </li>
      </ul>

      <h2>What is JSX, actually?</h2>

      <p>
        JSX looks like HTML inside JavaScript, but it&apos;s neither. JSX is{" "}
        <strong>syntactic sugar</strong> for plain function calls. The build
        tool (Babel, SWC, or in your case Turbopack/Vite) compiles it down
        to JavaScript before the browser ever sees it.
      </p>

      <p>This JSX:</p>

      <CodeBlock language="jsx">
        {`<p className="greeting">Hello, world.</p>`}
      </CodeBlock>

      <p>compiles to roughly this:</p>

      <CodeBlock language="javascript">
        {`React.createElement("p", { className: "greeting" }, "Hello, world.");`}
      </CodeBlock>

      <p>
        The return value is a plain JavaScript object — a <strong>React Element</strong>.
        It&apos;s a description of what should be on screen, not the screen
        itself. React reads this object, decides what to do, and then talks
        to the DOM on your behalf.
      </p>

      <Callout type="info" title="Why this matters">
        Knowing JSX is just function calls demystifies a lot. JSX tags
        compose because they&apos;re just expressions returning objects. Your
        component is just a function returning more of those objects. The
        whole tree is one big call graph.
      </Callout>

      <h2>JSX rules and gotchas</h2>

      <p>
        Because JSX is JS, not HTML, a handful of details differ. Your
        muscle memory from HTML will fight you on these — write through it
        once and they stick.
      </p>

      <h3>1. A component must return a single root element</h3>

      <p>This is illegal:</p>

      <CodeBlock language="jsx">
        {`function Bad() {
  return (
    <h1>Title</h1>
    <p>Body</p>
  );
}`}
      </CodeBlock>

      <p>
        A function can only return one thing. JSX is no exception. Wrap
        siblings in something:
      </p>

      <CodeBlock language="jsx">
        {`function Good() {
  return (
    <div>
      <h1>Title</h1>
      <p>Body</p>
    </div>
  );
}`}
      </CodeBlock>

      <p>
        If you don&apos;t want an extra wrapper element in the DOM, use a{" "}
        <strong>Fragment</strong> — written as <code>&lt;&gt;...&lt;/&gt;</code>:
      </p>

      <CodeBlock language="jsx">
        {`function Good() {
  return (
    <>
      <h1>Title</h1>
      <p>Body</p>
    </>
  );
}`}
      </CodeBlock>

      <h3>2. Attributes are camelCased</h3>

      <p>
        HTML uses lowercase <code>onclick</code>, <code>tabindex</code>,{" "}
        <code>readonly</code>. JSX uses <code>onClick</code>,{" "}
        <code>tabIndex</code>, <code>readOnly</code>.
      </p>

      <h3>
        3. <code>class</code> is <code>className</code>, <code>for</code> is <code>htmlFor</code>
      </h3>

      <p>
        Both <code>class</code> and <code>for</code> are reserved words in
        JavaScript, so JSX renames them. This is the rule that bites
        rusty React devs most often.
      </p>

      <CodeBlock language="jsx">
        {`<label htmlFor="email" className="form-label">Email</label>
<input id="email" className="form-input" />`}
      </CodeBlock>

      <h3>4. Curly braces drop you back into JavaScript</h3>

      <p>
        Anywhere inside JSX, <code>{`{}`}</code> means &quot;evaluate this
        as a JS expression and put the result here.&quot; You can put
        variables, function calls, ternaries, anything that produces a
        value:
      </p>

      <CodeBlock language="jsx">
        {`const name = "Tom";
const isAdmin = true;

<p>Hello, {name.toUpperCase()}.</p>
<p>Role: {isAdmin ? "admin" : "user"}</p>
<p>Year: {new Date().getFullYear()}</p>`}
      </CodeBlock>

      <p>
        Note: statements like <code>if</code> and <code>for</code> aren&apos;t
        expressions, so you can&apos;t use them inline. Use ternaries,{" "}
        <code>&&</code>, or pull the logic above the return statement.
      </p>

      <h3>5. Strings vs expressions in attributes</h3>

      <CodeBlock language="jsx">
        {`<img src="/logo.png" alt="Logo" />          // string literals: quotes
<img src={logoUrl} alt={altText} />          // expressions: braces
<button disabled={count === 0}>Buy</button>  // expressions can be any value`}
      </CodeBlock>

      <h3>6. All tags must close</h3>

      <p>
        HTML tolerates <code>&lt;br&gt;</code> and <code>&lt;img&gt;</code>{" "}
        without closing slashes. JSX does not. Either close the tag (
        <code>&lt;br /&gt;</code>) or write a closing tag.
      </p>

      <h2>Props: how data flows in</h2>

      <p>
        A component is a function. So how do you pass data to it? Same way
        you pass data to any function: arguments. In React, those arguments
        come in as a single object called <strong>props</strong>.
      </p>

      <CodeBlock filename="Greeting.tsx" language="tsx">
        {`type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <p>Hello, {name}.</p>;
}

// Usage:
<Greeting name="Tom" />
<Greeting name="Ada" />`}
      </CodeBlock>

      <p>
        When you write <code>&lt;Greeting name=&quot;Tom&quot; /&gt;</code>,
        React calls <code>Greeting({`{ name: "Tom" }`})</code>. That&apos;s
        all that&apos;s happening. Once you see it that way, JSX is just a
        prettier function call.
      </p>

      <Callout type="tip" title="The TypeScript habit">
        Always type your props. Defining a <code>Props</code> type catches
        renames, missed required props, and typos before they hit the
        browser. We&apos;ll go deeper on TS patterns in Module 12, but get
        in the habit now.
      </Callout>

      <h3>Children: a special prop</h3>

      <p>
        Anything you put <em>between</em> a component&apos;s opening and
        closing tags becomes the <code>children</code> prop:
      </p>

      <CodeBlock language="tsx">
        {`function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

// Usage:
<Card>
  <h2>Title</h2>
  <p>Body text</p>
</Card>`}
      </CodeBlock>

      <p>
        We&apos;ll spend a whole lesson on <code>children</code> in Module 4
        — it&apos;s the most powerful prop in React.
      </p>

      <h2>Composing components</h2>

      <p>
        The whole game is composing small components into bigger ones.
        There&apos;s no special syntax for this — components use other
        components the same way they use HTML tags:
      </p>

      <CodeBlock language="tsx">
        {`function FlashcardList() {
  return (
    <div>
      <Flashcard question="What is JSX?" />
      <Flashcard question="What is a React Element?" />
      <Flashcard question="What does PascalCase signal?" />
    </div>
  );
}`}
      </CodeBlock>

      <p>
        Three <code>Flashcard</code> components rendered side by side. Each
        gets its own props. Each is its own function call. Composition is
        free.
      </p>

      <h2>Building the first flashcard</h2>

      <p>
        Time to put a component into your playground. The flashcard
        won&apos;t be interactive yet — no flip, no click. Just a static
        card showing a question. We&apos;ll add behavior in Module 2.
      </p>

      <HandsOn
        title="Render your first Flashcard"
        projectStep="Module 1 · Step 1"
        projectContext="You're going to delete the Vite starter content and replace it with a single Flashcard component. By the end of this exercise you'll have a real React component composed inside an App component, with typed props."
        steps={[
          "Open `src/App.tsx` in your flashcards project.",
          "Delete everything in the file.",
          "Paste this in: ```tsx\nimport './App.css';\n\ntype FlashcardProps = {\n  question: string;\n};\n\nfunction Flashcard({ question }: FlashcardProps) {\n  return (\n    <div className=\"flashcard\">\n      <p className=\"flashcard-question\">{question}</p>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <main className=\"app\">\n      <h1>Flashcards</h1>\n      <Flashcard question=\"What is a React Element?\" />\n      <Flashcard question=\"What does the className prop do?\" />\n      <Flashcard question=\"Why must JSX return a single root?\" />\n    </main>\n  );\n}\n```",
          "Replace the contents of `src/App.css` with: ```css\n.app { max-width: 600px; margin: 2rem auto; padding: 1rem; font-family: system-ui, sans-serif; }\n.app h1 { font-size: 2rem; margin-bottom: 1.5rem; }\n.flashcard { border: 1px solid #d4d4d8; border-radius: 12px; padding: 1.25rem; margin-bottom: 0.75rem; background: #fafafa; }\n.flashcard-question { margin: 0; font-size: 1.05rem; line-height: 1.5; }\n```",
          "Save both files. Look at the dev server tab — you should see three flashcards stacked vertically, each with a different question.",
          "Try editing one of the `question` props. The page should hot-reload instantly. That's React picking up the prop change.",
          "Bonus: try removing `className` and replacing it with `class`. Open the browser console — React will warn you. Put it back to `className` afterwards.",
        ]}
      />

      <Callout type="important" title="What just happened">
        You wrote two components. <code>App</code> calls{" "}
        <code>Flashcard</code> three times with different props. React
        renders three different paragraphs. You touched the DOM zero times.
        That&apos;s the whole pattern.
      </Callout>

      <Quiz
        question="Which of these is NOT valid JSX?"
        options={[
          {
            label: '<input class="form-input" type="email" />',
            correct: true,
            explanation:
              'In JSX you must use className, not class. "class" is a reserved word in JavaScript, so JSX renamed the attribute. Same goes for "for" → "htmlFor".',
          },
          { label: "<button onClick={handleClick}>Save</button>" },
          { label: "<input type=\"email\" required />" },
          { label: "<>\n  <h1>Title</h1>\n  <p>Body</p>\n</>" },
        ]}
      />

      <Quiz
        question="What does JSX compile to?"
        options={[
          { label: "Raw HTML strings that get inserted with innerHTML" },
          {
            label: "Plain JavaScript function calls (e.g. React.createElement) that return objects",
            correct: true,
            explanation:
              "JSX is syntactic sugar. The build tool turns each tag into a function call (React.createElement, or in newer setups _jsx) that produces a plain object — a React Element. React reads those objects and updates the DOM.",
          },
          { label: "A custom binary format that React parses at runtime" },
          { label: "Direct DOM API calls like document.createElement" },
        ]}
      />

      <ShortAnswer
        question="Explain in your own words what a 'React Element' is and how it differs from a DOM element. Aim for 2–3 sentences."
        rubric={[
          "A React Element is a plain JavaScript object — a description of what UI should look like",
          "A DOM element is the actual node the browser renders, managed by the browser",
          "React reads React Elements and decides which DOM operations to perform; the user never directly creates DOM elements in React",
        ]}
        topic="React Elements vs DOM Elements"
      />

      <h2>What&apos;s next</h2>

      <p>
        You can now write components and pass props. But everything you&apos;ve
        built so far is static — render once and done. The next lesson digs
        into the <strong>render cycle</strong>: what React actually does when
        a component runs, why it might run more than once, and what
        &quot;pure&quot; means in this context. Once that clicks, hooks make
        sense.
      </p>
    </>
  );
}
