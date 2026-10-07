import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { wishlistCount } = useWishlist()
  const { cartItems } = useCart()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      navigate('/login')
    }
  }

  const isHomeActive = location.pathname === '/' || location.pathname === '/home'
  const isProductsActive = location.pathname === '/products'

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Navigation Links */}
        <div className="flex items-center space-x-8 sm:space-x-10">
          <Link to="/home" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold tracking-tight text-gray-900 font-serif group-hover:text-blue-600 transition">
              Shopkart
            </span>
          </Link>

          <nav className="flex items-center space-x-6 sm:space-x-8 text-sm font-medium text-gray-600">
            <Link
              to="/home"
              className={`transition hover:text-black ${
                isHomeActive ? 'text-gray-900 font-bold' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`transition hover:text-black ${
                isProductsActive ? 'text-gray-900 font-bold' : 'text-gray-600'
              }`}
            >
              Products
            </Link>
          </nav>
        </div>

        {/* Right Controls: Account Dropdown, Wishlist Icon, Cart Icon */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Account Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/90 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-800 transition shadow-sm hover:shadow cursor-pointer active:scale-95"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="max-w-[120px] truncate">{user.fullName || 'Account'}</span>
                <svg
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-gray-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Account Details
                    </p>
                  </div>

                  <div className="px-4 py-3 space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Username</span>
                      <p className="font-semibold text-gray-800 break-words">{user.fullName || '—'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Email</span>
                      <p className="font-semibold text-gray-800 break-words">{user.email || '—'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Mobile</span>
                      <p className="font-semibold text-gray-800">{user.phone || '—'}</p>
                    </div>
                  </div>

                  <div className="pt-2 px-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Heart Icon + Badge + Tooltip */}
          <Link
            to="/wishlist"
            className="relative p-2 hover:bg-rose-50 text-gray-700 hover:text-rose-600 rounded-full transition cursor-pointer group"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {wishlistCount}
            </span>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              Wishlist
            </span>
          </Link>

          {/* Shopping Cart Icon + Badge + Tooltip */}
          <Link
            to="/cart"
            className="relative p-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-full transition cursor-pointer group"
            title="Cart"
            aria-label="Cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {cartCount}
            </span>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              Cart
            </span>
          </Link>

        </div>
      </div>
    </header>
  )
}

export default Navbar
