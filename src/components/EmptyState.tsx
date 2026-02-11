const EmptyState = ({ onQuestionSet }: { onQuestionSet: (q: string) => void }) => (
  <div className="h-full flex items-center justify-center text-slate-400">
    Ask your first question to get started
  </div>
);

export default EmptyState