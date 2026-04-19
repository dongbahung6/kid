import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

// Attach JWT token to every request if available
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

const UserContext = createContext()

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            setLoading(false)
            return
        }
        try {
            const res = await axios.get(`${API_BASE}/api/words/me`)
            setUser(res.data)
        } catch (err) {
            // Token invalid or expired — clean up
            localStorage.removeItem('accessToken')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const login = () => {
        // Redirect to backend OAuth2 endpoint (absolute URL required)
        window.location.href = `${API_BASE}/oauth2/authorization/google`
    }

    const logout = () => {
        localStorage.removeItem('accessToken')
        setUser(null)
        window.location.href = '/'
    }

    return (
        <UserContext.Provider value={{ user, loading, login, logout, fetchUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)
