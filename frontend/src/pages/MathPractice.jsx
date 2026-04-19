import React, { useState } from 'react';
import '../styles/math.css';

const MathPractice = () => {
    const [limit, setLimit] = useState(10);
    const [problems, setProblems] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const generateProblems = () => {
        const newProblems = [];
        const minLimit = Math.max(2, limit);

        for (let i = 0; i < 50; i++) {
            const isAddition = Math.random() > 0.5;
            let a, b, result, op;

            if (isAddition) {
                op = '+';
                // a + b = result, where a > 0, b > 0. 
                // So result must be >= 2.
                result = Math.floor(Math.random() * (minLimit - 2 + 1)) + 2;
                a = Math.floor(Math.random() * (result - 1)) + 1; // 1 to result-1
                b = result - a;
            } else {
                op = '-';
                // a - b = result, where a > 0, b > 0, result > 0.
                // So a must be >= 2, and b must be >= 1 and < a.
                a = Math.floor(Math.random() * (minLimit - 2 + 1)) + 2;
                b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
                result = a - b;
            }

            newProblems.push({
                a,
                b,
                op,
                correctAnswer: result,
                userAnswer: ''
            });
        }
        setProblems(newProblems);
        setShowResults(false);
    };


    const handleAnswerChange = (index, value) => {
        const updatedProblems = [...problems];
        updatedProblems[index].userAnswer = value;
        setProblems(updatedProblems);
    };

    const calculateScore = () => {
        const correctCount = problems.filter(p => parseInt(p.userAnswer) === p.correctAnswer).length;
        return { count: correctCount, total: problems.length };
    };

    return (
        <div className="math-container">
            <h1 className="math-title">Math Practice for Kids</h1>
            <div className="math-setup">
                <div className="setup-inner">
                    <label className="setup-label">Giới hạn số (N): </label>
                    <div className="setup-controls">
                        <input
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 1))}
                            className="limit-input"
                        />
                        <button onClick={generateProblems} className="btn-generate">Bắt đầu</button>
                    </div>
                </div>
            </div>


            {problems.length > 0 && (
                <div className="problems-grid">
                    {problems.map((p, index) => (
                        <div key={index} className={`problem-item ${showResults ? (parseInt(p.userAnswer) === p.correctAnswer ? 'correct' : 'incorrect') : ''}`}>
                            <span className="problem-text">{p.a} {p.op} {p.b} = </span>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={p.userAnswer}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Only allow empty string or non-negative integers
                                        if (val === '' || /^[0-9]+$/.test(val)) {
                                            handleAnswerChange(index, val);
                                        }
                                    }}
                                    className="answer-input"
                                    placeholder="?"
                                    disabled={showResults}
                                />


                                {showResults && (
                                    <span className="result-indicator">
                                        {parseInt(p.userAnswer) === p.correctAnswer ? '✔️' : '❌'}
                                    </span>
                                )}
                            </div>
                            {showResults && parseInt(p.userAnswer) !== p.correctAnswer && (
                                <div className="correct-answer">
                                    Đáp án đúng: {p.correctAnswer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {problems.length > 0 && !showResults && (
                <div className="math-actions">
                    <button onClick={() => setShowResults(true)} className="btn-check">Nộp bài (Kiểm tra)</button>
                </div>
            )}

            {showResults && (
                <div className="results-summary">
                    <h2>🏆 Kết quả: {calculateScore().count} / {calculateScore().total}</h2>
                    <p>{calculateScore().count === calculateScore().total ? "Tuyệt vời! Con làm đúng hết rồi! 🌟" : "Cố gắng lên nhé! 😊"}</p>
                    <button onClick={generateProblems} className="btn-retry">Làm lại bộ mới</button>
                </div>
            )}

        </div>
    );
};

export default MathPractice;
