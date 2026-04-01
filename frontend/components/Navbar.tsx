'use client';

import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Agentic Graph RAG</div>
        <div>
          {user ? (
            <>
              <a
                href="/dashboard"
                className="mr-4 hover:underline"
              >
                Dashboard
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="mr-4 hover:underline"
              >
                Login
              </a>
              <a
                href="/register"
                className="hover:underline"
              >
                Register
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}