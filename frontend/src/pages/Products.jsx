import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'

function Products() {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()
  const [customer, setCustomer] = useState(authUser || null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search & Category states
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = [
    'All Categories',
    'Electronics',
    'Fashion',
    'Books',
    'Home'
  ]

  // Fetch logged in customer profile if not in context
  useEffect(() => {
    if (!customer) {
      const fetchCustomerProfile = async () => {
        try {
          const response = await axiosInstance.get('api/customers/me')
          setCustomer(response.data)
        } catch (err) {
          // Unauthenticated requests handled by route guard
        }
      }
      fetchCustomerProfile()
    }
  }, [customer])

  // Fetch products with dynamic query parameters
  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()

      if (search.trim()) {
        params.append('search', search.trim())
      }

      if (category && category !== 'All Categories') {
        params.append('category', category)
      }

      const queryString = params.toString()
      const endpoint = queryString ? `products?${queryString}` : 'products'

      const response = await axiosInstance.get(endpoint)

      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products)
      } else if (Array.isArray(response.data)) {
        setProducts(response.data)
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Unable to load products. Please check if the server is running and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Trigger search / filter whenever search input or selected category changes
  useEffect(() => {
    fetchProducts()
  }, [search, category])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error(err)
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col antialiased font-sans">
      
      {/* Navigation Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900 font-serif">
              Shopkart
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10 text-sm font-medium text-gray-600">
            <Link to="/home" className="hover:text-black transition">
              Home
            </Link>
            <Link to="/products" className="text-gray-900 font-semibold hover:text-black transition">
              Products
            </Link>
            <a href="#categories" className="hover:text-black transition">
              Categories
            </a>
            <a href="#deals" className="hover:text-black transition">
              Deals
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Logged in User Pill + Logout Button */}
            {customer && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 pl-3 pr-1 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-gray-800">{customer.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-2.5 py-1 rounded-full transition text-[11px] shadow-sm hover:shadow active:scale-95 cursor-pointer ml-1"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Shopping Cart Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 cursor-pointer relative" title="Cart">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
            </button>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Page Banner & Search / Filter Controls */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                <span>Catalog</span>
                <span>•</span>
                <span>{products.length} {products.length === 1 ? 'Product' : 'Products'} Found</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Explore Our Products
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Browse and filter our latest curated collection.
              </p>
            </div>

            <button
              onClick={fetchProducts}
              className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-2"
              title="Refresh Products"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {/* Search Bar & Category Dropdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-gray-100">
            
            {/* Search Input */}
            <div className="md:col-span-8 relative flex items-center">
              <span className="absolute left-4 text-gray-400 pointer-events-none flex items-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-4 relative flex items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-sm cursor-pointer appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="absolute right-4 text-gray-400 pointer-events-none flex items-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

          </div>

          {/* Active Filter Pills (if any) */}
          {(search || (category && category !== 'All Categories')) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-gray-400 font-medium">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200/60 font-medium">
                  Query: "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-blue-900 font-bold ml-0.5">×</button>
                </span>
              )}
              {category && category !== 'All Categories' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200/60 font-medium">
                  Category: {category}
                  <button onClick={() => setCategory('')} className="hover:text-purple-900 font-bold ml-0.5">×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearch('')
                  setCategory('')
                }}
                className="text-xs text-red-600 hover:text-red-700 hover:underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

        </div>

        {/* Loading State */}
        {loading && (
          <div className="min-h-[350px] flex items-center justify-center bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Filtering products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-red-900">Failed to Load Products</h2>
            <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">No products available</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                {search || category
                  ? `No items matched your search criteria. Try modifying your search or category filter.`
                  : `There are currently no products listed in the catalog. Please check back later.`}
              </p>
              {(search || category) && (
                <button
                  onClick={() => {
                    setSearch('')
                    setCategory('')
                  }}
                  className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs rounded-xl transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const inStock = product.stock > 0

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition duration-200 flex flex-col justify-between"
                >
                  {/* Card Top: Image & Badges */}
                  <div>
                    <div className="relative w-full h-52 bg-gray-100 overflow-hidden">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 ease-out"
                      />

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-gray-700 shadow-sm border border-white/60">
                        {product.category || 'General'}
                      </span>

                      {/* Stock Status Badge */}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-sm backdrop-blur-md ${
                          inStock
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-rose-500/90 text-white'
                        }`}
                      >
                        {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Card Body: Name & Price */}
                    <div className="p-5 space-y-2">
                      <h3
                        className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-xs text-gray-400">Price</span>
                          <p className="text-lg font-extrabold text-gray-900">
                            ₹{Number(product.price).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                          Qty: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: View Details Action Button */}
                  <div className="p-5 pt-0">
                    <Link
                      to={`/products/${product._id}`}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer active:scale-95"
                    >
                      <span>View Details</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>

                </div>
              )
            })}
          </div>
        )}

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

export default Products
