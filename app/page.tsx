'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfileModal } from '@/components/profile/ProfileModal';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  quantity: string;
  category: string;
  image: string;
  averageRating: number;
  numOfReviews: number;
  seller: {
    name: string;
    _id: string;
  };
}

const CATEGORIES = ["All", "Vegetables", "Fruits", "Grains", "Others"];

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [user, setUser] = useState<{ fullName: string; role: string; image?: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    // 1. Initial load from localStorage for speed
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    // 2. Fetch fresh data from DB to ensure sync (e.g. new image, updated role)
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/v1/auth/me');
        if (response.data.success) {
          const freshUser = response.data.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      } catch (error) {
        console.error("Failed to fetch fresh user data", error);
        // If 401, maybe clear localStorage? For now, keep as is or let existing guards handle it
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.get('/api/v1/auth/logout');
    } catch (error) {
      console.error("Logout API call failed", error);
    }
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth/login'; // Redirect to login instead of root to force re-auth visually
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const getProfileImage = () => {
    if (user?.image && user.image !== "no-photo.jpg") {
      const folder = user.role === 'seller' ? 'farmer' : 'buyer';
      return `http://localhost:5001/uploads/${folder}/${user.image}`;
    }
    return null;
  };

  const profileImage = getProfileImage();

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/v1/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let temp = [...products];

    // Category Filter
    if (selectedCategory !== "All") {
      temp = temp.filter(p => p.category === selectedCategory);
    }

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      temp = temp.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(temp);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar / Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">Mero <span className="text-gray-700 dark:text-white">Bazaar</span></h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative user-dropdown-container flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                  {user.fullName} ({user.role})
                </span>

                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center focus:outline-none"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-primary cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg cursor-pointer hover:bg-green-700 transition-colors">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <span>👤</span> Edit & View Profile
                    </button>

                    {(user.role === 'seller' || user.role === 'farmer') && (
                      <Link href="/seller" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                        <span>📦</span> My Listing Page
                      </Link>
                    )}

                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <span>🌐</span> Language (English)
                    </button>

                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user as any}
          onUpdate={handleUpdateUser}
        />
      )}

      {/* Hero / Filter Section */}
      <section className="bg-primary/10 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Fresh Farm Produce</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Directly from farmers to your kitchen.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm max-w-4xl mx-auto">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Search vegetables, fruits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🥗</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or category.</p>
          </div>
        )}
      </main>
    </div>
  );
}