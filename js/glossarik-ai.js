(() => {
  'use strict';

  const character = window.ASSISTANT_CHARACTERS?.glossarik;
  if (!character || document.querySelector('#glossarik-ai-panel')) return;

  const base = location.pathname.replace(/\\/g, '/').includes('/pages/') ? '../' : '';
  const storageKey = 'chaos-lab-glossarik-ai-open';
  const historyKey = 'chaos-lab-glossarik-ai-history';
  const historyLimit = 30;
  const pageContext = window.getGlossarikContext?.() || window.GLOSSARIK_CONTEXTS?.home;
  const quickQuestions = {
    'Что здесь происходит?': 'overview',
    'Объясни проще': 'simple',
    'Что мне изучить дальше?': 'next'
  };
  const mockReply = 'Пока я только учусь отвечать. Скоро здесь появится настоящий ИИ-помощник.';

  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const launcher = make('button', 'glossarik-ai-launcher');
  launcher.id = 'glossarik-ai-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-controls', 'glossarik-ai-panel');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-label', 'Открыть чат с Глоссариком');
  const launcherImage = make('img', 'glossarik-ai-launcher-image');
  launcherImage.src = `${base}assets/characters/${character.image}`;
  launcherImage.alt = '';
  const launcherMark = make('span', 'glossarik-ai-launcher-mark', '···');
  launcher.setAttribute('title', 'Спросить Глоссарика');
  launcher.append(launcherImage, launcherMark);

  const panel = make('aside', 'glossarik-ai-panel');
  panel.id = 'glossarik-ai-panel';
  panel.setAttribute('aria-label', 'Чат с Глоссариком');
  panel.setAttribute('aria-hidden', 'true');

  const header = make('header', 'glossarik-ai-header');
  const portrait = make('div', 'glossarik-ai-portrait');
  const portraitImage = make('img');
  portraitImage.src = `${base}assets/characters/${character.image}`;
  portraitImage.alt = character.name;
  portrait.append(portraitImage);
  const identity = make('div', 'glossarik-ai-identity');
  identity.append(make('strong', '', character.name), make('span', '', 'Умный помощник лаборатории'));
  const status = make('small', 'glossarik-ai-status');
  status.append(make('i'), document.createTextNode('Готов помочь'));
  identity.append(status);
  const close = make('button', 'glossarik-ai-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Закрыть чат');
  header.append(portrait, identity, close);

  const conversation = make('div', 'glossarik-ai-conversation');
  conversation.setAttribute('aria-live', 'polite');
  conversation.setAttribute('aria-relevant', 'additions');
  const messages = make('div', 'glossarik-ai-messages');
  conversation.append(messages);

  const loadHistory = () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(historyKey) || '[]');
      if (!Array.isArray(stored)) return [];
      return stored.filter((item) => (
        item
        && (item.role === 'user' || item.role === 'assistant')
        && typeof item.text === 'string'
        && item.text.trim()
      )).slice(-historyLimit).map((item) => ({
        role: item.role,
        text: item.text,
        ...(typeof item.pageId === 'string' ? { pageId: item.pageId } : {})
      }));
    } catch {
      return [];
    }
  };

  let chatHistory = loadHistory();

  const saveHistory = () => {
    try { sessionStorage.setItem(historyKey, JSON.stringify(chatHistory)); } catch {}
  };

  const addMessage = (role, text, { persist = true, scroll = true, pageId = pageContext?.pageId } = {}) => {
    const message = make('div', `glossarik-ai-message is-${role}`);
    const label = make('span', 'glossarik-ai-message-author', role === 'assistant' ? character.name : 'Вы');
    message.append(label, make('p', '', text));
    messages.append(message);
    if (persist) {
      chatHistory.push({ role, text, ...(pageId ? { pageId } : {}) });
      chatHistory = chatHistory.slice(-historyLimit);
      while (messages.children.length > historyLimit) messages.firstElementChild?.remove();
      saveHistory();
    }
    if (scroll) requestAnimationFrame(() => conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' }));
  };

  if (chatHistory.length) {
    chatHistory.forEach((item) => addMessage(item.role, item.text, { persist: false, scroll: false, pageId: item.pageId }));
    requestAnimationFrame(() => conversation.scrollTo({ top: conversation.scrollHeight }));
  } else {
    addMessage('assistant', 'Привет! Я Глоссарик. Спроси меня о теории хаоса, формуле, графике или эксперименте — попробуем разобраться вместе.');
  }

  const quickArea = make('div', 'glossarik-ai-quick');
  const quickLabel = make('span', 'glossarik-ai-quick-label', 'Быстрый вопрос');
  const quickButtons = make('div', 'glossarik-ai-quick-buttons');
  Object.keys(quickQuestions).forEach((text) => {
    const button = make('button', '', text);
    button.type = 'button';
    button.addEventListener('click', () => sendMessage(text));
    quickButtons.append(button);
  });
  quickArea.append(quickLabel, quickButtons);

  const composer = make('form', 'glossarik-ai-composer');
  const input = make('textarea', 'glossarik-ai-input');
  input.rows = 1;
  input.maxLength = 600;
  input.placeholder = 'Спроси Глоссарика...';
  input.setAttribute('aria-label', 'Сообщение Глоссарику');
  const submit = make('button', 'glossarik-ai-send', 'Отправить');
  submit.type = 'submit';
  submit.disabled = true;
  composer.append(input, submit);

  panel.append(header, conversation, quickArea, composer);
  document.body.append(panel, launcher);

  let open = false;
  let pendingReplies = 0;

  const saveOpenState = () => {
    try { localStorage.setItem(storageKey, open ? 'open' : 'closed'); } catch {}
  };

  const setOpen = (nextOpen, focusInput = false) => {
    open = Boolean(nextOpen);
    panel.classList.toggle('is-open', open);
    launcher.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Закрыть чат с Глоссариком' : 'Открыть чат с Глоссариком');
    saveOpenState();
    if (open && focusInput) setTimeout(() => input.focus(), 240);
  };

  const AI_ENDPOINT = 'https://glossarik-ai.elena2englishonline.workers.dev/';

const requestGlossarikReply = async (message) => {
  // Три быстрых вопроса по-прежнему отвечают локально
  // и не расходуют лимит нейросети.
  const quickAnswerKey = quickQuestions[message];
  const localReply = quickAnswerKey && pageContext?.quickAnswers?.[quickAnswerKey];

  if (localReply) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return localReply;
  }

  try {
    const mode = pageContext?.pageId === 'quiz' ? 'quiz-tutor' : 'standard';

    // Текущее сообщение уже добавлено в chatHistory,
    // поэтому его не отправляем второй раз.
    const recentHistory = chatHistory
      .slice(0, -1)
      .slice(-8)
      .map((item) => ({
        role: item.role,
        text: item.text
      }));

    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        mode,
        pageContext: {
          pageId: pageContext?.pageId || '',
          title: pageContext?.title || '',
          topic: pageContext?.topic || '',
          learning: pageContext?.learning || '',
          keyConcepts: pageContext?.keyConcepts || [],
          interactive: pageContext?.interactive || ''
        },
        history: recentHistory
      })
    });

    const data = await response.json();

    if (!response.ok || !data.answer) {
      throw new Error(data.error || 'ИИ не вернул ответ.');
    }

    return data.answer;
  } catch (error) {
    console.error('Glossarik AI error:', error);

    return 'Кажется, связь с моим ИИ-мозгом на минутку потерялась. Попробуй отправить вопрос ещё раз.';
  }
};

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text) return;
    addMessage('user', text);
    input.value = '';
    submit.disabled = true;
    pendingReplies += 1;
    status.lastChild.textContent = 'Формулирует ответ…';
    const reply = await requestGlossarikReply(text);
    addMessage('assistant', reply);
    pendingReplies -= 1;
    if (pendingReplies === 0) status.lastChild.textContent = 'Готов помочь';
  }

  launcher.addEventListener('click', () => setOpen(!open, !open));
  close.addEventListener('click', () => {
    setOpen(false);
    launcher.focus();
  });
  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener('input', () => {
    submit.disabled = !input.value.trim();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input.value);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      launcher.focus();
    }
  });

  let savedOpen = false;
  try { savedOpen = localStorage.getItem(storageKey) === 'open'; } catch {}
  setOpen(savedOpen, false);
})();
