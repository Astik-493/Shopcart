import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()
  const [customer, setCustomer] = useState(authUser || null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

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

  // Fetch single product by id
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axiosInstance.get(`products/${id}`)
        if (response.data && response.data.product) {
          setProduct(response.data.product)
        } else if (response.data && response.data._id) {
          setProduct(response.data)
        } else {
          setProduct(null)
        }
      } catch (err) {
        console.error('Error loading product details:', err)
        setError('Something went wrong while loading products.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProductDetails()
    }
  }, [id])

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
            <Link to="/wishlist" className="hover:text-black transition">
              Wishlist
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
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <Link to="/home" className="hover:text-gray-900 transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-900 transition">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {product ? product.name : 'Product Details'}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="min-h-[400px] flex items-center justify-center bg-white rounded-3xl border border-gray-200/80 p-12 shadow-sm">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-10 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-red-900">Something went wrong while loading products.</h2>
            <Link
              to="/products"
              className="inline-block mt-3 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Back to Products
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !product && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">No products found.</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                The requested product does not exist or has been removed from the store catalog.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-block px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Back to Catalog
            </Link>
          </div>
        )}

        {/* Product Details Card */}
        {!loading && !error && product && (
          <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            
            {/* Left Column: Large Product Image */}
            <div className="lg:col-span-6 bg-gray-50 p-6 sm:p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="relative w-full max-w-md h-80 sm:h-[420px] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'}
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'
                  }}
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Category Floating Badge */}
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-gray-800 shadow-sm border border-white/60">
                  {product.category || 'General'}
                </span>
              </div>
            </div>

            {/* Right Column: Product Info & Actions */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                
                {/* Stock Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      product.stock > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="pt-2 pb-3 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-400">Total Price</span>
                  <div className="text-3xl font-extrabold text-gray-900 mt-0.5">
                    ₹{Number(product.price).toLocaleString()}
                  </div>
                </div>

                {/* Product Description */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Description
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {product.description || 'No description provided for this product.'}
                  </p>
                </div>

                {/* Product Specifications Summary */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <p className="text-[11px] font-medium text-gray-400">Category</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">{product.category}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <p className="text-[11px] font-medium text-gray-400">Stock Status</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Buttons Section */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                
                {/* Quantity Selector & Add to Cart (UI ONLY) */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button (UI Only) */}
                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={() => alert(`Added ${quantity} x "${product.name}" to cart (UI Only)!`)}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition duration-150 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Add to Cart</span>
                  </button>
                </div>

                <Link
                  to="/products"
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  &larr; Back to all products
                </Link>

              </div>

            </div>

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

export default ProductDetails
