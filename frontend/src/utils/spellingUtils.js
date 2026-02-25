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
export function getSpellingText(word) {
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
        // Nếu chỉ có vần hoặc chỉ có phụ âm (hiếm), hoặc từ ko dấu
        if (parts.length > 1) parts.push(original);
    }

    return parts.join(" ");
}

/**
 * Phát âm sử dụng Web Speech API
 */
export function speak(text, callback) {
    if (!window.speechSynthesis) {
        console.error("Trình duyệt không hỗ trợ Web Speech API");
        return;
    }

    // Hủy các yêu cầu đọc đang dang dở
    window.speechSynthesis.cancel();

    // Hàm thực hiện việc đọc
    const executeSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.pitch = 1;
        utterance.rate = 0.85;

        // Lấy danh sách voice hiện có
        const voices = window.speechSynthesis.getVoices();

        // Tìm giọng tiếng Việt theo độ ưu tiên
        let selectedVoice = null;

        // 0. Ưu tiên đặc biệt cho giọng người dùng yêu cầu
        selectedVoice = voices.find(v => v.name === 'Google-Tiếng-Việt-1-Natural' || v.name.includes('Google Tiếng Việt'));

        // 1. Tìm chính xác vi-VN (ưu tiên Google/Microsoft/Natural)
        if (!selectedVoice) {
            selectedVoice = voices.find(v => (v.lang === 'vi-VN' || v.lang === 'vi_VN') &&
                (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural')));
        }

        // 2. Tìm bất kỳ vi-VN nào
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang === 'vi-VN' || v.lang === 'vi_VN');
        }

        // 3. Tìm giọng có chữ "Vietnamese" trong tên
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.name.toLowerCase().includes('vietnamese'));
        }

        // 4. Tìm bất kỳ giọng nào bắt đầu bằng 'vi'
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith('vi'));
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log("Đang sử dụng giọng đọc:", selectedVoice.name);
        } else {
            console.warn("Không tìm thấy giọng tiếng Việt. Trình duyệt sẽ dùng giọng mặc định (có thể là tiếng Anh).");
        }

        if (callback) {
            utterance.onend = callback;
        }

        utterance.onerror = (e) => {
            console.error("Lỗi phát âm:", e);
            if (callback) callback();
        };

        window.speechSynthesis.speak(utterance);
    };

    // Chrome thường trả về danh sách trống lần đầu
    if (window.speechSynthesis.getVoices().length === 0) {
        // Chỉ gán callback một lần
        window.speechSynthesis.onvoiceschanged = () => {
            executeSpeak();
            // Xóa callback để tránh lặp lại
            window.speechSynthesis.onvoiceschanged = null;
        };
    } else {
        executeSpeak();
    }
}
