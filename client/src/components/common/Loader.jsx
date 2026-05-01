export default function Loader({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}
