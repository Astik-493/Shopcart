import React, { createContext, useContext, useState, useEffect } from 'react'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth()
  const [wishlistCount, setWishlistCount] = useState(0)
  const [wishlistIds, setWishlistIds] = useState(new Set())

  // Fetch current user's wishlist from backend
  const fetchWishlist = async () => {
    if (!user) {
      setWishlistCount(0)
      setWishlistIds(new Set())
      return
    }
    try {
      const response = await axiosInstance.get('wishlist')
      if (response.data) {
        const count =
          typeof response.data.count === 'number'
            ? response.data.count
            : Array.isArray(response.data.wishlist)
            ? response.data.wishlist.length
            : 0
        setWishlistCount(count)
        if (Array.isArray(response.data.wishlist)) {
          setWishlistIds(new Set(response.data.wishlist.map((item) => item._id)))
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error)
    }
  }

  // Refetch when user logs in or out
  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlistCount(0)
      setWishlistIds(new Set())
    }
  }, [user])

  const addToWishlistContext = (productId) => {
    setWishlistCount((prev) => prev + 1)
    setWishlistIds((prev) => new Set([...prev, productId]))
  }

  const removeFromWishlistContext = (productId) => {
    setWishlistCount((prev) => Math.max(0, prev - 1))
    setWishlistIds((prev) => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistCount,
        setWishlistCount,
        wishlistIds,
        fetchWishlist,
        addToWishlistContext,
        removeFromWishlistContext
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
