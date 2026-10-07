import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)
  const [cartError, setCartError] = useState(null)

  // Fetch current user's populated cart from backend
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([])
      setCartLoading(false)
      setCartError(null)
      return
    }

    setCartLoading(true)
    setCartError(null)

    try {
      const response = await axiosInstance.get('cart')
      if (response.data && Array.isArray(response.data.cart)) {
        setCartItems(response.data.cart)
      } else {
        setCartItems([])
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch cart'
      setCartError(message)
    } finally {
      setCartLoading(false)
    }
  }, [user])

  // Refetch cart when user logs in or out
  useEffect(() => {
    if (authLoading) return

    if (user) {
      refreshCart()
    } else {
      setCartItems([])
      setCartLoading(false)
      setCartError(null)
    }
  }, [user, authLoading, refreshCart])

  // Add a product to cart
  const addToCart = async (productId) => {
    setCartLoading(true)
    setCartError(null)

    try {
      const response = await axiosInstance.post(`cart/${productId}`)
      await refreshCart()
      return response.data
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to add product to cart'
      setCartError(message)
      throw error
    } finally {
      setCartLoading(false)
    }
  }

  // Remove a product from cart
  const removeFromCart = async (productId) => {
    setCartLoading(true)
    setCartError(null)

    try {
      const response = await axiosInstance.delete(`cart/${productId}`)
      if (response.data && Array.isArray(response.data.cart)) {
        setCartItems(response.data.cart)
      } else {
        await refreshCart()
      }
      return response.data
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to remove product from cart'
      setCartError(message)
      throw error
    } finally {
      setCartLoading(false)
    }
  }

  // Update quantity of an existing cart item
  const updateQuantity = async (productId, quantity) => {
    setCartLoading(true)
    setCartError(null)

    try {
      const response = await axiosInstance.patch(`cart/${productId}`, { quantity })
      await refreshCart()
      return response.data
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update item quantity'
      setCartError(message)
      throw error
    } finally {
      setCartLoading(false)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
