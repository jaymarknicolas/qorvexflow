// app/404.tsx
import Link from "next/link";

export default function Custom404() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-primary p-4">
      <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Oops! Page not found.
      </h2>
      <p className="text-gray-600 mb-6">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go Back Home
      </Link>
    </main>
  );
}
