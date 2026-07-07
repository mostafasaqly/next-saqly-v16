import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeReact from "rehype-react";
import * as prod from "react/jsx-runtime";
import CodeBlock from "./CodeBlock";
import type { ReactElement } from "react";
import type { Element } from "hast";

function CalloutBlockquote({ children }: { children?: React.ReactNode }) {
  const text = flattenText(children);
  const isTip = text.trimStart().startsWith("💡");
  const isWarning = text.trimStart().startsWith("⚠️");

  if (isTip || isWarning) {
    return (
      <div className={`callout ${isTip ? "callout--tip" : "callout--warning"}`}>
        <span className="callout__icon">{isTip ? "💡" : "⚠️"}</span>
        <div>{children}</div>
      </div>
    );
  }

  return <blockquote className="border-l-2 border-neutral-700 pl-4 text-neutral-400">{children}</blockquote>;
}

function flattenText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return flattenText((node as ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

function ExampleAwareLink(props: React.ComponentProps<"a">) {
  const href = props.href ?? "";
  const match = href.match(/^\.?\/?examples\/([^/?#]+)$/);

  if (match) {
    return <a {...props} href={`#example-${match[1]}`} />;
  }

  return <a {...props} />;
}

function TableWrapper(props: React.ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table {...props} />
    </div>
  );
}

function CodeOrPre(props: React.ComponentProps<"pre"> & { node?: Element }) {
  const child = props.node?.children?.[0];
  const isCodeBlock = child && child.type === "element" && child.tagName === "code";

  if (isCodeBlock && child.type === "element") {
    const codeText = child.children
      .map((c) => (c.type === "text" ? c.value : ""))
      .join("");
    return <CodeBlock code={codeText} />;
  }

  return <pre {...props} />;
}

export default function Markdown({ markdown }: { markdown: string }) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeReact, {
      Fragment: prod.Fragment,
      jsx: prod.jsx,
      jsxs: prod.jsxs,
      passNode: true,
      components: {
        pre: CodeOrPre,
        blockquote: CalloutBlockquote,
        a: ExampleAwareLink,
        table: TableWrapper,
      },
    });

  const result = processor.processSync(markdown);
  return <>{result.result as ReactElement}</>;
}
