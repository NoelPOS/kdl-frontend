export default function StudentSessionsLoading() {
  return (
    <div className="space-y-6">
      {/* Loading skeleton for session grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-blue-50 rounded-lg p-4 border border-blue-100 h-75 w-[250px] animate-pulse"
          >
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-20 mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
