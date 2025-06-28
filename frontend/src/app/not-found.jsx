"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const NotFoundPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 ">
      <div className="text-center">
        <h1 className="text-4xl font-bold mt-8">Page Not Found</h1>
        <p className="mt-4 text-lg">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-full cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Go Back
          </button>
          <Link href="/" legacyBehavior>
            <a className="ml-4 px-6 py-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 transition">
              Go to Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;