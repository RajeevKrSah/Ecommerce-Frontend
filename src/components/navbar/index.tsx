"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useEffect, useState, useCallback } from "react";
import {
    FiSearch,
    FiHeart,
    FiMenu,
    FiChevronDown,
    FiX,
} from "react-icons/fi";
import { HiOutlineShoppingBag } from 'react-icons/hi';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface NavItem {
    name: string;
    href: string;
}

const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Cart", href: "/cart" },
    { name: "Wishlist", href: "/wishlist" },
];

export default function Nav() {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchCategories();
    }, []);

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Handle search
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    }, [searchQuery, router]);

    // Handle category click
    const handleCategoryClick = useCallback((categoryId: number) => {
        router.push(`/products?category=${categoryId}`);
        setOpen(false);
    }, [router]);

    // Handle logout
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [logout, router]);

    const cartItemsCount = mounted ? cartCount : 0;
    const wishlistItemsCount = mounted ? wishlistCount : 0;

    // Determine active tab based on pathname
    const getActiveTab = () => {
        if (pathname === '/') return 'Home';
        if (pathname.startsWith('/products')) return 'Products';
        if (pathname.startsWith('/cart')) return 'Cart';
        if (pathname.startsWith('/wishlist')) return 'Wishlist';
        return '';
    };

    return (
        <header className="w-full">
            {/* ================= MAIN HEADER ================= */}
            <div className="bg-[#2f2f2f]">
                <div className="container mx-auto px-4 md:px-12 lg:px-24 py-5 flex items-center justify-between gap-6">

                    {/* Logo */}
                    <div className="flex items-center gap-2 text-white text-2xl font-bold">
                        <span className="text-yellow-400 text-3xl">▮</span>
                        Molla
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search product ..."
                            className="w-full rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none border border-gray-100"
                        />
                        <button 
                            type="submit" 
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label="Search"
                        >
                            <FiSearch />
                        </button>
                    </form>

                    {/* Icons */}
                    <div className="flex items-center gap-8 text-gray-200 text-sm">

                        <Link href="/wishlist" className="relative flex flex-col items-center cursor-pointer">
                            <FiHeart size={22} />
                            <span>Wishlist</span>
                            {wishlistItemsCount > 0 && (
                                <span className="absolute -top-3 -right-2 bg-yellow-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {wishlistItemsCount > 9 ? '9+' : wishlistItemsCount}
                                </span>
                            )}
                        </Link>

                        <div className="relative flex flex-col items-center cursor-pointer">
                            <Link href="/cart" className="relative text-white">
                                <HiOutlineShoppingBag size={24} />
                            </Link>
                            <span>Cart</span>
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-3 -right-2 bg-yellow-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                                </span>
                            )}
                        </div>

                        {/* Auth Section */}
                        {isLoading ? (
                            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                        ) : mounted && isAuthenticated && user ? (
                            <div className="relative group">
                                <div className="flex items-center space-x-2 cursor-pointer">
                                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                                        <span className="text-sm font-semibold text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-semibold text-white">{user.name.split(' ')[0]}</p>
                                        <p className="text-xs text-gray-200">My Account</p>
                                    </div>
                                </div>
                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <Link href="/dashboard" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b">
                                        Dashboard
                                    </Link>
                                    <Link href="/dashboard/orders" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b">
                                        My Orders
                                    </Link>
                                    <Link href="/dashboard/profile" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b">
                                        Profile
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/login">
                                    <button className="hidden sm:inline-flex hover:text-yellow-400 transition-colors">
                                        Sign In
                                    </button>
                                </Link>
                            </div>
                        )}

                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-2xl"
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? <FiX /> : <FiMenu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= BOTTOM NAV ================= */}
            <div className="bg-white border-t text-gray-700 relative">
                <div className="container mx-auto px-4 md:px-12 lg:px-24 flex items-center justify-between relative">

                    {/* Browse Categories */}
                    <div className="relative transition-all duration-300 max-w-md">
                        <button
                            onClick={() => setOpen(!open)}
                            className={`flex items-center gap-3 font-medium transition-all duration-300 px-4 py-4 -mx-4 ${open
                                    ? "text-yellow-500"
                                    : "text-gray-700 hover:text-yellow-500"
                                }`}
                        >
                            {open ? (
                                <FiX className="cursor-pointer" size={16} />
                            ) : (
                                <FiMenu size={16} />
                            )}
                            Browse Categories
                            <FiChevronDown
                                size={14}
                                className={`transition-transform duration-300 ${open ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {/* Dropdown */}
                        {open && (
                            <div className="absolute left-0 top-full w-72 bg-white shadow-xl border border-gray-200 z-50">
                                {loadingCategories ? (
                                    <div className="px-5 py-4 text-sm text-gray-500">Loading categories...</div>
                                ) : categories.length > 0 ? (
                                    <ul>
                                        <li
                                            onClick={() => {
                                                router.push('/products');
                                                setOpen(false);
                                            }}
                                            className="px-5 py-3 text-sm border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            All Products
                                        </li>
                                        {categories.map((item) => (
                                            <li
                                                key={item.id}
                                                onClick={() => handleCategoryClick(item.id)}
                                                className="px-5 py-3 text-sm border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                            >
                                                {item.name}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-5 py-4 text-sm text-gray-500">No categories available</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Menu */}
                    <nav className="hidden lg:flex gap-8 font-medium text-sm relative flex-1 justify-center">
                        {navItems.map((item) => {
                            const isActive = getActiveTab() === item.name;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-10 cursor-pointer transition-all duration-300 ease-in-out relative group ${
                                        isActive
                                            ? "text-yellow-500"
                                            : "hover:text-yellow-500 text-gray-700"
                                    }`}
                                >
                                    <span className="relative z-10">{item.name}</span>
                                    {/* Active Tab Indicator */}
                                    <div
                                        className={`absolute -bottom-4 left-0 w-full h-0.5 bg-yellow-500 transform transition-all duration-300 ease-out origin-left ${
                                            isActive
                                                ? "scale-x-100"
                                                : "scale-x-0 group-hover:scale-x-100"
                                        }`}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Offer */}
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium">
                        <span className="text-yellow-500">⚡</span>
                        Clearance Up to <span className="text-yellow-500">30% Off</span>
                    </div>

                </div>
            </div>

            {/* ================= MOBILE MENU ================= */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="container mx-auto px-4 py-4">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search product ..."
                                    className="w-full rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none border border-gray-300"
                                />
                                <button 
                                    type="submit" 
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                    aria-label="Search"
                                >
                                    <FiSearch />
                                </button>
                            </div>
                        </form>

                        {/* Mobile Navigation */}
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = getActiveTab() === item.name;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-lg transition-colors ${
                                            isActive
                                                ? "bg-yellow-50 text-yellow-600 font-medium"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile Categories */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h3 className="px-4 py-2 text-sm font-semibold text-gray-900">Categories</h3>
                            {loadingCategories ? (
                                <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                            ) : categories.length > 0 ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => {
                                            router.push('/products');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                    >
                                        All Products
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                handleCategoryClick(cat.id);
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">No categories</div>
                            )}
                        </div>

                        {/* Mobile Auth */}
                        {mounted && isAuthenticated && user ? (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/dashboard/orders"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    My Orders
                                </Link>
                                <Link
                                    href="/dashboard/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </header>
    );
}
