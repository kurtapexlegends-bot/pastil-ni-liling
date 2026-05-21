export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full mt-2">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-50 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse mt-2"></div>
          </div>
        ))}
      </div>
      
      {/* Main Content Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
          <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-gray-50 rounded-xl w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl w-full animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
