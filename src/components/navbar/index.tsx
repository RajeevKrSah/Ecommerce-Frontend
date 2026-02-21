



"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useEffect, useState } from "react";
import {
    FiPhoneCall,
    FiSearch,
    FiHeart,
    FiMenu,
    FiChevronDown,
    FiX,
} from "react-icons/fi";
import { HiOutlineShoppingBag } from 'react-icons/hi';
interface Category {
    name: string;
    href: string;
}
const categories: Category[] = [
    { name: "Men", href: "/men" },
    { name: "Women", href: "/women" },
    { name: "Kids", href: "/kids" },
    { name: "Accessories", href: "/accessories" },
];
interface NavItem {
    name: string;
    href: string;
}
const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Products", href: "/products" },
    { name: "Pages", href: "/pages" },
    { name: "Blog", href: "/blog" },
    { name: "Elements", href: "/elements" },
];

export default function Nav() {
    const [open, setOpen] = useState(false);
    const { isAuthenticated, isLoading, user } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState("Home");

    useEffect(() => {
        setMounted(true);
    }, []);

    const cartItemsCount = mounted ? cartCount : 0;
    const wishlistItemsCount = mounted ? wishlistCount : 0;

    return (
        <header className="w-full">

            {/* ================= TOP BAR ================= */}
            <div className="bg-[#3a3a3a] text-gray-300 text-sm">
                <div className="container mx-auto px-4 md:px-12 lg:px-24 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FiPhoneCall className="text-yellow-400" />
                        <span>Call : +0123 456 789</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="cursor-pointer">Sign in / Sign up</span>
                    </div>
                </div>
            </div>

            {/* ================= MAIN HEADER ================= */}
            <div className="bg-[#2f2f2f]">
                <div className="container mx-auto px-4 md:px-12 lg:px-24 py-5 flex items-center justify-between gap-6">

                    {/* Logo */}
                    <div className="flex items-center gap-2 text-white text-2xl font-bold">
                        <span className="text-yellow-400 text-3xl">▮</span>
                        Molla
                    </div>

                    {/* Search */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative">
                        <input
                            type="text"
                            placeholder="Search product ..."
                            className="w-full rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none border border-gray-100"
                        />
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>

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
                            <div className="flex items-center space-x-3">
                                <Link href="/dashboard">
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
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/login">
                                    <button className="hidden sm:inline-flex">
                                        Sign In
                                    </button>
                                </Link>
                            </div>
                        )}

                        <FiMenu className="md:hidden text-2xl" />
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
                            className={`flex items-center gap-3 font-medium transition-all duration-300 px-4 py-4 -mx-4 ${
                                open 
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
                                className={`transition-transform duration-300 ${
                                    open ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* Dropdown */}
                        {open && (
                            <div className="absolute left-0 top-full w-72 bg-white shadow-xl border border-gray-200 z-50">
                                <ul>
                                    {categories.map((item) => (
                                        <li
                                            key={item.name}
                                            className="px-5 py-3 text-sm border-b border-gray-200 bg-gray-50 cursor-pointer"
                                        >
                                            <Link href={item.href}>
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Menu */}
                    <nav className="hidden lg:flex gap-8 font-medium text-sm relative flex-1 justify-center">
                        {navItems.map(
                            (item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setActiveTab(item.name)}
                                    className={`flex items-center gap-10 cursor-pointer transition-all duration-300 ease-in-out relative group ${
                                        activeTab === item.name
                                            ? "text-yellow-500"
                                            : "hover:text-yellow-500 text-gray-700"
                                    }`}
                                >
                                    <span className="relative z-10">{item.name}</span>
                                    {/* Active Tab Indicator */}
                                    <div
                                        className={`absolute -bottom-4 left-0 w-full h-0.5 bg-yellow-500 transform transition-all duration-300 ease-out origin-left ${
                                            activeTab === item.name
                                                ? "scale-x-100"
                                                : "scale-x-0 group-hover:scale-x-100"
                                        }`}
                                    />
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Offer */}
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium">
                        <span className="text-yellow-500">⚡</span>
                        Clearance Up to <span className="text-yellow-500">30% Off</span>
                    </div>

                </div>
            </div>

        </header>
    );
}
