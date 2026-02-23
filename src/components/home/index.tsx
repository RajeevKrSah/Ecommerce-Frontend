/**
 * Home Page Component
 * Displays hero banner and trending/featured products only
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductCardSkeleton } from '@/components/common/ProductCardSkeleton';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import HeroBanner from './hero';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    images?: Array<{ image_url: string; full_image_url?: string }>;
    category?: { id: number; name: string };
    stock_quantity: number;
    is_featured?: boolean;
    created_at?: string;
}

const TRENDING_PRODUCTS_COUNT = 8;

export default function Home() {
    const { addToast } = useToast();
    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();

    // State - only what we need for trending products
    const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch only trending/featured products
    useEffect(() => {
        fetchTrendingProducts();
    }, []);

    const fetchTrendingProducts = async () => {
        try {
            setLoading(true);

            // Fetch only featured products
            const productsResponse = await productService.getProducts({
                featured: true,
                per_page: TRENDING_PRODUCTS_COUNT,
                sort_by: 'created_at',
                sort_order: 'desc',
            });

            const productsData = Array.isArray(productsResponse)
                ? productsResponse
                : productsResponse?.data || [];

            setTrendingProducts(productsData);
        } catch (err) {
            console.error('Failed to fetch trending products:', err);
            addToast({
                type: 'error',
                message: 'Failed to load trending products',
            });
            setTrendingProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Event handlers
    const handleAddToCart = useCallback(async (productId: number) => {
        try {
            const product = trendingProducts.find(p => p.id === productId);
            if (!product) return;

            if (product.stock_quantity <= 0) {
                addToast({
                    type: 'error',
                    message: 'This product is out of stock',
                });
                return;
            }

            await addToCart(productId, 1);

            addToast({
                type: 'success',
                message: `${product.name} added to cart!`,
            });
        } catch (err) {
            console.error('Failed to add to cart:', err);
            addToast({
                type: 'error',
                message: 'Failed to add product to cart',
            });
        }
    }, [trendingProducts, addToCart, addToast]);

    const handleAddToWishlist = useCallback(async (productId: number) => {
        try {
            const product = trendingProducts.find(p => p.id === productId);
            if (!product) return;

            await addToWishlist(productId);

            addToast({
                type: 'success',
                message: `${product.name} added to wishlist!`,
            });
        } catch (err) {
            console.error('Failed to add to wishlist:', err);
            addToast({
                type: 'error',
                message: 'Failed to add product to wishlist',
            });
        }
    }, [trendingProducts, addToWishlist, addToast]);


    // Loading skeleton
    const LoadingSkeleton = ({ count = 8 }: { count?: number }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <HeroBanner />

            {/* Trending Products Section */}
            <section className="bg-white py-16 border-b" aria-labelledby="trending-heading">
                <div className="container mx-auto px-4 md:px-12 lg:px-24">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-2">
                            <div className="h-px w-16 bg-gray-300" aria-hidden="true"></div>
                            <h2 id="trending-heading" className="text-3xl font-bold text-gray-900">
                                TRENDING PRODUCTS
                            </h2>
                            <div className="h-px w-16 bg-gray-300" aria-hidden="true"></div>
                        </div>
                        <p className="text-gray-500 italic">Top picks of the week</p>
                    </div>

                    {/* Trending Products Grid */}
                    {loading ? (
                        <LoadingSkeleton count={8} />
                    ) : trendingProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {trendingProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        onAddToWishlist={handleAddToWishlist}
                                    />
                                ))}
                            </div>

                            {/* View All Products Link */}
                            <div className="text-center mt-12">
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                >
                                    View All Products
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No trending products available at the moment</p>
                            <Link
                                href="/products"
                                className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Browse All Products
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
