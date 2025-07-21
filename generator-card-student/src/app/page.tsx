"use client";

import dynamic from "next/dynamic";

// Dynamically import StudentCardGenerator with no SSR
const StudentCardGenerator = dynamic(
  () => import("@/components/StudentCardGenerator").then(mod => ({ default: mod.StudentCardGenerator })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading card generator...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Indian Student ID Card Generator
          </h1>
          <p className="text-gray-600">
            Generate realistic student ID cards for Babu Banarasi Das University
          </p>
        </header>
        <StudentCardGenerator />
      </div>
    </div>
  );
}
