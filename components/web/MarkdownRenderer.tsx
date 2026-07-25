"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

function CopyButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={copy}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            title="Copy code"
        >
            {copied
                ? <Check className="size-3.5 text-green-400" />
                : <Copy className="size-3.5 text-white/60" />
            }
        </button>
    );
}

export function MarkdownRenderer({ content }: { content: string }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                // ── Code blocks & inline code ──────────────────────────────
                code({ children, className, ...rest }) {
                    const language = /language-(\w+)/.exec(className || "")?.[1];
                    const codeString = String(children).replace(/\n$/, "");

                    // Inline code (no newlines, no language tag)
                    if (!className && !codeString.includes("\n")) {
                        return (
                            <code
                                className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[0.85em]"
                                {...rest}
                            >
                                {children}
                            </code>
                        );
                    }

                    // Fenced block — with or without language
                    return (
                        <div className="relative group not-prose my-4">
                            <CopyButton code={codeString} />
                            <SyntaxHighlighter
                                language={language ?? "text"}
                                style={isDark ? oneDark : oneLight}
                                PreTag="div"
                                customStyle={{
                                    margin: 0,
                                    borderRadius: "0.5rem",
                                    fontSize: "0.875rem",
                                    lineHeight: "1.6",
                                    overflowX: "auto",
                                }}
                                wrapLongLines={false}
                            >
                                {codeString}
                            </SyntaxHighlighter>
                        </div>
                    );
                },

                // Suppress the default <pre> wrapper — SyntaxHighlighter handles it
                pre({ children }) {
                    return <>{children}</>;
                },

                // ── Links ──────────────────────────────────────────────────
                a({ href, children, ...rest }) {
                    const isExternal = href?.startsWith("http");
                    return (
                        <a
                            href={href}
                            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                            {...rest}
                        >
                            {children}
                        </a>
                    );
                },

                // ── Blockquote ─────────────────────────────────────────────
                blockquote({ children }) {
                    return (
                        <blockquote className="not-prose border-l-4 border-primary/40 pl-4 py-1 italic text-muted-foreground my-4 rounded-r-sm bg-muted/20">
                            {children}
                        </blockquote>
                    );
                },

                // ── Tables (GFM) ───────────────────────────────────────────
                table({ children }) {
                    return (
                        <div className="not-prose overflow-x-auto my-6 rounded-lg border border-border">
                            <table className="w-full text-sm border-collapse">
                                {children}
                            </table>
                        </div>
                    );
                },
                thead({ children }) {
                    return <thead className="bg-muted/60">{children}</thead>;
                },
                th({ children }) {
                    return (
                        <th className="border-b border-border px-4 py-2.5 text-left font-semibold">
                            {children}
                        </th>
                    );
                },
                td({ children }) {
                    return (
                        <td className="border-b border-border/50 px-4 py-2 last:border-0">
                            {children}
                        </td>
                    );
                },
                tr({ children, ...rest }) {
                    return (
                        <tr className="even:bg-muted/20 hover:bg-muted/40 transition-colors" {...rest}>
                            {children}
                        </tr>
                    );
                },

                // ── Images ─────────────────────────────────────────────────
                img({ src, alt, title }) {
                    return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={src}
                            alt={alt ?? ""}
                            title={title}
                            className="rounded-lg max-w-full my-6 shadow-md mx-auto block"
                            loading="lazy"
                        />
                    );
                },

                // ── Headings ───────────────────────────────────────────────
                h1: ({ children }) => <h1 className="text-3xl font-bold tracking-tight mt-8 mb-4 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold tracking-tight mt-8 mb-3 pb-2 border-b border-border">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>,
                h4: ({ children }) => <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>,

                // ── Paragraphs ─────────────────────────────────────────────
                p: ({ children }) => <p className="leading-7 my-3 [&:first-child]:mt-0">{children}</p>,

                // ── Lists ──────────────────────────────────────────────────
                ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-7">{children}</li>,

                // ── HR ─────────────────────────────────────────────────────
                hr: () => <hr className="my-8 border-border" />,

                // ── Strong / Em ────────────────────────────────────────────
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
