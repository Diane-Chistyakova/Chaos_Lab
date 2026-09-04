(() => {
  'use strict';

  const questions = [
    {
      topic: 'Основы хаоса', format: 'Один ответ',
      title: 'Что изменится, если сделать начальную разницу δ₀ ещё меньше?',
      prompt: 'Две траектории вычисляются по одному хаотическому правилу. Меняется только расстояние между их начальными значениями.',
      visual: 'trajectories', type: 'choice',
      options: [['never', 'Траектории никогда не разойдутся'], ['later', 'Они дольше будут близки, но затем всё равно заметно разойдутся'], ['random', 'Одна из траекторий станет случайной'], ['law', 'Для второй траектории изменится закон движения']],
      correct: 'later',
      explanation: 'Меньшее δ₀ увеличивает горизонт надёжного прогноза, но не отменяет чувствительность к начальным условиям: в хаотическом режиме малое различие со временем усиливается.',
      review: ['Повторить эксперимент «Основы хаоса»', 'basics.html']
    },
    {
      topic: 'Логистическое отображение', format: 'Интерпретация схемы',
      title: 'Какой процесс показывает схема 1 → 2 → 4 → 8?',
      prompt: 'При медленном увеличении параметра r долгосрочная траектория последовательно посещает всё больше устойчивых значений.',
      visual: 'branches', type: 'choice',
      options: [['decay', 'Постепенное исчезновение траектории'], ['doubling', 'Каскад удвоения периода'], ['random', 'Добавление случайных чисел в формулу'], ['fixed', 'Возвращение к одной устойчивой точке']],
      correct: 'doubling',
      explanation: 'Разветвления 1, 2, 4, 8… означают последовательное удвоение периода. Это классический путь логистического отображения от устойчивого режима к хаосу.',
      review: ['Открыть лабораторию логистического отображения', 'logistic.html']
    },
    {
      topic: 'Показатель Ляпунова', format: 'Числовая интерпретация',
      title: 'Что можно заключить по значению λ = +0,18?',
      prompt: 'Оценка получена после удаления переходного участка и усреднения по большому числу итераций.',
      visual: 'lambda', type: 'choice',
      options: [['stable', 'Близкие траектории в среднем сближаются: режим устойчивый или периодический'], ['boundary', 'Система точно находится на границе изменения режима'], ['chaos', 'Близкие траектории в среднем расходятся экспоненциально: режим хаотический'], ['unknown', 'Знак λ ничего не говорит о характере режима']],
      correct: 'chaos',
      explanation: 'Положительный показатель Ляпунова означает среднее экспоненциальное расхождение близких траекторий — один из главных признаков хаотического режима.',
      review: ['Повторить показатель Ляпунова', 'logistic.html']
    },
    {
      topic: 'Система Лоренца', format: 'Верное утверждение',
      title: 'Почему изменение ρ может полностью изменить режим системы Лоренца?',
      prompt: 'Форма трёх уравнений остаётся прежней, но исследователь меняет значение одного параметра.',
      type: 'choice',
      options: [['noise', 'Параметр ρ добавляет в уравнения случайный шум'], ['field', 'ρ входит в закон системы и меняет поле скоростей, устойчивость состояний и характер траектории'], ['initial', 'ρ является только другим обозначением начальной координаты'], ['drawing', 'Меняется лишь масштаб рисунка, а движение остаётся тем же']],
      correct: 'field',
      explanation: 'Параметр — часть математического закона. Меняя ρ, мы сохраняем форму уравнений, но меняем связи между переменными, поэтому устойчивость и режим движения могут стать качественно другими.',
      review: ['Вернуться к системе Лоренца', 'lorenz.html']
    },
    {
      topic: 'Фракталы', format: 'Интерпретация масштаба',
      title: 'Какой вывод лучше всего описывает эти три масштаба границы множества Мандельброта?',
      prompt: 'При каждом увеличении обнаруживаются новые сложные детали, похожие на структуры более крупного масштаба.',
      visual: 'scales', type: 'choice',
      options: [['pixels', 'Мелкие детали появляются только из-за пикселей экрана'], ['similarity', 'Фрактальная граница проявляет самоподобие: похожие мотивы возникают на разных масштабах'], ['identical', 'Каждый увеличенный участок является точной копией всего множества'], ['finite', 'После следующего увеличения граница обязательно станет гладкой']],
      correct: 'similarity',
      explanation: 'Самоподобие не всегда означает точное копирование. У множества Мандельброта родственные формы повторяются с вариациями, а увеличение открывает новые уровни деталей.',
      review: ['Исследовать фрактальные масштабы', 'fractal.html']
    },
    {
      topic: 'Применения', format: 'Анализ ситуации',
      title: 'Какой вывод из наблюдения наиболее корректен?',
      prompt: 'В учебной модели погоды запустили два расчёта по одному и тому же закону. Начальная температура отличалась лишь на 0,001 °C. Сначала прогнозы почти совпадали, но через много шагов показали заметно разные состояния атмосферы.',
      type: 'choice',
      options: [['sensitivity', 'Модель чувствительна к начальным условиям: малое исходное различие со временем усилилось'], ['randomness', 'Модель стала случайной, поэтому её уравнения больше не определяют результат'], ['measurement', 'Расхождение обязательно означает ошибку измерения и ничего не говорит о динамике системы'], ['law-change', 'Во время второго расчёта сам закон системы незаметно изменился']],
      correct: 'sensitivity',
      explanation: 'Одинаковые детерминированные правила могут приводить к заметно разным долгосрочным результатам, если начальные состояния немного различаются. Это проявление чувствительности к начальным условиям, а не случайность и не изменение закона системы.',
      review: ['Повторить реальные применения', 'applications.html']
    },
    {
      topic: 'Эксперименты', format: 'Анализ данных',
      title: 'Как правильно интерпретировать результаты измерений?',
      prompt: 'Отношения расстояний между последовательными бифуркациями приближаются к 4,67, а внутри хаотической области найден участок с периодическим движением.',
      visual: 'data', type: 'choice',
      options: [['simple-border', 'Между порядком и хаосом всегда существует одна простая граница'], ['broken', 'Периодический участок доказывает, что модель вычислена неверно'], ['structure', 'Удвоения периода имеют универсальную закономерность, а внутри хаоса возможны периодические окна'], ['random-ratio', 'Число 4,67 случайно и не связано с последовательностью бифуркаций']],
      correct: 'structure',
      explanation: 'Отношения, близкие к числу Фейгенбаума, показывают закономерное масштабирование каскада удвоений. Периодические окна напоминают, что области порядка могут встречаться внутри хаотических режимов.',
      review: ['Повторить исследовательские эксперименты', 'experiments.html']
    },
    {
      topic: 'Общий вывод', format: 'Итоговое утверждение',
      title: 'Какой вывод о теории хаоса наиболее точен?',
      prompt: 'Выберите утверждение, которое объединяет результаты всех лабораторий.',
      type: 'choice',
      options: [['randomness', 'Хаос — это полная случайность, поэтому уравнения для него не нужны'], ['prediction', 'Если измерить начальные условия достаточно точно, любой долгосрочный прогноз станет безошибочным'], ['simple', 'Сложное поведение возможно только у систем с очень сложными уравнениями'], ['deterministic', 'Детерминированные нелинейные системы могут быть чувствительными, структурированными и ограниченно предсказуемыми']],
      correct: 'deterministic',
      explanation: 'Хаотическая система подчиняется точным законам, но из-за нелинейности и чувствительности её конкретное долгосрочное состояние трудно предсказать. При этом в хаосе сохраняются структура и закономерности.',
      review: ['Вернуться к основам теории хаоса', 'basics.html']
    }
  ];

  const $ = (selector) => document.querySelector(selector);
  const elements = {area:$('#quiz-area'),card:$('#quiz-card'),result:$('#quiz-result'),counter:$('#question-counter'),topic:$('#question-topic'),format:$('#question-format'),title:$('#question-title'),prompt:$('#question-prompt'),visual:$('#question-visual'),form:$('#answer-form'),answers:$('#quiz-answers'),hint:$('#selection-hint'),feedback:$('#quiz-feedback'),previous:$('#previous-question'),check:$('#check-answer'),next:$('#next-question'),reset:$('#reset-quiz'),statusQuestion:$('#status-question'),progress:$('.quiz-progress'),progressFill:$('#progress-fill'),progressCopy:$('#progress-copy'),liveScore:$('#live-score'),route:$('#quiz-route'),resultScore:$('#result-score'),resultPercent:$('#result-percent'),resultGrade:$('#result-grade'),resultMessage:$('#result-message'),reviewTitle:$('#review-title'),reviewList:$('#review-list'),professorAvatar:$('#result-professor-avatar'),professorName:$('#result-professor-name'),professorMessage:$('#result-professor-message'),restart:$('#restart-quiz')};
  if (Object.values(elements).some((element) => !element)) return;

  let currentIndex = 0;
  let score = 0;
  let locked = false;
  let results = [];
  let selections = Array(questions.length).fill(null);
  let finalVisible = false;
  let maxVisited = 0;
  const storageKey = 'chaos-lab-quiz-state-v1';

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function prepareCanvas(canvas) {
    const width = Math.max(280, Math.round(canvas.getBoundingClientRect().width));
    const height = Math.max(120, Math.round(canvas.getBoundingClientRect().height));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    const context = canvas.getContext('2d'); context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return {context, width, height};
  }

  function drawAxes(context, width, height) {
    context.strokeStyle = '#203746'; context.lineWidth = 1;
    for (let i = 1; i < 4; i += 1) { const y = 12 + i * (height - 34) / 4; context.beginPath(); context.moveTo(34, y); context.lineTo(width - 12, y); context.stroke(); }
    context.fillStyle = '#91a8b6'; context.font = '11px Segoe UI, sans-serif'; context.fillText('шаг n', width - 48, height - 5);
  }

  function drawTrajectories(canvas) {
    const {context, width, height} = prepareCanvas(canvas); context.clearRect(0, 0, width, height); drawAxes(context, width, height);
    const sequences = [[0.2], [0.200001]];
    for (let n = 1; n < 36; n += 1) sequences.forEach((series) => series.push(4 * series[n - 1] * (1 - series[n - 1])));
    sequences.forEach((series, seriesIndex) => { context.strokeStyle = seriesIndex ? '#ff735d' : '#4da3ff'; context.lineWidth = 2; context.beginPath(); series.forEach((value, index) => { const x = 34 + index / (series.length - 1) * (width - 48); const y = 10 + (1 - value) * (height - 32); index ? context.lineTo(x, y) : context.moveTo(x, y); }); context.stroke(); });
    context.fillStyle = '#4da3ff'; context.fillText('A', 10, 18); context.fillStyle = '#ff735d'; context.fillText('B', 10, 34);
  }

  function drawBranches(canvas) {
    const {context, width, height} = prepareCanvas(canvas); context.clearRect(0, 0, width, height);
    const stages = [1, 2, 4, 8]; const left = 36; const right = width - 24;
    context.strokeStyle = '#42d5d0'; context.lineWidth = 1.6; context.shadowColor = '#42d5d0'; context.shadowBlur = 5;
    stages.forEach((count, stage) => { const x = left + stage / 3 * (right - left); const nextX = left + Math.min(stage + 1, 3) / 3 * (right - left); for (let point = 0; point < count; point += 1) { const y = height / 2 + (point - (count - 1) / 2) * Math.min(15, 74 / count); if (stage < 3) { const nextCount = count * 2; [point * 2, point * 2 + 1].forEach((nextPoint) => { const nextY = height / 2 + (nextPoint - (nextCount - 1) / 2) * Math.min(15, 74 / nextCount); context.beginPath(); context.moveTo(x, y); context.lineTo(nextX, nextY); context.stroke(); }); } context.beginPath(); context.arc(x, y, 2.7, 0, Math.PI * 2); context.fillStyle = '#eef5f7'; context.fill(); } });
    context.shadowBlur = 0; context.fillStyle = '#91a8b6'; context.font = '11px Segoe UI, sans-serif'; stages.forEach((count, stage) => context.fillText(`период ${count}`, left + stage / 3 * (right - left) - 22, height - 7));
  }

  function drawLambda(canvas) {
    const {context, width, height} = prepareCanvas(canvas); context.clearRect(0, 0, width, height);
    const left = 42; const right = width - 32; const y = height * .58; const zero = left + (right - left) * .55; const marker = zero + (right - zero) * .42;
    const gradient = context.createLinearGradient(left, 0, right, 0); gradient.addColorStop(0, '#51d18a'); gradient.addColorStop(.55, '#e8b34f'); gradient.addColorStop(1, '#ff735d'); context.strokeStyle = gradient; context.lineWidth = 8; context.lineCap = 'round'; context.beginPath(); context.moveTo(left, y); context.lineTo(right, y); context.stroke();
    context.strokeStyle = '#eef5f7'; context.lineWidth = 2; context.beginPath(); context.moveTo(marker, y - 22); context.lineTo(marker, y + 17); context.stroke(); context.fillStyle = '#eef5f7'; context.font = '700 18px ui-monospace, monospace'; context.fillText('λ = +0,18', marker - 48, y - 30); context.font = '11px Segoe UI, sans-serif'; context.fillStyle = '#91a8b6'; context.fillText('устойчивость', left, y + 34); context.fillText('0', zero - 3, y + 34); context.fillText('хаос', right - 28, y + 34);
  }

  function drawMandelbrot(canvas) {
    const {context, width, height} = prepareCanvas(canvas); context.clearRect(0, 0, width, height);
    const views = [{cx:-.55,cy:0,scale:2.8,label:'×1'},{cx:-.745,cy:.11,scale:.12,label:'×50'},{cx:-.74364,cy:.13183,scale:.006,label:'×2500'}]; const gap = 8; const panelWidth = (width - gap * 2) / 3;
    views.forEach((view, panel) => { const startX = panel * (panelWidth + gap); const panelPixels = Math.max(1, Math.floor(panelWidth)); const image = context.createImageData(panelPixels, height); for (let py = 0; py < height; py += 1) for (let px = 0; px < panelPixels; px += 1) { const cx = view.cx + (px / panelPixels - .5) * view.scale; const cy = view.cy + (py / height - .5) * view.scale * height / panelPixels; let x = 0; let y = 0; let iteration = 0; while (x*x + y*y <= 4 && iteration < 48) { const nextX = x*x - y*y + cx; y = 2*x*y + cy; x = nextX; iteration += 1; } const offset = (py * panelPixels + px) * 4; const inside = iteration === 48; image.data[offset] = inside ? 5 : 30 + iteration * 3; image.data[offset+1] = inside ? 15 : 110 + iteration * 2; image.data[offset+2] = inside ? 23 : 125 + iteration * 2; image.data[offset+3] = 255; } context.putImageData(image, Math.round(startX), 0); context.fillStyle = '#071018cc'; context.fillRect(startX + 6, 6, 48, 22); context.fillStyle = '#eef5f7'; context.font = '700 11px Segoe UI, sans-serif'; context.fillText(view.label, startX + 14, 21); });
  }

  function drawFeigenbaum(canvas) {
    const {context, width, height} = prepareCanvas(canvas); context.clearRect(0, 0, width, height); const values = [4.64, 4.68, 4.67]; const left = 45; const right = width - 18; const top = 18; const bottom = height - 30;
    context.strokeStyle = '#e8b34f88'; context.setLineDash([5,4]); const referenceY = top + (4.70 - 4.669) / .10 * (bottom - top); context.beginPath(); context.moveTo(left, referenceY); context.lineTo(right, referenceY); context.stroke(); context.setLineDash([]); context.fillStyle = '#e8b34f'; context.font = '11px Segoe UI, sans-serif'; context.fillText('4,669…', 3, referenceY + 4);
    context.strokeStyle = '#42d5d0'; context.fillStyle = '#42d5d0'; context.lineWidth = 2; context.beginPath(); values.forEach((value,index) => { const x = left + index / 2 * (right - left); const y = top + (4.70 - value) / .10 * (bottom - top); index ? context.lineTo(x,y) : context.moveTo(x,y); }); context.stroke(); values.forEach((value,index) => { const x = left + index / 2 * (right - left); const y = top + (4.70 - value) / .10 * (bottom - top); context.beginPath(); context.arc(x,y,4,0,Math.PI*2); context.fill(); context.fillStyle = '#eef5f7'; context.fillText(value.toFixed(2).replace('.',','),x-14,y-10); context.fillStyle = '#42d5d0'; context.fillText(`δ${index+1}`,x-6,height-8); });
  }

  function drawVisual(canvas) {
    const drawers = {trajectories:drawTrajectories, branches:drawBranches, lambda:drawLambda, scales:drawMandelbrot, data:drawFeigenbaum};
    drawers[canvas.dataset.visual]?.(canvas);
  }

  function renderVisual(type) {
    elements.visual.replaceChildren();
    if (!type) return;
    const visual = make('div', 'quiz-visual');
    const canvas = make('canvas', 'quiz-canvas'); canvas.dataset.visual = type; canvas.setAttribute('role','img'); canvas.setAttribute('aria-label', {trajectories:'Схема расхождения двух близких траекторий',branches:'Схема каскада удвоения периода',lambda:'Шкала интерпретации показателя Ляпунова',scales:'Три масштаба множества Мандельброта',data:'Схема сходимости отношений к числу Фейгенбаума'}[type]);
    visual.append(canvas); elements.visual.append(visual); requestAnimationFrame(() => drawVisual(canvas));
  }

  function renderChoice(question) {
    question.options.forEach(([id, text]) => {
      const label = make('label', 'quiz-option');
      const input = document.createElement('input'); input.type = 'radio'; input.name = `question-${currentIndex}`; input.value = id;
      label.append(input, make('span', 'option-marker', '✓'), make('span', 'option-copy', text)); elements.answers.append(label);
    });
  }

  function renderMatching(question) {
    const grid = make('div', 'matching-grid');
    question.matches.forEach(([id, labelText]) => {
      const row = make('div', 'matching-row'); row.dataset.match = id;
      const label = make('label', '', labelText); label.htmlFor = `match-${id}`;
      const select = document.createElement('select'); select.id = `match-${id}`; select.name = id;
      const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Выберите вывод'; select.append(placeholder);
      question.matchOptions.forEach(([value, text]) => { const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option); });
      row.append(label, select); grid.append(row);
    });
    elements.answers.append(grid);
  }

  function captureSelection(question) {
    if (question.type === 'matching') {
      const answer = {}; elements.answers.querySelectorAll('select').forEach((select) => { answer[select.name] = select.value; }); return answer;
    }
    return elements.answers.querySelector('input:checked')?.value || null;
  }

  function restoreSelection(question, selection) {
    if (!selection) return;
    if (question.type === 'matching') elements.answers.querySelectorAll('select').forEach((select) => { select.value = selection[select.name] || ''; });
    else { const input = elements.answers.querySelector(`input[value="${selection}"]`); if (input) input.checked = true; }
  }

  function saveState() {
    try { localStorage.setItem(storageKey, JSON.stringify({version:2, questionCount:questions.length, currentIndex, maxVisited, selections, results, finalVisible})); } catch {}
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || ![1,2].includes(saved.version) || saved.questionCount !== questions.length || !Array.isArray(saved.results) || !Array.isArray(saved.selections)) return;
      const compatibleCount = saved.version === 1 ? 5 : questions.length;
      const highestCompatibleIndex = saved.version === 1 ? 5 : questions.length - 1;
      currentIndex = Math.min(Math.max(Number(saved.currentIndex) || 0, 0), highestCompatibleIndex);
      selections = Array.from({length:questions.length}, (_, index) => index < compatibleCount ? saved.selections[index] || null : null);
      results = Array.from({length:questions.length}, (_, index) => index < compatibleCount ? saved.results[index] || null : null);
      maxVisited = saved.version === 2 ? Math.min(Math.max(Number(saved.maxVisited) || currentIndex, currentIndex), questions.length - 1) : currentIndex;
      score = results.filter((result) => result?.correct).length; finalVisible = Boolean(saved.version === 2 && saved.finalVisible && results.filter(Boolean).length === questions.length);
      if (saved.version === 1) saveState();
    } catch { localStorage.removeItem(storageKey); }
  }

  function updateStatus() {
    const answered = results.filter(Boolean).length;
    elements.statusQuestion.textContent = `${currentIndex + 1} / ${questions.length}`;
    elements.progress.setAttribute('aria-valuenow', String(answered));
    elements.progressFill.style.width = `${Math.round(answered / questions.length * 100)}%`;
    elements.progressCopy.textContent = `Проверено ${answered} из ${questions.length} заданий`;
    elements.liveScore.textContent = String(score); elements.route.replaceChildren();
    questions.forEach((question, index) => {
      const step = make('span', 'route-step'); const result = results[index];
      if (result) step.classList.add(result.correct ? 'correct' : 'wrong'); else if (index === currentIndex) step.classList.add('current');
      step.title = `${index + 1}. ${question.topic}`; elements.route.append(step);
    });
  }

  function renderQuestion() {
    const question = questions[currentIndex]; locked = false;
    elements.counter.textContent = `Вопрос ${currentIndex + 1} из ${questions.length}`; elements.topic.textContent = question.topic; elements.format.textContent = question.format; elements.title.textContent = question.title; elements.prompt.textContent = question.prompt;
    elements.answers.replaceChildren(); elements.feedback.replaceChildren(); elements.feedback.hidden = true; elements.feedback.className = 'quiz-feedback'; elements.hint.hidden = true; elements.check.disabled = true; elements.check.hidden = false; elements.next.hidden = true;
    elements.previous.hidden = currentIndex === 0;
    elements.next.textContent = currentIndex === questions.length - 1 ? 'Показать результат' : 'Следующий вопрос';
    renderVisual(question.visual); question.type === 'matching' ? renderMatching(question) : renderChoice(question); restoreSelection(question, selections[currentIndex]);
    const savedResult = results[currentIndex];
    if (savedResult) { locked = true; showAnswerState(question, savedResult); showFeedback(question, savedResult); elements.check.hidden = true; elements.next.hidden = false; }
    else { elements.check.disabled = !hasCompleteAnswer(question); elements.next.hidden = currentIndex >= maxVisited; }
    updateStatus();
  }

  function hasCompleteAnswer(question) {
    return question.type === 'matching' ? [...elements.answers.querySelectorAll('select')].every((select) => select.value) : Boolean(elements.answers.querySelector('input:checked'));
  }

  function evaluate(question) {
    if (question.type === 'matching') {
      const answer = {}; elements.answers.querySelectorAll('select').forEach((select) => { answer[select.name] = select.value; });
      return {correct: question.matches.every(([id,,expected]) => answer[id] === expected), answer};
    }
    const checked = elements.answers.querySelector('input:checked'); return {correct: checked.value === question.correct, answer: checked.value};
  }

  function showAnswerState(question, result) {
    if (question.type === 'matching') {
      question.matches.forEach(([id,,expected]) => {
        const row = elements.answers.querySelector(`[data-match="${id}"]`); const select = row.querySelector('select'); const isCorrect = result.answer[id] === expected;
        select.disabled = true; row.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
        if (!isCorrect) { const expectedText = question.matchOptions.find(([value]) => value === expected)[1]; row.append(make('small', 'matching-correction', `Верное сопоставление: ${expectedText}`)); }
      });
      return;
    }
    elements.answers.querySelectorAll('.quiz-option').forEach((label) => { const input = label.querySelector('input'); input.disabled = true; label.classList.add('is-locked'); if (input.value === question.correct) label.classList.add('is-correct'); if (input.checked && !result.correct) label.classList.add('is-wrong'); });
  }

  function showFeedback(question, result) {
    elements.feedback.classList.add(result.correct ? 'correct' : 'wrong');
    elements.feedback.append(make('strong', '', result.correct ? 'Верно' : 'Пока не совсем'), make('p', '', question.explanation));
    if (!result.correct) { const link = make('a', 'quiz-review-link', question.review[0]); link.href = question.review[1]; elements.feedback.append(link); }
    elements.feedback.hidden = false;
  }

  function checkAnswer(event) {
    event.preventDefault(); if (locked) return; const question = questions[currentIndex];
    if (!hasCompleteAnswer(question)) { elements.hint.hidden = false; return; }
    locked = true; const result = evaluate(question); if (result.correct) score += 1;
    selections[currentIndex] = result.answer; results[currentIndex] = {correct:result.correct, topic:question.topic, review:question.review, answer:result.answer}; showAnswerState(question, result); showFeedback(question, result);
    elements.check.hidden = true; elements.next.hidden = false; updateStatus(); saveState(); requestAnimationFrame(() => elements.feedback.scrollIntoView({behavior:'smooth', block:'center'}));
  }

  function getAssessment(percent) {
    if (percent === 100) return ['Отличное понимание', 'Вы уверенно связываете модели, численные признаки и общие идеи теории хаоса. Все разделы лаборатории освоены.'];
    if (percent >= 75) return ['Уверенное понимание', 'Основные связи выстроены верно. Короткое повторение отмеченных тем поможет сделать картину ещё точнее.'];
    if (percent >= 50) return ['Хорошая основа', 'Вы понимаете центральные идеи, но некоторые переходы от наблюдения к научному выводу стоит ещё раз проверить в лабораториях.'];
    return ['Есть куда исследовать дальше', 'Начало положено. Повторите отмеченные эксперименты и обращайте внимание на то, как графики подтверждают научные выводы.'];
  }

  function getProfessorReaction(correctAnswers, missedResults) {
    let message;
    if (correctAnswers === 8) message = 'Блестяще! Вот это я называю настоящим исследовательским мышлением. Хаос показал свои лучшие трюки, а вы всё равно разобрались в его закономерностях — поздравляю, коллега!';
    else if (correctAnswers >= 6) message = 'Очень хорошо! Профессорская кафедра одобрительно скрипнула. Правда, несколько закономерностей всё ещё пытались от вас спрятаться — хитрые, но уже почти пойманные.';
    else if (correctAnswers >= 4) message = 'Хм-м, основы поняты — это радует. Но я всё же доброжелательно поворчу: систему стоит исследовать внимательнее, особенно там, где похожие графики приводят к разным выводам.';
    else message = 'Строго поправляю очки: хаос пока победил исследователя. Но без паники — даже профессора возвращаются к эксперименту, меняют параметры и пробуют снова.';
    const topics = [...new Set(missedResults.map((result) => result.topic))].slice(0, 2);
    if (topics.length) message += ` Особенно советую ещё раз заглянуть в раздел${topics.length > 1 ? 'ы' : ''} ${topics.map((topic) => `«${topic}»`).join(' и ')}.`;
    return message;
  }

  function hydrateProfessor(event) {
    const characters = event?.detail?.characters || window.ASSISTANT_CHARACTERS;
    const professor = characters?.lambda;
    if (!professor) return;
    const base = event?.detail?.base ?? '../';
    elements.professorAvatar.src = `${base}assets/characters/${professor.image}`;
    elements.professorAvatar.alt = professor.name;
    elements.professorName.textContent = `${professor.name} · ${professor.symbol}`;
  }

  function showResults() {
    const percent = Math.round(score / questions.length * 100); const [grade, message] = getAssessment(percent);
    finalVisible = true; elements.area.hidden = true; elements.result.hidden = false; elements.resultScore.textContent = `${score} / ${questions.length}`; elements.resultPercent.textContent = `${percent}%`; elements.resultGrade.textContent = grade; elements.resultMessage.textContent = message; elements.reviewList.replaceChildren();
    const missed = results.filter((result) => result && !result.correct);
    if (!missed.length) { elements.reviewTitle.textContent = 'Все темы освоены'; elements.reviewList.append(make('p', 'review-success', 'Ошибок нет. Можно вернуться к лабораториям и продолжить самостоятельные эксперименты с параметрами.')); }
    else { elements.reviewTitle.textContent = 'Темы, в которых были ошибки'; missed.forEach((result) => { const item = make('div', 'review-item'); const link = make('a', '', 'Повторить →'); link.href = result.review[1]; item.append(make('span', '', result.topic), link); elements.reviewList.append(item); }); }
    elements.professorMessage.textContent = getProfessorReaction(score, missed);
    saveState(); elements.result.scrollIntoView({behavior:'smooth', block:'start'}); elements.restart.focus({preventScroll:true});
  }

  function previousQuestion() { if (currentIndex === 0) return; if (!locked) selections[currentIndex] = captureSelection(questions[currentIndex]); currentIndex -= 1; saveState(); renderQuestion(); elements.card.scrollIntoView({behavior:'smooth', block:'start'}); }
  function nextQuestion() { if (!locked && currentIndex >= maxVisited) return; if (currentIndex === questions.length - 1) { if (locked) showResults(); return; } currentIndex += 1; maxVisited = Math.max(maxVisited, currentIndex); saveState(); renderQuestion(); elements.card.scrollIntoView({behavior:'smooth', block:'start'}); }
  function resetQuiz(requireConfirmation = false) {
    if (requireConfirmation && !window.confirm('Начать испытание сначала? Все ответы и текущий прогресс будут удалены.')) return;
    localStorage.removeItem(storageKey); currentIndex = 0; maxVisited = 0; score = 0; locked = false; results = []; selections = Array(questions.length).fill(null); finalVisible = false;
    elements.result.hidden = true; elements.area.hidden = false; renderQuestion(); elements.area.scrollIntoView({behavior:'smooth', block:'start'});
  }

  elements.form.addEventListener('change', () => { if (locked) return; elements.hint.hidden = true; selections[currentIndex] = captureSelection(questions[currentIndex]); elements.check.disabled = !hasCompleteAnswer(questions[currentIndex]); saveState(); });
  window.addEventListener('assistant-ready', hydrateProfessor); hydrateProfessor();
  elements.form.addEventListener('submit', checkAnswer); elements.previous.addEventListener('click', previousQuestion); elements.next.addEventListener('click', nextQuestion); elements.reset.addEventListener('click', () => resetQuiz(true)); elements.restart.addEventListener('click', () => resetQuiz(false));
  let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { const canvas = elements.visual.querySelector('.quiz-canvas'); if (canvas) drawVisual(canvas); }, 120); });
  loadState(); if (finalVisible) showResults(); else renderQuestion();
})();
