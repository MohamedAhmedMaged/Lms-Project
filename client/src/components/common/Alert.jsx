import { AlertCircle, CheckCircle, X } from 'lucide-react';

export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const Icon = type === 'error' ? AlertCircle : type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${styles[type]}`}>
      <Icon size={18} />
      <span className="flex-1 text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-0.5 rounded hover:bg-black/5">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
