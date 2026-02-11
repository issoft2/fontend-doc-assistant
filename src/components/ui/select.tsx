import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select 
    className={cn(
      "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
      props.className
    )} 
    {...props}
  >
    {children}
  </select>
);

const SelectContent = ({ children }: { children: React.ReactNode }) => children;
const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <option value={value}>{children}</option>
);
const SelectTrigger = ({ children }: { children: React.ReactNode }) => children;
const SelectValue = ({ children }: { children: React.ReactNode }) => children;

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
