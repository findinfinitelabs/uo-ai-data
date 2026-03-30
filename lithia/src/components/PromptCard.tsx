import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type PromptCardProps = {
  label: string;
  content: string;
  tone: 'prompt' | 'example';
};

export default function PromptCard({ label, content, tone }: PromptCardProps) {
  return (
    <section className={`prompt-card ${tone}`}>
      <h3>{label}</h3>
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </section>
  );
}
