// カテゴリ定義
const CATEGORIES = [
    { id: 'p1_01', name: 'Part1: 化粧の歴史', file: 'p1_01.json' },
    { id: 'p2_02', name: 'Part2: 化粧品の原料', file: 'p2_02.json' },
    { id: 'p3_03_01_02', name: 'Part3 1-2: スキンケア/男性肌', file: 'p3_03_01_02.json' },
    { id: 'p3_03_03_05', name: 'Part3 3-5: UV/メイク/ベース', file: 'p3_03_03_05.json' },
    { id: 'p3_03_06_08', name: 'Part3 6-8: ポイント/特徴/ボディ', file: 'p3_03_06_08.json' },
    { id: 'p3_03_09_10', name: 'Part3 9-10: その他ボディ/毛髪構造', file: 'p3_03_09_10.json' },
    { id: 'p3_03_11_13', name: 'Part3 11-13: ヘアケア/爪/ネイル', file: 'p3_03_11_13.json' },
    { id: 'p3_03_14_15', name: 'Part3 14-15: 嗅覚/フレグランス', file: 'p3_03_14_15.json' },
    { id: 'p3_03_16_18', name: 'Part3 16-18: 歯/ケア/サプリ', file: 'p3_03_16_18.json' },
    { id: 'p4_04_01_04', name: 'Part4 1-4: 薬機法/定義/広告/表示', file: 'p4_04_01_04.json' },
    { id: 'p4_04_05_07', name: 'Part4 5-7: 品質/安全/法律/トラブル', file: 'p4_04_05_07.json' },
    { id: 'p5_05', name: 'Part5: 官能評価', file: 'p5_05.json' }
];

let currentQuiz = [];
let currentIndex = 0;
let score = 0;

window.onload = () => {
    renderTopPage();
    updateReviewCount();
};

function renderTopPage() {
    const list = document.getElementById('category-list');
    list.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        btn.innerHTML = cat.name;
        btn.onclick = () => startQuiz(cat.file);
        list.appendChild(btn);
    });
}

// クイズ開始（カテゴリ内全問出題）
async function startQuiz(fileName) {
    const response = await fetch(`data/${fileName}`);
    const data = await response.json();
    // シャッフルはするが、sliceせず全問をセット
    currentQuiz = data.sort(() => 0.5 - Math.random());
    initQuiz();
}

// 復習モード開始
function startReviewQuiz() {
    const reviews = JSON.parse(localStorage.getItem('reviewQuestions') || '[]');
    if (reviews.length === 0) return alert('復習する問題がありません');
    currentQuiz = reviews.sort(() => 0.5 - Math.random());
    initQuiz();
}

function initQuiz() {
    currentIndex = 0;
    score = 0;
    document.getElementById('top-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    const q = currentQuiz[currentIndex];
    document.getElementById('feedback-area').classList.add('hidden');
    
    // 表示の修正: 「第〇問」は元のIDを表示。進行状況をカッコ内に表示。
    document.getElementById('current-num').innerText = `${q.id} (進捗: ${currentIndex + 1}/${currentQuiz.length})`;
    
    document.getElementById('category-display').innerText = q.category;
    document.getElementById('question-text').innerText = q.question;
    
    const tableArea = document.getElementById('table-area');
    tableArea.innerHTML = q.table ? renderTable(q.table) : '';
    
    const imgArea = document.getElementById('image-area');
    imgArea.innerHTML = q.image ? `<img src="assets/${q.image}">` : '';

    const container = document.getElementById('options-container');
    container.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(i + 1, q.answer, q.explanation, q);
        container.appendChild(btn);
    });
}

function renderTable(tableData) {
    let html = '<table>';
    tableData.forEach(row => {
        html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
    });
    return html + '</table>';
}

function checkAnswer(selected, correct, explanation, questionObj) {
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);

    if (selected === correct) {
        btns[selected - 1].classList.add('correct');
        document.getElementById('result-mark').innerText = '⭕ 正解';
        document.getElementById('result-mark').style.color = 'var(--correct-color)';
        score++;
        removeReview(questionObj.id);
    } else {
        btns[selected - 1].classList.add('wrong');
        btns[correct - 1].classList.add('correct');
        document.getElementById('result-mark').innerText = '❌ 不正解';
        document.getElementById('result-mark').style.color = 'var(--wrong-color)';
        saveReview(questionObj);
    }

    document.getElementById('explanation-text').innerText = explanation;
    document.getElementById('feedback-area').classList.remove('hidden');
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < currentQuiz.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('result-stats').innerText = `${currentQuiz.length}問中 ${score}問正解`;
}

function quitQuiz() {
    if (confirm('クイズを中断してTOPに戻りますか？')) {
        location.reload();
    }
}

function saveReview(question) {
    let reviews = JSON.parse(localStorage.getItem('reviewQuestions') || '[]');
    if (!reviews.find(r => r.id === question.id)) {
        reviews.push(question);
        localStorage.setItem('reviewQuestions', JSON.stringify(reviews));
    }
    updateReviewCount();
}

function removeReview(id) {
    let reviews = JSON.parse(localStorage.getItem('reviewQuestions') || '[]');
    reviews = reviews.filter(r => r.id !== id);
    localStorage.setItem('reviewQuestions', JSON.stringify(reviews));
    updateReviewCount();
}

function updateReviewCount() {
    const reviews = JSON.parse(localStorage.getItem('reviewQuestions') || '[]');
    const countEl = document.getElementById('review-count');
    if(countEl) countEl.innerText = reviews.length;
}
