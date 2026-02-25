import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import WordInput from './pages/WordInput'
import RandomWords from './pages/RandomWords'
import WordManagement from './pages/WordManagement'
import './index.css'

function App() {
    return (
        <Router>
            <div className="app">
                <nav className="navbar">
                    <div className="nav-brand">
                        <span className="nav-logo">✦</span>
                        <span className="nav-title">Kids Word Manager</span>
                    </div>
                    <div className="nav-links">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">📝</span>
                            Nhập từ
                        </NavLink>
                        <NavLink
                            to="/random"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">🎲</span>
                            Hiển thị
                        </NavLink>
                        <NavLink
                            to="/manage"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">⚙️</span>
                            Quản lý
                        </NavLink>
                    </div>
                </nav>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<WordInput />} />
                        <Route path="/random" element={<RandomWords />} />
                        <Route path="/manage" element={<WordManagement />} />
                    </Routes>
                </main>
            </div>
        </Router>
    )
}

export default App
