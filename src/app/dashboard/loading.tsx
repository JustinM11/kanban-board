// src/app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400">Loading dashboard...</span>
      </div>
    </div>
  );
}
