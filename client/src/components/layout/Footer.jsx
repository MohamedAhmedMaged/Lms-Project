import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-primary-400" size={24} />
              <span className="text-lg font-bold text-white">LearnHub</span>
            </div>
            <p className="text-sm text-gray-400">
              Your gateway to knowledge. Learn from the best instructors at your
              own pace.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Platform</h4>
            <div className="space-y-2 text-sm">
              <Link
                to="/courses"
                className="block hover:text-white transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Lumina Learn. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
