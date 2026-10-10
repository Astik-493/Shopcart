import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'

function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch real products from backend
  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const response = await axiosInstance.get('products')
        if (response.data && Array.isArray(response.data.products)) {
          setProducts(response.data.products)
        } else if (Array.isArray(response.data)) {
          setProducts(response.data)
        }
      } catch (err) {
        console.error('Error fetching home products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeProducts()
  }, [])

  // Derive unique categories dynamically from real backend products
  const categoryMap = products.reduce((acc, prod) => {
    if (!prod.category) return acc
    if (!acc[prod.category]) {
      acc[prod.category] = {
        name: prod.category,
        count: 0,
        sampleImage: prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
      }
    }
    acc[prod.category].count += 1
    return acc
  }, {})

  const categories = Object.values(categoryMap)

  // Real products for Best Sellers and Trending Now
  const bestSellers = products.slice(0, 4)
  const trendingNow = products.length > 4 ? products.slice(4, 8) : products.slice(0, 4)

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col antialiased font-sans">
      
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full min-w-0 space-y-16">
        
        {/* 1. HERO SECTION */}
        <section className="bg-gradient-to-br from-neutral-100 to-neutral-200/90 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center min-h-[420px] shadow-sm border border-neutral-200/70">
          
          {/* Left Text Column */}
          <div className="p-8 sm:p-12 md:p-16 space-y-5">
            <span className="inline-block px-3 py-1 bg-white/90 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs">
              New Season Arrivals
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-medium text-gray-900 leading-[1.15] tracking-tight">
              Discover Your Style
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-light max-w-md">
              Shop the latest trends & exclusive offers across our curated categories.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e86638] hover:bg-[#d6572a] text-white font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition active:scale-95 cursor-pointer text-sm sm:text-base"
              >
                <span>Shop Now</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Hero Image Column */}
          <div className="h-full w-full flex items-center justify-center p-6 md:p-8">
            <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop"
                alt="Discover Your Style"
                className="w-full h-full object-cover object-top hover:scale-105 transition duration-700 ease-out"
              />
            </div>
          </div>

        </section>

        {/* 2. BEST SELLERS SECTION (Real database products) */}
        <section id="best-sellers" className="space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Popular Choices</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight mt-1">
                Best Sellers
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-gray-600 hover:text-blue-600 transition flex items-center gap-1 group"
            >
              <span>View All Products</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-gray-200/80">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-500 border border-gray-200/80">
              No products available right now.
            </div>
          )}
        </section>

        {/* 3. TRENDING NOW SECTION (Real database products) */}
        <section id="trending-now" className="space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Curated Picks</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight mt-1">
                Trending Now
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-gray-600 hover:text-blue-600 transition flex items-center gap-1 group"
            >
              <span>Explore All</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-gray-200/80">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : trendingNow.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingNow.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-500 border border-gray-200/80">
              No products available right now.
            </div>
          )}
        </section>

        {/* 4. SHOP BY CATEGORY (Dynamic from real products) */}
        {categories.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Collections</p>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight mt-1">
                  Shop by Category
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs font-semibold text-gray-600 hover:text-blue-600 transition flex items-center gap-1 group"
              >
                <span>Explore All Categories</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group relative bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-gray-300 transition duration-200 flex flex-col"
                >
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={cat.sampleImage}
                      alt={cat.name}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-800 shadow-xs border border-white/60">
                      {cat.count} {cat.count === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Browse all items in {cat.name}
                      </p>
                    </div>

                    <div className="pt-3 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>View Products →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 5. BENEFITS / FEATURES SECTION (Preserved exact design) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Quality Products */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm transition">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Quality Products</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Curated selection from verified and authentic brands.
              </p>
            </div>
          </div>

          {/* Secure Shopping */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm transition">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Secure Shopping</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                256-bit SSL encrypted safe checkout & payments.
              </p>
            </div>
          </div>

          {/* Easy Cart & Checkout */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm transition">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Easy Cart & Checkout</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Seamless quantity updates and one-click cart management.
              </p>
            </div>
          </div>

          {/* Fast/Convenient Shopping */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm transition">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Fast & Convenient</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Swift order dispatch with reliable doorstep delivery.
              </p>
            </div>
          </div>

        </section>

        {/* 6. FINAL CALL TO ACTION */}
        <section className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-5 shadow-md">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            Find Something You'll Love
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto font-light leading-relaxed">
            Explore our complete collection, save your favorite items to wishlist, and enjoy seamless shopping.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg transition active:scale-95 text-sm cursor-pointer"
            >
              <span>Shop All Products</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="font-serif text-sm font-semibold text-gray-800">
            Shopkart
          </p>
          <p>© {new Date().getFullYear()} Shopkart Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
            <a href="#" className="hover:text-gray-600">Support</a>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Home