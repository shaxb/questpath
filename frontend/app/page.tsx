
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to QuestPath</h1>
      <p className="text-xl text-gray-600 mb-8">
        Transform your learning goals into RPG-style adventures
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>
        <Link 
          href="/register"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Register
        </Link>
      </div>
    </div>
  );
}