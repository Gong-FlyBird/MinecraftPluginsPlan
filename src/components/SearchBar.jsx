import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = '搜索插件、灵感、里程碑…' }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hermes-text-muted/50" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-input pl-10 text-sm"
      />
    </div>
  );
}
