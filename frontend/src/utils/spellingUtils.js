/**
 * Tiện ích đánh vần tiếng Việt cho trẻ em.
 * Chuyển đổi từ -> chuỗi âm thanh đánh vần (ví dụ: "mèo" -> "mờ eo meo huyền mèo")
 */

const PHU_AM_DAU = {
    'b': 'bờ', 'c': 'cờ', 'd': 'dờ', 'đ': 'đờ', 'g': 'gờ', 'gh': 'gờ',
    'h': 'hờ', 'k': 'ca', 'l': 'lờ', 'm': 'mờ', 'n': 'nờ', 'ng': 'ngờ',
    'ngh': 'ngờ', 'nh': 'nhờ', 'p': 'pờ', 'ph': 'phờ', 'q': 'quờ',
    'r': 'rờ', 's': 'sờ', 't': 'tờ', 'th': 'thờ', 'tr': 'trờ',
    'v': 'vờ', 'x': 'xờ', 'gi': 'di', 'qu': 'quờ', 'kh': 'khờ', 'ch': 'chờ'
};

const D_DAU = {
    '́': 'sắc', '̀': 'huyền', '̉': 'hỏi', '̃': 'ngã', '̣': 'nặng'
};

// Bản đồ ký tự có dấu sang không dấu và dấu
const CHAR_MAP = {
    'á': ['a', '́'], 'à': ['a', '̀'], 'ả': ['a', '̉'], 'ã': ['a', '̃'], 'ạ': ['a', '̣'],
    'â': ['â', ''], 'ấ': ['â', '́'], 'ầ': ['â', '̀'], 'ẩ': ['â', '̉'], 'ẫ': ['â', '̃'], 'ậ': ['â', '̣'],
    'ă': ['ă', ''], 'ắ': ['ă', '́'], 'ằ': ['ă', '̀'], 'ẳ': ['ă', '̉'], 'ẵ': ['ă', '̃'], 'ặ': ['ă', '̣'],
    'é': ['e', '́'], 'è': ['e', '̀'], 'ẻ': ['e', '̉'], 'ẽ': ['e', '̃'], 'ẹ': ['e', '̣'],
    'ê': ['ê', ''], 'ế': ['ê', '́'], 'ề': ['ê', '̀'], 'ể': ['ê', '̉'], 'ễ': ['ê', '̃'], 'ệ': ['ê', '̣'],
    'í': ['i', '́'], 'ì': ['i', '̀'], 'ỉ': ['i', '̉'], 'ĩ': ['i', '̃'], 'ị': ['i', '̣'],
    'ó': ['o', '́'], 'ò': ['o', '̀'], 'ỏ': ['o', '̉'], 'õ': ['o', '̃'], 'ọ': ['o', '̣'],
    'ô': ['ô', ''], 'ố': ['ô', '́'], 'ồ': ['ô', '̀'], 'ổ': ['ô', '̉'], 'ỗ': ['ô', '̃'], 'ộ': ['ô', '̣'],
    'ơ': ['ơ', ''], 'ớ': ['ơ', '́'], 'ờ': ['ơ', '̀'], 'ở': ['ơ', '̉'], 'ỡ': ['ơ', '̃'], 'ợ': ['ơ', '̣'],
    'ú': ['u', '́'], 'ù': ['u', '̀'], 'ủ': ['u', '̉'], 'ũ': ['u', '̃'], 'ụ': ['u', '̣'],
    'ư': ['ư', ''], 'ứ': ['ư', '́'], 'ừ': ['ư', '̀'], 'ử': ['ư', '̉'], 'ữ': ['ư', '̃'], 'ự': ['ư', '̣'],
    'ý': ['y', '́'], 'ỳ': ['y', '̀'], 'ỷ': ['y', '̉'], 'ỹ': ['y', '̃'], 'ỵ': ['y', '̣'],
    'đ': ['đ', '']
};

/**
 * Phân tích một từ tiếng Việt đơn lẻ
 */
function analyzeWord(word) {
    word = word.toLowerCase().trim();
    if (!word) return null;

    let basicChars = "";
    let tone = "";

    for (let char of word) {
        if (CHAR_MAP[char]) {
            basicChars += CHAR_MAP[char][0];
            if (CHAR_MAP[char][1]) tone = D_DAU[CHAR_MAP[char][1]];
        } else {
            basicChars += char;
        }
    }

    // Tìm phụ âm đầu (đơn giản hóa)
    let onset = "";
    let rhyme = "";

    const onsets = ['ngh', 'ng', 'nh', 'ph', 'th', 'tr', 'kh', 'gh', 'ch', 'gi', 'qu', 'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'x'];

    for (let o of onsets) {
        if (basicChars.startsWith(o)) {
            onset = o;
            rhyme = basicChars.substring(o.length);
            break;
        }
    }

    if (!onset) {
        rhyme = basicChars;
    }

    return { onset, rhyme, tone, original: word };
}

/**
 * Tạo chuỗi văn bản để đọc đánh vần
 */
/**
 * Tạo chuỗi văn bản để đọc đánh vần
 * Với tiếng Anh: đọc thẳng từ, không đánh vần kiểu Việt
 */
export function getSpellingText(word, language = 'VI') {
    if (language === 'EN') {
        // Tiếng Anh: đọc thẳng cả từ, không phân tách
        return word;
    }

    // Tiếng Việt: logic đánh vần như cũ
    const analysis = analyzeWord(word);
    if (!analysis) return word;

    const { onset, rhyme, tone, original } = analysis;

    let parts = [];

    if (onset && PHU_AM_DAU[onset]) {
        parts.push(PHU_AM_DAU[onset]);
    }

    if (rhyme) {
        parts.push(rhyme);
    }

    if (onset && rhyme) {
        parts.push(onset + rhyme);
    }

    if (tone) {
        parts.push(tone);
        parts.push(original);
    } else if (!onset || !rhyme) {
        if (parts.length > 1) parts.push(original);
    }

    return parts.join(" ");
}

/**
 * Phát âm sử dụng Web Speech API
 */
/**
 * Phát âm sử dụng Web Speech API
 * @param {string} text - Văn bản cần đọc
 * @param {Function} callback - Hàm gọi khi đọc xong
 * @param {string} language - 'VI' hoặc 'EN' (mặc định 'VI')
 */
export function speak(text, callback, language = 'VI') {
    if (!window.speechSynthesis) {
        console.error("Trình duyệt không hỗ trợ Web Speech API");
        return;
    }

    window.speechSynthesis.cancel();

    const executeSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1;

        let voices = window.speechSynthesis.getVoices();

        if (language === 'EN') {
            utterance.lang = 'en-US';
            utterance.rate = 0.85;
            // Tìm giọng tiếng Anh
            const enVoice =
                voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Microsoft'))) ||
                voices.find(v => v.lang === 'en-US') ||
                voices.find(v => v.lang.startsWith('en'));
            if (enVoice) {
                utterance.voice = enVoice;
                console.log("Giọng tiếng Anh:", enVoice.name);
            } else {
                console.warn("Không tìm thấy giọng tiếng Anh, dùng giọng mặc định.");
            }
        } else {
            utterance.lang = 'vi-VN';
            utterance.rate = 0.85;
            // Tìm giọng tiếng Việt
            const findVoiceVI = () => {
                let v = voices.find(v => v.name === 'Google-Tiếng-Việt-1-Natural' || v.name === 'Google Tiếng Việt');
                if (v) return v;
                v = voices.find(v => v.lang.startsWith('vi') && v.name.includes('Natural'));
                if (v) return v;
                v = voices.find(v => (v.lang === 'vi-VN' || v.lang === 'vi_VN') &&
                    (v.name.includes('Google') || v.name.includes('Microsoft')));
                if (v) return v;
                v = voices.find(v => v.lang === 'vi-VN' || v.lang === 'vi_VN');
                if (v) return v;
                return voices.find(v => v.lang.toLowerCase().startsWith('vi')) || null;
            };
            const viVoice = findVoiceVI();
            if (viVoice) {
                utterance.voice = viVoice;
                console.log("Giọng tiếng Việt:", viVoice.name);
            } else {
                console.warn("Không tìm thấy giọng tiếng Việt. Đang thử dùng giọng mặc định...");
            }
        }

        if (callback) utterance.onend = callback;
        utterance.onerror = (e) => {
            console.error("Lỗi phát âm:", e);
            if (callback) callback();
        };

        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
        executeSpeak();
    } else {
        window.speechSynthesis.onvoiceschanged = () => {
            executeSpeak();
            window.speechSynthesis.onvoiceschanged = null;
        };
    }
}

// HÀM KHỞI ĐỘNG (WARM-UP): Gọi ngay khi code này được import
// Điều này giúp "đánh thức" các giọng Natural mà không cần bật Reading Mode
if (typeof window !== 'undefined' && window.speechSynthesis) {
    let loadCheckInterval = null;
    let attempts = 0;

    const warmUp = () => {
        const voices = window.speechSynthesis.getVoices();
        attempts++;

        // Nếu đã có voice hoặc quá 10 lần thử
        if (voices.length > 0 || attempts > 10) {
            if (loadCheckInterval) clearInterval(loadCheckInterval);

            // Kích hoạt "silent speech" khi có tương tác người dùng đầu tiên
            // Chrome chặn auto-play speech, nên ta cần gắn vào click/touchstart
            const forceLoad = () => {
                const silent = new SpeechSynthesisUtterance(" ");
                silent.volume = 0;
                window.speechSynthesis.speak(silent);
                window.removeEventListener('mousedown', forceLoad);
                window.removeEventListener('touchstart', forceLoad);
            };
            window.addEventListener('mousedown', forceLoad);
            window.addEventListener('touchstart', forceLoad);
        }
    };

    // Kiểm tra định kỳ mỗi 500ms cho đến khi voices được nạp
    loadCheckInterval = setInterval(warmUp, 500);
    warmUp();
}
