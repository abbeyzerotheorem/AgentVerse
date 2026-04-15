'use client';

import React, { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'jsx' }: CodeBlockProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Code has been copied to your clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="relative group w-full overflow-hidden rounded-lg border border-border bg-muted/50">
      {/* Language Label */}
      <div className="flex items-center justify-between bg-muted px-4 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code Block */}
      <Highlight theme={themes.dracula} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} overflow-x-auto p-4 text-sm leading-relaxed`}
            style={style}
          >
            <div className="flex">
              {/* Line Numbers */}
              <div className="mr-4 select-none text-right text-muted-foreground opacity-50 font-mono text-xs">
                {tokens.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Code */}
              <div className="flex-1">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </pre>
        )}
      </Highlight>
    </div>
  );
}