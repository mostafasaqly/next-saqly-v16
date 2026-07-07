// Lightweight JS/TS/JSX + Shell syntax tokenizer — no dependencies

export interface Token {
  type: string;
  value: string;
}

const SHELL_CMDS = new Set(["npm", "npx", "yarn", "pnpm", "node", "cd", "ls", "mkdir", "git", "docker", "curl"]);
const SHELL_SUBCMDS = new Set([
  "install", "i", "create", "run", "start", "build", "init", "add", "remove", "uninstall", "update", "dev", "migrate",
]);

function tokenizeShell(code: string): Token[] {
  const tokens: Token[] = [];

  for (const line of code.split("\n")) {
    if (tokens.length) tokens.push({ type: "plain", value: "\n" });

    const promptMatch = line.match(/^(\$\s*)/);
    let rest = line;
    if (promptMatch) {
      tokens.push({ type: "sh-prompt", value: promptMatch[1] });
      rest = line.slice(promptMatch[1].length);
    }

    if (rest.trimStart().startsWith("#")) {
      tokens.push({ type: "comment", value: rest });
      continue;
    }

    const words = rest.split(/(\s+)/);
    let wordIndex = 0;

    for (const word of words) {
      if (/^\s+$/.test(word)) {
        tokens.push({ type: "plain", value: word });
        continue;
      }

      if (wordIndex === 0 && SHELL_CMDS.has(word)) {
        tokens.push({ type: "sh-cmd", value: word });
      } else if (wordIndex === 1 && SHELL_SUBCMDS.has(word)) {
        tokens.push({ type: "sh-sub", value: word });
      } else if (word.startsWith("--")) {
        tokens.push({ type: "sh-flag", value: word });
      } else if (word.startsWith("-") && word.length <= 3) {
        tokens.push({ type: "sh-flag", value: word });
      } else if (
        wordIndex >= 1 &&
        /^(@[a-z0-9-]+\/)?[a-z0-9][@a-z0-9._/-]*$/i.test(word) &&
        !SHELL_CMDS.has(word) &&
        !SHELL_SUBCMDS.has(word)
      ) {
        tokens.push({ type: "sh-pkg", value: word });
      } else {
        tokens.push({ type: "plain", value: word });
      }

      wordIndex++;
    }
  }

  return tokens;
}

const TOKEN_PATTERNS: { type: string; re: RegExp }[] = [
  { type: "string", re: /(`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*')/g },
  { type: "comment", re: /(\/\/[^\n]*)/g },
  { type: "comment", re: /(\/\*[\s\S]*?\*\/)/g },
  { type: "tag", re: /(<\/?[A-Za-z][A-Za-z0-9.]*|\/?>)/g },
  { type: "number", re: /\b(\d+\.?\d*)\b/g },
  {
    type: "keyword",
    re: /\b(import|export|default|from|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|typeof|instanceof|in|of|async|await|try|catch|finally|throw|null|undefined|true|false|void|delete|yield|static|get|set|interface|type|as|enum|implements|public|private|protected|readonly|namespace)\b/g,
  },
  {
    type: "builtin",
    re: /\b(useState|useEffect|useRef|useContext|useMemo|useCallback|useReducer|useId|useOptimistic|useActionState|useFormStatus|useTransition|useDeferredValue|useLayoutEffect|useSyncExternalStore|use|useRouter|usePathname|useSearchParams|cookies|headers|redirect|notFound|revalidatePath|revalidateTag)\b/g,
  },
  { type: "attr", re: /\b([a-zA-Z][a-zA-Z0-9]*)(?=\s*=\s*[{"'])/g },
  { type: "fn", re: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g },
  { type: "punct", re: /(=>|[{}()[\];,.:?])/g },
];

function tokenizeJS(code: string): Token[] {
  const spans: { start: number; end: number; type: string; value: string }[] = [];

  for (const { type, re } of TOKEN_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      spans.push({ start: m.index, end: m.index + m[0].length, type, value: m[0] });
    }
  }

  spans.sort((a, b) => a.start - b.start || b.end - a.end);

  const tokens: Token[] = [];
  let cursor = 0;

  for (const span of spans) {
    if (span.start < cursor) continue;
    if (span.start > cursor) {
      tokens.push({ type: "plain", value: code.slice(cursor, span.start) });
    }
    tokens.push({ type: span.type, value: span.value });
    cursor = span.end;
  }

  if (cursor < code.length) {
    tokens.push({ type: "plain", value: code.slice(cursor) });
  }

  return tokens;
}

function isShellCode(code: string): boolean {
  const firstWord = code.trimStart().replace(/^\$\s*/, "").split(/\s/)[0];
  return SHELL_CMDS.has(firstWord);
}

export function tokenize(code: string): Token[] {
  return isShellCode(code) ? tokenizeShell(code) : tokenizeJS(code);
}
