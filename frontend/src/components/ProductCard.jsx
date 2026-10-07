import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  if (!product) return null

  const { wishlistIds, addToWishlistContext, removeFromWishlistContext } = useWishlist()
  const { cartItems, addToCart } = useCart()
  const [saving, setSaving] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [error, setError] = useState('')

  const isSaved = wishlistIds ? wishlistIds.has(product._id) : false
  const inStock = product.stock > 0

  // Check if product is already in the global cart
  const cartItem = cartItems.find(
    (item) => (item.product?._id || item.product)?.toString() === product._id?.toString()
  )
  const isInCart = Boolean(cartItem)
  const cartQuantity = cartItem?.quantity || 0

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (addingToCart || !inStock) return

    setAddingToCart(true)
    setError('')

    try {
      await addToCart(product._id)
    } catch (err) {
      console.error('Add to cart error:', err)
      const message =
        err.response?.data?.message || err.message || 'Failed to add product to cart.'
      setError(message)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleToggleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (saving) return

    setSaving(true)
    setError('')

    try {
      if (!isSaved) {
        // Product is NOT saved -> Add to wishlist
        const response = await axiosInstance.post(`wishlist/${product._id}`)
        if (response.data && response.data.success) {
          addToWishlistContext(product._id)
        }
      } else {
        // Product IS saved -> Remove from wishlist
        const response = await axiosInstance.delete(`wishlist/${product._id}`)
        if (response.data && response.data.success) {
          removeFromWishlistContext(product._id)
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err)
      if (err.response && err.response.status === 409) {
        addToWishlistContext(product._id)
      } else if (err.response && err.response.status === 404) {
        removeFromWishlistContext(product._id)
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError(isSaved ? 'Failed to remove from wishlist.' : 'Failed to add to wishlist.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      key={product._id}
      className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition duration-200 flex flex-col justify-between relative"
    >
      {/* Card Top: Image & Heart Wishlist Icon */}
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

          {/* Top-Right Heart Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={saving}
            title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition duration-200 cursor-pointer hover:scale-110 active:scale-95 z-10"
          >
            {isSaved ? (
              <svg
                className="w-5 h-5 text-rose-500 fill-rose-500 transition-colors"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-700 hover:text-rose-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Card Body: Name, Price, and Clean Stock Availability */}
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
            <span
              className={`text-xs font-semibold ${
                inStock ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {inStock ? `${product.stock} available` : 'Out of stock'}
            </span>
          </div>

          {/* Error message if any */}
          {error && (
            <p className="text-xs text-rose-600 font-medium pt-1">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Card Bottom: Action Buttons */}
      <div className="p-5 pt-0 space-y-2">
        {/* Add to Cart Action Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addingToCart || !inStock}
          className={`w-full py-2.5 px-4 font-semibold text-xs rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-sm border ${
            !inStock
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : addingToCart
              ? 'bg-blue-50 text-blue-500 border-blue-200 cursor-not-allowed'
              : isInCart
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cursor-pointer active:scale-95'
              : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent cursor-pointer active:scale-95'
          }`}
        >
          {addingToCart ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Adding...</span>
            </>
          ) : !inStock ? (
            <span>Out of Stock</span>
          ) : isInCart ? (
            <span>+ Add Another ({cartQuantity} in Cart)</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
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

export default ProductCard
