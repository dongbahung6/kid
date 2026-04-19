import { useState, useCallback } from 'react'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

// Parse các từ từ input string
function parseWords(input) {
    if (!input || !input.trim()) return []
    return input
        .replace(/[\r\n]+/g, ',')
        .replace(/[;|]+/g, ',')
        .split(',')
        .flatMap(part => part.trim().split(/\s+/))
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .filter((v, i, arr) => arr.indexOf(v) === i)
}

export default function WordInput() {
    const { language } = useLanguage()   // dùng ngôn ngữ từ navbar
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)

    const preview = parseWords(input)

    const handleSubmit = useCallback(async () => {
        if (preview.length === 0) {
            setAlert({ type: 'error', message: 'Vui lòng nhập ít nhất một từ hợp lệ.' })
            return
        }
        setLoading(true)
        setAlert(null)
        try {
            const res = await axios.post(`${API_BASE}/api/words`, { input, language })
            const data = res.data
            setAlert({
                type: 'success',
                message: data.message,
                savedCount: data.savedCount,
                totalCount: data.totalCount,
                savedWords: data.savedWords,
            })
            setInput('')
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Lỗi kết nối server'
            setAlert({ type: 'error', message: msg })
        } finally {
            setLoading(false)
        }
    }, [input, preview, language])

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">📝 Nhập từ mới</h1>
                <p className="page-subtitle">
                    Nhập nhiều từ, phân tách bởi dấu phẩy, chấm phẩy, gạch đứng hoặc xuống dòng
                </p>
            </div>

            <div className="card">
                <div className="form-group">
                    <label htmlFor="word-input">Danh sách từ
                        <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: language === 'VI' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                            color: language === 'VI' ? '#60a5fa' : '#6ee7b7',
                        }}>
                            {language === 'VI' ? '🇻🇳 Tiếng Việt' : '🇺🇸 Tiếng Anh'}
                        </span>
                    </label>
                    <textarea
                        id="word-input"
                        placeholder="Ví dụ: hùng, dũng, minh, lâm&#10;Hoặc: hùng; dũng | minh"
                        value={input}
                        onChange={e => {
                            setInput(e.target.value)
                            setAlert(null)
                        }}
                        rows={5}
                    />
                </div>

                {/* Live preview */}
                {preview.length > 0 && (
                    <div className="preview-section">
                        <div className="preview-label">Preview — {preview.length} từ</div>
                        <div className="tag-list">
                            {preview.map((word, i) => (
                                <span key={i} className="tag">{word}</span>
                            ))}
                        </div>
                    </div>
                )}

                <hr className="separator" />

                <button
                    className="btn btn-primary btn-full"
                    onClick={handleSubmit}
                    disabled={loading || preview.length === 0}
                    id="btn-save-words"
                >
                    {loading ? (
                        <>
                            <span className="spinner" style={{ borderWidth: '2px', width: '16px', height: '16px' }} />
                            Đang lưu...
                        </>
                    ) : (
                        <>💾 Lưu {preview.length > 0 ? `${preview.length} từ` : 'từ'}</>
                    )}
                </button>
            </div>

            {/* Alert */}
            {alert && (
                <div className={`alert alert-${alert.type}`}>
                    <span className="alert-icon">{alert.type === 'success' ? '✅' : '❌'}</span>
                    <div>
                        <div style={{ fontWeight: 600 }}>{alert.message}</div>
                        {alert.type === 'success' && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <div className="stat-row">
                                    <div className="stat-badge">
                                        <div className="stat-value">{alert.savedCount}</div>
                                        <div className="stat-label">Từ vừa lưu</div>
                                    </div>
                                    <div className="stat-badge">
                                        <div className="stat-value">{alert.totalCount}</div>
                                        <div className="stat-label">Tổng trong DB</div>
                                    </div>
                                </div>
                                {alert.savedWords && (
                                    <div className="preview-section" style={{ marginTop: '0.75rem' }}>
                                        <div className="preview-label">Các từ đã lưu</div>
                                        <div className="tag-list">
                                            {alert.savedWords.map((w, i) => (
                                                <span key={i} className="tag" style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.3)' }}>{w}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
