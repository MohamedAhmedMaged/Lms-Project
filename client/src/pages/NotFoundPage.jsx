import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mt-2">Page Not Found</h2>
        <p className="text-gray-500 mt-2 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary gap-2">
          <Home size={18} /> Go Home
        </Link>
      </div>
    </div>
  );
}
