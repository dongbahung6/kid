import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'

function OAuth2RedirectHandler() {
    const location = useLocation()
    const navigate = useNavigate()
    const { fetchUser } = useUser()

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const token = params.get('token')

        if (token) {
            localStorage.setItem('accessToken', token)
            // Reload user info from backend using the new token
            fetchUser().then(() => {
                navigate('/', { replace: true })
            })
        } else {
            // No token means something went wrong
            navigate('/', { replace: true })
        }
    }, [])

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', fontSize: '1.2rem', color: '#888'
        }}>
            Đang đăng nhập...
        </div>
    )
}

export default OAuth2RedirectHandler
