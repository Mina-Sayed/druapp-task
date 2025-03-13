"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { authApi } from "@/lib/api"

type User = {
  id: string
  name: string
  email: string
  role: "patient" | "doctor"
  token?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: "patient" | "doctor") => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip localStorage operations during SSR
    if (typeof window === 'undefined') {
      setLoading(false)
      return;
    }
    
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Authentication error:", error)
        // If there's a parse error, clear the corrupted data
        localStorage.removeItem("user")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    
    // No cleanup needed for this effect
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Call the backend API for authentication
      const response = await authApi.login(email, password)
      console.log('Login response in auth provider:', response)
      
      if (!response || !response.user) {
        throw new Error('Invalid response data from server')
      }
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        token: response.accessToken
      }

      // Store user in localStorage - don't include token in console logs
      console.log('Storing user data (token omitted for security)');
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: "patient" | "doctor") => {
    setLoading(true)
    try {
      // Call the backend API for registration
      const response = await authApi.register(name, email, password, role)
      
      if (!response || !response.user) {
        throw new Error('Invalid response data from server')
      }
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        token: response.accessToken
      }

      // Store user in localStorage - don't include token in console logs
      console.log('Storing user data (token omitted for security)');
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

