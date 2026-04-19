import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

const envApiBase = import.meta.env.VITE_API_BASE;
const API_BASE = (typeof envApiBase !== 'undefined' && envApiBase !== null) ? envApiBase : 'http://localhost:8080';

export default function WordManagement() {
    const { language } = useLanguage()
    const [words, setWords] = useState([])         // tất cả từ từ server
    const [langFilter, setLangFilter] = useState('ALL') // 'ALL' | 'VI' | 'EN'
    const [selectedIds, setSelectedIds] = useState([])
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)

    // Lọc hiển thị theo ngôn ngữ được chọn
    const filteredWords = langFilter === 'ALL' ? words : words.filter(w => w.language === langFilter)

    const fetchWords = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_BASE}/api/words`)
            setWords(res.data)
        } catch (err) {
            setAlert({ type: 'error', message: 'Không thể tải danh sách từ.' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchWords()
    }, [fetchWords])

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredWords.map(w => w.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectWord = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleDelete = async () => {
        if (selectedIds.length === 0) return
        if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} từ đã chọn?`)) return

        setLoading(true)
        try {
            await axios.delete(`${API_BASE}/api/words`, { data: { ids: selectedIds } })
            setAlert({ type: 'success', message: `Đã xóa thành công ${selectedIds.length} từ.` })
            setSelectedIds([])
            fetchWords()
        } catch (err) {
            setAlert({ type: 'error', message: 'Lỗi khi xóa từ.' })
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        // Nếu có từ được chọn → export những từ đó; nếu không → export toàn bộ filteredWords
        const toExport = selectedIds.length > 0
            ? filteredWords.filter(w => selectedIds.includes(w.id))
            : filteredWords

        if (toExport.length === 0) {
            setAlert({ type: 'error', message: 'Không có từ nào để xuất.' })
            return
        }

        // Tạo nội dung CSV
        const lines = ['word,language', ...toExport.map(w => `${w.value.replace(',', ';')},${w.language || 'VI'}`)]
        const content = lines.join('\n')

        // Tải file về máy
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const suffix = selectedIds.length > 0 ? `${selectedIds.length}-tu-chon` : `${langFilter.toLowerCase()}`
        link.setAttribute('download', `danh-sach-tu-${suffix}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }

    const handleImport = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)
        // Truyền ngôn ngữ hiện tại filter làm fallback cho file cũ không có cột language
        formData.append('language', langFilter !== 'ALL' ? langFilter : language)

        setLoading(true)
        try {
            const res = await axios.post(`${API_BASE}/api/words/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setAlert({ type: 'success', message: res.data.message })
            fetchWords()
        } catch (err) {
            setAlert({ type: 'error', message: 'Lỗi khi nhập file.' })
        } finally {
            setLoading(false)
            e.target.value = null // Reset input
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">⚙️ Quản lý từ</h1>
                <p className="page-subtitle">Xem danh sách, nhập/xuất và xóa các từ khỏi database</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* Filter ngôn ngữ */}
                        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px' }}>
                            {[['ALL', '🇹🇨 Tất cả'], ['VI', '🇻🇳 VI'], ['EN', '🇺🇸 EN']].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => { setLangFilter(val); setSelectedIds([]) }}
                                    style={{
                                        padding: '0.3rem 0.75rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: langFilter === val ? 700 : 400,
                                        background: langFilter === val ? 'var(--primary)' : 'transparent',
                                        color: langFilter === val ? '#fff' : 'var(--text-muted)',
                                        transition: 'all 0.2s',
                                    }}
                                >{label}</button>
                            ))}
                        </div>

                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Hiển thị: <strong>{filteredWords.length}</strong> / {words.length} từ
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" onClick={handleExport} style={{ padding: '0.5rem 1rem' }}>
                                📥 Xuất file
                            </button>
                            <label className="btn btn-secondary" style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginBottom: 0 }}>
                                📤 Nhập file
                                <input type="file" accept=".txt,.csv" hidden onChange={handleImport} />
                            </label>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ background: 'var(--error)', boxShadow: 'none' }}
                        disabled={selectedIds.length === 0 || loading}
                        onClick={handleDelete}
                    >
                        🗑️ Xóa {selectedIds.length > 0 ? `${selectedIds.length} từ` : ''}
                    </button>
                </div>

                {alert && (
                    <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.5rem', marginTop: 0 }}>
                        <span className="alert-icon">{alert.type === 'success' ? '✅' : '❌'}</span>
                        <div>{alert.message}</div>
                    </div>
                )}

                {loading && words.length === 0 ? (
                    <div className="loading">
                        <span className="spinner"></span> Đang tải...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="word-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedIds.length === filteredWords.length && filteredWords.length > 0}
                                        />
                                    </th>
                                    <th>Từ</th>
                                    <th>Ngôn ngữ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWords.map((word) => (
                                    <tr key={word.id} className={selectedIds.includes(word.id) ? 'selected' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(word.id)}
                                                onChange={() => handleSelectWord(word.id)}
                                            />
                                        </td>
                                        <td>{word.value}</td>
                                        <td>
                                            <span className="tag" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                                {word.language === 'VI' ? '🇻🇳 VI' : '🇺🇸 EN'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredWords.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            {words.length === 0 ? 'Chưa có từ nào trong database.' : `Không có từ ${langFilter === 'VI' ? 'tiếng Việt' : 'tiếng Anh'} nào.`}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .table-container {
                    overflow-x: auto;
                    max-height: 60vh;
                    overflow-y: auto;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border);
                }
                .word-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    background: rgba(0,0,0,0.2);
                }
                .word-table th {
                    background: rgba(255,255,255,0.05);
                    padding: 1rem;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .word-table td {
                    padding: 0.75rem 1rem;
                    border-top: 1px solid var(--border);
                    font-size: 1rem;
                    transition: all 0.2s;
                }
                .word-table tr:hover td {
                    background: rgba(255,255,255,0.03);
                }
                .word-table tr.selected td {
                    background: rgba(124, 58, 237, 0.1);
                    color: var(--primary-light);
                }
                input[type="checkbox"] {
                    cursor: pointer;
                    width: 18px;
                    height: 18px;
                    accent-color: var(--primary);
                }
            `}} />
        </div>
    )
}
