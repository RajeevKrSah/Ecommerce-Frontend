/**
 * Product Card Loading Skeleton
 * Reusable skeleton component for loading states
 */

export const ProductCardSkeleton = () => {
  return (
    <div className="animate-pulse rounded-2xl overflow-hidden bg-white border border-gray-100">
      <div className="aspect-[3/4] bg-gray-200"></div>
      <div className="p-5 space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-5 bg-gray-200 rounded w-1/3 mt-2"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
