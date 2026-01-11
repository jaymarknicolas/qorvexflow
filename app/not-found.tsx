// app/_not-found.tsx
import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFoundPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-primary p-4">
      <h1 className="text-6xl font-extrabold text-primary-foreground mb-4">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-primary-foreground mb-6">
        Oops! Page not found.
      </h2>
      <p className="text-primary-foreground/60 mb-6">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
      >
        Go Back Home
      </Link>
    </main>
  );
}
