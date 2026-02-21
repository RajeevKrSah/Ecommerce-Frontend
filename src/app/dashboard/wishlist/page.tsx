'use client';

import Link from 'next/link';

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
          <p className="text-gray-600 mt-1">Save items for later</p>
        </div>
        <Link
          href="/products"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Browse Products
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p className="text-gray-600 mb-4">Your wishlist is empty</p>
        <p className="text-sm text-gray-500 mb-4">
          Save items you love for later
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
