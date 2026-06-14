/** 可复用液态玻璃面板 */
export default function GlassPanel({ children, className = '', variant = 'card', onClick, style }) {
  const base = variant === 'card' ? 'glass-card' : 'glass';
  return (
    <div
      className={`${base} p-5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
