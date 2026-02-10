import React, { useMemo } from "react"
import MarkdownIt from 'markdown-it';

interface MarkdownTextProps {
    content: string;
    className?: string;
    [key: string] : any;  // Forwards other props
}


const MarkdownText: React.FC<MarkdownTextProps> = ({
    content,
    className,
    ...props
}) => {
    // Memoize the Markdown instance to prevent recreation on every render
    const md = useMemo(() => {
        return new MarkdownIt({
            html: false,
            linkify: true,
            breaks: false,
        });
    }, []);

    // Memoize the rendered HTML to prevent recalculation when content hasn't changed
    const rendered = useMemo(() => {
        return content ? md.render(content) : '';
    
    }, [content, md]);

    return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: rendered}}
          {...props}
        />
    );
};

MarkdownText.displayName = 'MarkdownText';

export default MarkdownText;