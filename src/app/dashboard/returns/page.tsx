'use client';

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Returns & Refunds</h1>
        <p className="text-gray-600 mt-1">Manage your return requests</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <p className="text-gray-600 mb-4">No return requests</p>
        <p className="text-sm text-gray-500">
          You haven't initiated any returns yet
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Policy</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Returns accepted within 30 days of delivery</p>
          <p>• Items must be unused and in original packaging</p>
          <p>• Refunds processed within 5-7 business days</p>
          <p>• Free return shipping on defective items</p>
        </div>
      </div>
    </div>
  );
}
