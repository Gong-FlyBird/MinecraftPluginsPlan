import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon, title, description, action }) {
  const Icon = icon || PackageOpen;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      <Icon size={48} className="text-hermes-gold/15 mb-4" />
      <h3 className="text-lg font-medium text-hermes-text-muted mb-2">{title}</h3>
      {description && <p className="text-sm text-hermes-text-muted/60 max-w-md mb-6">{description}</p>}
      {action}
    </div>
  );
}
