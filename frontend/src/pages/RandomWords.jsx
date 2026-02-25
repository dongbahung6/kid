import { useState, useCallback } from 'react'
import axios from 'axios'
import { speak, getSpellingText } from '../utils/spellingUtils'

// Màu gradient ngẫu nhiên cho card
const GRADIENTS = [
    'linear-gradient(135deg, #7c3aed, #0ea5e9)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #10b981, #0ea5e9)',
    'linear-gradient(135deg, #ec4899, #7c3aed)',
    'linear-gradient(135deg, #f59e0b, #10b981)',
    'linear-gradient(135deg, #0ea5e9, #10b981)',
    'linear-gradient(135deg, #ef4444, #ec4899)',
    'linear-gradient(135deg, #a78bfa, #f59e0b)',
]

function getGradient(index) {
    return GRADIENTS[index % GRADIENTS.length]
}

export default function RandomWords() {
    const [count, setCount] = useState(5)
    const [wordLength, setWordLength] = useState('')
    const [searchPattern, setSearchPattern] = useState('')
    const [words, setWords] = useState([])
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)
    const [hasResult, setHasResult] = useState(false)
    const [isHandwriting, setIsHandwriting] = useState(false)
    const [speakingWord, setSpeakingWord] = useState(null)

    const handleFetch = useCallback(async () => {
        if (!count || count < 1) {
            setAlert({ type: 'error', message: 'Số lượng từ phải lớn hơn 0.' })
            return
        }
        setLoading(true)
        setAlert(null)
        setWords([])
        setHasResult(false)
        try {
            const lengthQuery = wordLength ? `&length=${wordLength}` : ''
            const searchQuery = searchPattern ? `&search=${encodeURIComponent(searchPattern)}` : ''
            const res = await axios.get(`/api/words/random?count=${count}${lengthQuery}${searchQuery}`)
            const data = res.data
            if (data.words.length === 0) {
                let msg = 'Không có từ nào thỏa mãn điều kiện.'
                if (!wordLength && !searchPattern) {
                    msg = 'Không có từ nào trong database. Hãy nhập từ trước!'
                }
                setAlert({ type: 'error', message: msg })
            } else {
                setWords(data.words)
                setHasResult(true)
                if (data.count < count && !wordLength && !searchPattern) {
                    setAlert({
                        type: 'success',
                        message: `Chỉ có ${data.count} từ trong DB. Đã hiển thị toàn bộ.`,
                    })
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Lỗi kết nối server'
            setAlert({ type: 'error', message: msg })
        } finally {
            setLoading(false)
        }
    }, [count, wordLength, searchPattern])

    const handleSpeak = (word) => {
        const spellingText = getSpellingText(word);
        setSpeakingWord(word);
        speak(spellingText, () => setSpeakingWord(null));
    }

    const handleDeleteSingle = async (wordToDelete) => {
        if (!window.confirm(`Xóa từ "${wordToDelete}"?`)) return

        try {
            await axios.delete('/api/words', { data: { words: [wordToDelete] } })
            setWords(prev => prev.filter(w => w !== wordToDelete))
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Lỗi khi xóa từ'
            setAlert({ type: 'error', message: msg })
        }
    }

    return (
        <div className={isHandwriting ? 'font-handwriting' : ''}>
            <div className="page-header">
                <h1 className="page-title">🎲 Hiển thị ngẫu nhiên</h1>
                <p className="page-subtitle">
                    Lọc từ theo độ dài hoặc tìm kiếm mẫu ký tự (dùng % làm đại diện)
                </p>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
                <div className="compact-row" style={{ gap: '0.75rem' }}>
                    <div className="form-group" style={{ flex: '0.5' }}>
                        <label htmlFor="word-count">Số lượng</label>
                        <input
                            id="word-count"
                            type="number"
                            min={1}
                            max={500}
                            value={count}
                            onChange={e => {
                                setCount(parseInt(e.target.value) || 1)
                                setAlert(null)
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ flex: '0.5' }}>
                        <label htmlFor="word-length">Độ dài</label>
                        <input
                            id="word-length"
                            type="number"
                            min={1}
                            max={20}
                            value={wordLength}
                            onChange={e => {
                                setWordLength(e.target.value)
                                setAlert(null)
                            }}
                            placeholder="Tất cả"
                        />
                    </div>

                    <div className="form-group" style={{ flex: '1.2' }}>
                        <label htmlFor="search-pattern">Tìm kiếm (% đại diện)</label>
                        <input
                            id="search-pattern"
                            type="text"
                            value={searchPattern}
                            onChange={e => {
                                setSearchPattern(e.target.value)
                                setAlert(null)
                            }}
                            placeholder="vd: p% hoặc %p hoặc %n%"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flex: '2', alignSelf: 'flex-end', marginBottom: '0.1rem' }}>
                        <button
                            className="btn btn-primary btn-full"
                            onClick={handleFetch}
                            disabled={loading}
                            id="btn-fetch-random"
                            style={{ height: '42px' }}
                        >
                            {loading ? <span className="spinner"></span> : <>🎲 Hiện {count} từ</>}
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => setIsHandwriting(!isHandwriting)}
                            title={isHandwriting ? "Chuyển sang phông chuẩn" : "Chuyển sang phông viết tay"}
                            style={{ height: '42px', minWidth: '45px', padding: '0' }}
                        >
                            {isHandwriting ? '🔤' : '✍️'}
                        </button>

                        {hasResult && (
                            <button
                                className="btn btn-secondary"
                                onClick={handleFetch}
                                disabled={loading}
                                title="Shuffle lại"
                                id="btn-reshuffle"
                                style={{ height: '42px', minWidth: '45px', padding: '0' }}
                            >
                                🔁
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Alert */}
            {alert && (
                <div className={`alert alert-${alert.type}`} style={{ marginTop: '1.25rem' }}>
                    <span className="alert-icon">{alert.type === 'success' ? 'ℹ️' : '❌'}</span>
                    <div>{alert.message}</div>
                </div>
            )}

            {/* Kết quả */}
            {hasResult && words.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Kết quả — {words.length} từ
                        </h2>
                    </div>
                    <div className="word-grid">
                        {words.map((word, index) => (
                            <div
                                key={`${word}-${index}`}
                                className="word-card"
                                style={{
                                    animationDelay: `${index * 0.06}s`,
                                }}
                            >
                                <button
                                    className="word-card-delete"
                                    onClick={() => handleDeleteSingle(word)}
                                    title="Xóa từ này"
                                >
                                    &times;
                                </button>
                                <div
                                    className="word-card-number"
                                    style={{
                                        background: getGradient(index),
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 700,
                                    }}
                                >
                                    #{index + 1}
                                </div>
                                <div
                                    className={`word-card-text ${speakingWord === word ? 'speaking-pulse' : ''}`}
                                    onClick={() => handleSpeak(word)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {word}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state trước khi fetch */}
            {!hasResult && !loading && (
                <div className="empty-state">
                    <div className="empty-icon">🎴</div>
                    <p>Nhập số lượng và nhấn nút để hiển thị các từ ngẫu nhiên</p>
                </div>
            )}
        </div>
    )
}
