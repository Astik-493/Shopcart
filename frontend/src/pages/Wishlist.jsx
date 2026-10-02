import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'

function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false)
  const [cardError, setCardError] = useState('')

  const inStock = product.stock > 0

  const handleRemoveClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (removing) return

    setRemoving(true)
    setCardError('')

    try {
      await onRemove(product._id)
    } catch (err) {
      console.error('Error removing product from wishlist:', err)
      setCardError(err.response?.data?.message || 'Failed to remove product from wishlist.')
      setRemoving(false)
    }
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition duration-200 flex flex-col justify-between">
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

          {/* Card Error if removal fails */}
          {cardError && (
            <p className="text-xs text-rose-600 font-medium pt-1">
              {cardError}
            </p>
          )}
        </div>
      </div>

      {/* Card Bottom: Action Buttons */}
      <div className="p-5 pt-0 space-y-2">
        {/* Remove from Wishlist Button */}
        <button
          type="button"
          onClick={handleRemoveClick}
          disabled={removing}
          className={`w-full py-2.5 px-4 font-semibold text-xs rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-sm border ${
            removing
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/80 cursor-pointer active:scale-95'
          }`}
        >
          <span>{removing ? '⏳ Removing...' : '🗑️ Remove from Wishlist'}</span>
        </button>

        {/* View Details Action Button */}
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
}

function Wishlist() {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()
  const [customer, setCustomer] = useState(authUser || null)
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch logged in customer profile if not in context
  useEffect(() => {
    if (!customer) {
      const fetchCustomerProfile = async () => {
        try {
          const response = await axiosInstance.get('api/customers/me')
          setCustomer(response.data)
        } catch (err) {
          // Handled by route guard
        }
      }
      fetchCustomerProfile()
    }
  }, [customer])

  // Fetch current user's wishlist
  const fetchWishlist = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get('wishlist')
      if (response.data && Array.isArray(response.data.wishlist)) {
        setWishlist(response.data.wishlist)
      } else {
        setWishlist([])
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err)
      setError(
        err.response?.data?.message || 'Something went wrong while loading your wishlist.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  // Handle single item removal without page reload
  const handleRemoveFromWishlist = async (productId) => {
    const response = await axiosInstance.delete(`wishlist/${productId}`)
    if (response.data && response.data.success) {
      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item._id !== productId)
      )
    }
  }

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
            <Link to="/products" className="hover:text-black transition">
              Products
            </Link>
            <Link to="/wishlist" className="text-gray-900 font-semibold hover:text-black transition">
              Wishlist
            </Link>
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
        
        {/* Page Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2">
            <span>♥ Wishlist</span>
            <span>•</span>
            <span>{wishlist.length} {wishlist.length === 1 ? 'Saved Item' : 'Saved Items'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse and manage all the products you've saved for later.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="min-h-[350px] flex items-center justify-center bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Loading your wishlist...</p>
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
            <h2 className="text-base font-bold text-red-900">Unable to load wishlist.</h2>
            {error && typeof error === 'string' && error !== 'Unable to load wishlist.' && (
              <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
            )}
            <button
              onClick={fetchWishlist}
              className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your wishlist is empty ❤️</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Start saving products you love.
              </p>
              <Link
                to="/products"
                className="inline-block mt-4 px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition shadow-sm"
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}

        {/* Success State - Dynamic Wishlist Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveFromWishlist}
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

export default Wishlist
