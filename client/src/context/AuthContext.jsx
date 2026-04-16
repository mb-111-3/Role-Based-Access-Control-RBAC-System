import { createContext, useState, useContext } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rbac_user')) } catch { return null }
  })

  const login = (token, userData) => {
    localStorage.setItem('rbac_token', token)
    localStorage.setItem('rbac_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('rbac_token')
    localStorage.removeItem('rbac_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      isAdmin:  user?.role === 'admin',
      isEditor: user?.role === 'editor',
      isViewer: user?.role === 'viewer',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)