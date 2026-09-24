import React, { createContext, useContext, useState, useEffect } from 'react'
import { axiosInstance } from '../axiosCalls/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch current customer profile
  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('api/customers/me')
      if (response.data) {
        setUser(response.data)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  // Logout handler
  const logout = async () => {
    try {
      await axiosInstance.post('api/customers/logout')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
