export default function CustomerDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
               <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
               <div className="w-24 h-4 bg-gray-100 rounded-full"></div>
            </div>
            <div className="w-20 h-6 bg-gray-100 rounded-full"></div>
          </div>
          <div className="space-y-4 border-y border-gray-50 py-6">
            <div className="flex justify-between">
              <div className="w-32 h-3 bg-gray-100 rounded-full"></div>
              <div className="w-12 h-3 bg-gray-100 rounded-full"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-40 h-3 bg-gray-100 rounded-full"></div>
              <div className="w-12 h-3 bg-gray-100 rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-20 h-3 bg-gray-100 rounded-full"></div>
            <div className="w-24 h-6 bg-gray-100 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
