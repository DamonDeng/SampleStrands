import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RehypeKatex from "rehype-katex";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect, useMemo } from "react";
import React from "react";
import { useAppTranslation } from '../contexts/I18nContext';
import styles from '../styles/Markdown.module.css';

// Use default rehype-highlight without custom lowlight configuration


// Copy to clipboard utility function
const copyToClipboard = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }
    document.body.removeChild(textArea);
  }
};

export function PreCode(props: React.HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (ref.current) {
      const code = ref.current.innerText;
      try {
        await copyToClipboard(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  // Extract language from className if available
  const getLanguage = () => {
    const codeElement = ref.current?.querySelector('code');
    if (codeElement && codeElement.className) {
      const match = codeElement.className.match(/language-(\w+)/);
      return match ? match[1] : '';
    }
    return '';
  };

  return (
    <pre ref={ref} className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.languageLabel}>
          {getLanguage() || 'code'}
        </span>
        <button
          className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy code"}
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
      {props.children}
    </pre>
  );
}

function escapeDollarNumber(text: string) {
  let escapedText = "";

  for (let i = 0; i < text.length; i += 1) {
    let char = text[i];
    const nextChar = text[i + 1] || " ";

    if (char === "$" && nextChar >= "0" && nextChar <= "9") {
      char = "\\$";
    }

    escapedText += char;
  }

  return escapedText;
}

function MarkDownContent(props: { content: string }) {
  const escapedContent = useMemo(
    () => escapeDollarNumber(props.content),
    [props.content],
  );

  return (
    <ReactMarkdown
      remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
      rehypePlugins={[
        RehypeKatex,
        [
          RehypeHighlight,
          {
            detect: true, // Enable automatic language detection
            ignoreMissing: true, // Don't throw errors for unknown languages
          },
        ],
      ]}
      components={{
        pre: PreCode,
        p: (pProps) => {
          // Extract only valid HTML attributes for <p> element
          const {
            className,
            id,
            style,
            title,
            lang,
            onClick,
            onMouseEnter,
            onMouseLeave,
            children,
            ...otherProps
          } = pProps;

          // Only pass known safe HTML attributes
          const safeProps: React.HTMLAttributes<HTMLParagraphElement> = {
            className,
            id,
            style,
            title,
            lang,
            onClick,
            onMouseEnter,
            onMouseLeave,
            dir: "auto"
          };

          // Remove undefined values
          Object.keys(safeProps).forEach(key => {
            if (safeProps[key as keyof typeof safeProps] === undefined) {
              delete safeProps[key as keyof typeof safeProps];
            }
          });

          return <p {...safeProps}>{children}</p>;
        },
        a: (aProps) => {
          const href = aProps.href || "";
          const isInternal = /^\/#/i.test(href);
          const target = isInternal ? "_self" : aProps.target ?? "_blank";

          // Extract only valid HTML attributes for <a> element
          const {
            className,
            id,
            style,
            title,
            rel,
            onClick,
            onMouseEnter,
            onMouseLeave,
            children,
            ...otherProps
          } = aProps;

          // Only pass known safe HTML attributes
          const safeProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
            href,
            target,
            className,
            id,
            style,
            title,
            rel,
            onClick,
            onMouseEnter,
            onMouseLeave
          };

          // Remove undefined values
          Object.keys(safeProps).forEach(key => {
            if (safeProps[key as keyof typeof safeProps] === undefined) {
              delete safeProps[key as keyof typeof safeProps];
            }
          });

          return <a {...safeProps}>{children}</a>;
        },
      }}
    >
      {escapedContent}
    </ReactMarkdown>
  );
}

export const MarkdownContent = React.memo(MarkDownContent);

export function Markdown(
  props: {
    content: string;
    loading?: boolean;
    fontSize?: number;
    parentRef?: RefObject<HTMLDivElement>;
    defaultShow?: boolean;
  } & React.DOMAttributes<HTMLDivElement>,
) {
  const { t: tcd } = useAppTranslation('common');
  const mdRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={styles.markdownBody}
      style={{
        fontSize: `${props.fontSize ?? 14}px`,
      }}
      ref={mdRef}
      onContextMenu={props.onContextMenu}
      onDoubleClickCapture={props.onDoubleClickCapture}
      dir="auto"
    >
      {props.loading ? (
        <div className={styles.loading}>{tcd('COMMON.STATUS.LOADING')}</div>
      ) : (
        <MarkdownContent content={props.content} />
      )}
    </div>
  );
}
