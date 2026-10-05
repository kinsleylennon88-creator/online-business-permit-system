import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
}

// Action types
const AUTH_START = 'AUTH_START'
const AUTH_SUCCESS = 'AUTH_SUCCESS'
const AUTH_FAILURE = 'AUTH_FAILURE'
const LOGOUT = 'LOGOUT'
const CLEAR_ERROR = 'CLEAR_ERROR'
const UPDATE_USER = 'UPDATE_USER'

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_START:
      return {
        ...state,
        loading: true,
      }
    case AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      }
    case AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      }
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    case UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set token in API headers
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
      localStorage.setItem('token', state.token)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [state.token])

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const response = await api.get('/auth/me')
          dispatch({
            type: AUTH_SUCCESS,
            payload: {
              user: response.data.data.user,
              token,
            },
          })
        } catch (error) {
          dispatch({ type: LOGOUT })
          localStorage.removeItem('token')
        }
      } else {
        dispatch({ type: AUTH_FAILURE, payload: null })
      }
    }

    checkAuth()
  }, [])

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_START })
      
      const response = await api.post('/auth/register', userData)
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: response.data.data.user,
          token: response.data.data.token,
        },
      })
      
      toast.success('Registration successful!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Registration failed'
      dispatch({ type: AUTH_FAILURE, payload: message })
      toast.error(message)
      throw error
    }
  }

  // Login user
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_START })
      
      const response = await api.post('/auth/login', credentials)
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: response.data.data.user,
          token: response.data.data.token,
        },
      })
      
      toast.success('Login successful!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({ type: AUTH_FAILURE, payload: message })
      toast.error(message)
      throw error
    }
  }

  // Google OAuth login
  const googleLogin = async (tokenId, googleUser) => {
    try {
      dispatch({ type: AUTH_START })
      
      const response = await api.post('/auth/google', { tokenId, googleUser })
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: response.data.data.user,
          token: response.data.data.token,
        },
      })
      
      toast.success('Google login successful!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed'
      dispatch({ type: AUTH_FAILURE, payload: message })
      toast.error(message)
      throw error
    }
  }

  // Logout user
  const logout = () => {
    dispatch({ type: LOGOUT })
    toast.success('Logged out successfully')
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData)
      
      dispatch({
        type: UPDATE_USER,
        payload: response.data.data.user,
      })
      
      toast.success('Profile updated successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      throw error
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData)
      toast.success('Password changed successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      throw error
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: CLEAR_ERROR })
  }

  const value = {
    ...state,
    register,
    login,
    googleLogin,
    logout,
    updateProfile,
    changePassword,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
