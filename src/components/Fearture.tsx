import { cn } from '@/lib/utils';
import { ArrowRight, Code2, Zap, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

export interface CardFlipProps {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: LucideIcon;
}

export default function CardFlip({ title, subtitle, description, features, icon: Icon }: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group relative h-[400px] w-full max-w-[420px] [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          'relative h-full w-full transition-all duration-700 [transform-style:preserve-3d]',
          isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
        )}
      >
        {/* FRONT side */}
        <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          
          <div className="relative h-full flex flex-col p-8">
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Icon className="h-10 w-10 text-primary" />
              </div>
              
              {/* Background abstract animation */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-12 opacity-10 -z-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-1.5 w-full bg-primary rounded-full mb-3 animate-[slideIn_4s_infinite]" style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
              </div>
            </div>

            <div className="mt-auto flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">{subtitle}</p>
              </div>
              <Zap className="text-primary h-6 w-6 animate-pulse" />
            </div>
          </div>
        </div>

        {/* BACK side */}
        <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
             </div>
             <h3 className="text-xl font-bold dark:text-white">{title}</h3>
          </div>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
            {description}
          </p>

          <div className="space-y-3 flex-1">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium dark:text-zinc-300">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {f}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center group/btn cursor-pointer">
            <span className="text-sm font-bold dark:text-white group-hover/btn:text-primary transition-colors">Explorer Module</span>
            <ArrowRight className="h-4 w-4 text-primary group-hover/btn:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}