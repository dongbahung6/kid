import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import WordInput from './pages/WordInput'
import RandomWords from './pages/RandomWords'
import WordManagement from './pages/WordManagement'
import MathPractice from './pages/MathPractice'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'
import { UserProvider, useUser } from './context/UserContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import './index.css'
import './styles/navbar.css'

function ProtectedRoute({ children }) {
    const { user, loading } = useUser()
    if (loading) return <div className="spinner"></div>
    if (!user) return <Navigate to="/random" />
    return children
}

function Navbar() {
    const { user, login, logout } = useUser()
    const { language, setLanguage } = useLanguage()

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <span className="nav-logo">✦</span>
                <span className="nav-title">Kids Word Manager</span>
            </div>

            <div className="nav-links">
                <NavLink to="/input" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📝</span> Nhập từ
                </NavLink>
                <NavLink to="/random" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🎲</span> Hiển thị
                </NavLink>
                <NavLink to="/math" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">➕</span> Toán học
                </NavLink>
                <NavLink to="/manage" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">⚙️</span> Quản lý
                </NavLink>
            </div>

            <div className="nav-actions">
                <select
                    className="lang-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="VI">🇻🇳 Tiếng Việt</option>
                    <option value="EN">🇺🇸 Tiếng Anh</option>
                </select>

                {user ? (
                    <div className="user-profile">
                        <img src={user.picture} alt={user.name} className="user-avatar" />
                        <span className="user-name">{user.name}</span>
                        <button className="btn-logout" onClick={logout} title="Đăng xuất">Logout</button>
                    </div>
                ) : (
                    <button className="btn-login" onClick={login}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" />
                        Login with Google
                    </button>
                )}
            </div>
        </nav>
    )
}

function AppContent() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/random" replace />} />
                    <Route path="/random" element={<RandomWords />} />
                    <Route path="/math" element={<MathPractice />} />
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
                    <Route path="/input" element={<ProtectedRoute><WordInput /></ProtectedRoute>} />
                    <Route path="/manage" element={<ProtectedRoute><WordManagement /></ProtectedRoute>} />
                </Routes>
            </main>
        </div>
    )
}

function App() {
    return (
        <UserProvider>
            <LanguageProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <AppContent />
                </Router>
            </LanguageProvider>
        </UserProvider>
    )
}

export default App
