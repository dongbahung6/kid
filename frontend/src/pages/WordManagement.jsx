import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'

export default function WordManagement() {
    const [words, setWords] = useState([])
    const [selectedWords, setSelectedWords] = useState([])
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)

    const fetchWords = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axios.get('/api/words')
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
            setSelectedWords([...words])
        } else {
            setSelectedWords([])
        }
    }

    const handleSelectWord = (word) => {
        setSelectedWords(prev =>
            prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
        )
    }

    const handleDelete = async () => {
        if (selectedWords.length === 0) return
        if (!window.confirm(`Bạn có chắc muốn xóa ${selectedWords.length} từ đã chọn?`)) return

        setLoading(true)
        try {
            await axios.delete('/api/words', { data: { words: selectedWords } })
            setAlert({ type: 'success', message: `Đã xóa thành công ${selectedWords.length} từ.` })
            setSelectedWords([])
            fetchWords()
        } catch (err) {
            setAlert({ type: 'error', message: 'Lỗi khi xóa từ.' })
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/words/export', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'danh-sach-tu.txt')
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            setAlert({ type: 'error', message: 'Lỗi khi xuất file.' })
        }
    }

    const handleImport = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true)
        try {
            const res = await axios.post('/api/words/import', formData, {
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Tổng số: <strong>{words.length}</strong> từ
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
                        disabled={selectedWords.length === 0 || loading}
                        onClick={handleDelete}
                    >
                        🗑️ Xóa {selectedWords.length > 0 ? `${selectedWords.length} từ` : ''}
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
                                            checked={selectedWords.length === words.length && words.length > 0}
                                        />
                                    </th>
                                    <th>Từ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {words.map((word, index) => (
                                    <tr key={word} className={selectedWords.includes(word) ? 'selected' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedWords.includes(word)}
                                                onChange={() => handleSelectWord(word)}
                                            />
                                        </td>
                                        <td>{word}</td>
                                    </tr>
                                ))}
                                {words.length === 0 && (
                                    <tr>
                                        <td colSpan="2" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            Chưa có từ nào trong database.
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
