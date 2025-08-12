export default function ChildrenListLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-blue-100 rounded-lg p-4 border border-blue-100 animate-pulse max-w-[250px]"
        >
          <div className="flex flex-col items-center text-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gray-300 mb-3"></div>
            <div className="h-5 w-24 bg-gray-300 rounded mb-2"></div>
            <div className="space-y-2 w-full">
              <div className="h-4 w-full bg-gray-300 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="h-9 w-full bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );
}
