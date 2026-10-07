import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'

function Products() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser, logout } = useAuth()
  const { wishlistCount, wishlistIds } = useWishlist()
  const { cartItems } = useCart()
  const [customer, setCustomer] = useState(authUser || null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)

  // Search, Category & Sort states
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState('')

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) {
      setCategory(cat)
    }
  }, [searchParams])

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

      if (sort) {
        params.append('sort', sort)
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

  // Trigger search / filter / sort whenever search input, selected category, or sort changes
  useEffect(() => {
    fetchProducts()
  }, [search, category, sort])

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
      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Page Banner & Search / Filter Controls */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
          
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

          {/* Search Bar, Category & Sort Dropdowns Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-gray-100">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative flex items-center">
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
            <div className="md:col-span-3 relative flex items-center">
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

            {/* Sort Dropdown */}
            <div className="md:col-span-3 relative flex items-center">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-sm cursor-pointer appearance-none"
              >
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <span className="absolute right-4 text-gray-400 pointer-events-none flex items-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

          </div>

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
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
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
