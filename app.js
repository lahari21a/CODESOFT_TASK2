/**
 * Simple Calculator Application - Main Interactivity & Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // === STATE MANAGEMENT ===
  const state = {
    theme: localStorage.getItem('calc_theme') || 'dark',
    activeTab: 'prompt', // 'prompt' | 'keypad'
    history: JSON.parse(localStorage.getItem('calc_history') || '[]'),
    
    // Keypad mode state
    keypadCurrent: '0',
    keypadPrevious: '',
    keypadOperation: null,
    keypadResetNext: false
  };

  // === DOM ELEMENTS ===
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = themeToggleBtn.querySelector('.theme-icon');
  
  const tabPromptBtn = document.getElementById('tab-prompt-mode');
  const tabKeypadBtn = document.getElementById('tab-keypad-mode');
  const panelPrompt = document.getElementById('panel-prompt');
  const panelKeypad = document.getElementById('panel-keypad');

  // Prompt Form elements
  const calculatorForm = document.getElementById('calculator-form');
  const num1Input = document.getElementById('num1-input');
  const num2Input = document.getElementById('num2-input');
  const opSelect = document.getElementById('op-select');
  const btnCalculatePrompt = document.getElementById('btn-calculate-prompt');
  const btnResetPrompt = document.getElementById('btn-reset-prompt');
  const promptResultBox = document.getElementById('prompt-result-box');
  const promptExpression = document.getElementById('prompt-expression');
  const promptValue = document.getElementById('prompt-value');
  const promptBreakdown = document.getElementById('prompt-breakdown');
  const btnCopyResult = document.getElementById('btn-copy-result');

  // Keypad Screen elements
  const keypadHistoryScreen = document.getElementById('keypad-history');
  const keypadCurrentScreen = document.getElementById('keypad-current');
  const keypadGrid = document.querySelector('.keypad-grid');

  // History Sidebar elements
  const historyListEl = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // === THEME MANAGEMENT ===
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('calc_theme', theme);
  }
  applyTheme(state.theme);

  themeToggleBtn.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  // === TAB SWITCHING ===
  function switchTab(tabName) {
    state.activeTab = tabName;
    if (tabName === 'prompt') {
      tabPromptBtn.classList.add('active');
      tabPromptBtn.setAttribute('aria-selected', 'true');
      tabKeypadBtn.classList.remove('active');
      tabKeypadBtn.setAttribute('aria-selected', 'false');

      panelPrompt.classList.remove('hidden');
      panelPrompt.classList.add('active');
      panelKeypad.classList.add('hidden');
      panelKeypad.classList.remove('active');
    } else {
      tabKeypadBtn.classList.add('active');
      tabKeypadBtn.setAttribute('aria-selected', 'true');
      tabPromptBtn.classList.remove('active');
      tabPromptBtn.setAttribute('aria-selected', 'false');

      panelKeypad.classList.remove('hidden');
      panelKeypad.classList.add('active');
      panelPrompt.classList.add('hidden');
      panelPrompt.classList.remove('active');
    }
  }

  tabPromptBtn.addEventListener('click', () => switchTab('prompt'));
  tabKeypadBtn.addEventListener('click', () => switchTab('keypad'));

  // === HELPER FUNCTIONS ===
  function formatNumber(num) {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return 'Infinity';
    // Remove extra float precision issues (e.g., 0.1 + 0.2 = 0.30000000000000004)
    const rounded = Number(Math.round(num + 'e12') + 'e-12');
    return rounded.toLocaleString('en-US', { maximumFractionDigits: 8 });
  }

  function parseFormattedNumber(val) {
    return parseFloat(val);
  }

  // === CALCULATION CORE ===
  function calculate(a, b, op) {
    switch (op) {
      case 'add':
      case '+':
        return { result: a + b, symbol: '+', name: 'Addition', breakdown: `${a} added to ${b}` };
      case 'subtract':
      case '-':
        return { result: a - b, symbol: '-', name: 'Subtraction', breakdown: `${a} minus ${b}` };
      case 'multiply':
      case '*':
        return { result: a * b, symbol: '×', name: 'Multiplication', breakdown: `${a} multiplied by ${b}` };
      case 'divide':
      case '/':
        if (b === 0) throw new Error('Division by zero is undefined.');
        return { result: a / b, symbol: '÷', name: 'Division', breakdown: `${a} divided by ${b}` };
      case 'modulus':
      case '%':
        if (b === 0) throw new Error('Modulus by zero is undefined.');
        return { result: a % b, symbol: '%', name: 'Modulus', breakdown: `Remainder of ${a} ÷ ${b}` };
      case 'power':
      case '^':
        return { result: Math.pow(a, b), symbol: '^', name: 'Exponentiation', breakdown: `${a} raised to the power of ${b}` };
      default:
        throw new Error('Unsupported operation.');
    }
  }

  // === HISTORY LOGGING ===
  function renderHistory() {
    if (state.history.length === 0) {
      historyListEl.innerHTML = '<div class="empty-history">No calculations performed yet.</div>';
      return;
    }

    historyListEl.innerHTML = state.history.slice().reverse().map(item => `
      <div class="history-item" data-expr="${item.expression}" data-val="${item.result}">
        <span class="history-expr">${item.expression}</span>
        <span class="history-val">${item.result}</span>
      </div>
    `).join('');

    // Attach click to reuse history result
    document.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const val = el.getAttribute('data-val');
        if (state.activeTab === 'prompt') {
          num1Input.value = val;
        } else {
          state.keypadCurrent = val;
          updateKeypadDisplay();
        }
      });
    });
  }

  function addHistoryEntry(expression, result) {
    state.history.push({ expression, result, timestamp: Date.now() });
    if (state.history.length > 20) state.history.shift(); // keep max 20
    localStorage.setItem('calc_history', JSON.stringify(state.history));
    renderHistory();
  }

  btnClearHistory.addEventListener('click', () => {
    state.history = [];
    localStorage.removeItem('calc_history');
    renderHistory();
  });
  renderHistory();

  // === PROMPT MODE HANDLER ===
  calculatorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val1Str = num1Input.value.trim();
    const val2Str = num2Input.value.trim();

    if (val1Str === '' || val2Str === '') return;

    const n1 = parseFloat(val1Str);
    const n2 = parseFloat(val2Str);
    const op = opSelect.value;

    promptResultBox.classList.remove('hidden', 'error-box');

    try {
      const calcRes = calculate(n1, n2, op);
      const formattedRes = formatNumber(calcRes.result);
      
      promptExpression.textContent = `${n1} ${calcRes.symbol} ${n2} =`;
      promptValue.textContent = formattedRes;
      promptBreakdown.textContent = `Step: ${calcRes.breakdown} equals ${formattedRes}.`;

      addHistoryEntry(`${n1} ${calcRes.symbol} ${n2}`, formattedRes);
    } catch (err) {
      promptResultBox.classList.add('error-box');
      promptExpression.textContent = `Calculation Error`;
      promptValue.textContent = err.message;
      promptBreakdown.textContent = `Please correct your inputs and try again.`;
    }
  });

  btnResetPrompt.addEventListener('click', () => {
    num1Input.value = '';
    num2Input.value = '';
    opSelect.selectedIndex = 0;
    promptResultBox.classList.add('hidden');
    num1Input.focus();
  });

  btnCopyResult.addEventListener('click', () => {
    const textToCopy = promptValue.textContent;
    if (!textToCopy || textToCopy.includes('Error')) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = btnCopyResult.textContent;
      btnCopyResult.textContent = '✓ Copied!';
      setTimeout(() => { btnCopyResult.textContent = originalText; }, 1500);
    });
  });

  // === KEYPAD MODE HANDLER ===
  function updateKeypadDisplay() {
    keypadCurrentScreen.textContent = state.keypadCurrent;
    if (state.keypadPrevious !== '' && state.keypadOperation) {
      keypadHistoryScreen.textContent = `${state.keypadPrevious} ${state.keypadOperation}`;
    } else {
      keypadHistoryScreen.textContent = '';
    }
  }

  function handleKeypadInput(value) {
    if (state.keypadResetNext) {
      state.keypadCurrent = '';
      state.keypadResetNext = false;
    }

    if (value === '.') {
      if (state.keypadCurrent.includes('.')) return;
      if (state.keypadCurrent === '') state.keypadCurrent = '0';
    }

    if (state.keypadCurrent === '0' && value !== '.') {
      state.keypadCurrent = value;
    } else {
      state.keypadCurrent += value;
    }
    updateKeypadDisplay();
  }

  function handleKeypadOperation(op) {
    if (state.keypadCurrent === '' && state.keypadPrevious === '') return;

    if (state.keypadPrevious !== '' && state.keypadOperation && !state.keypadResetNext) {
      executeKeypadCalculation();
    }

    state.keypadPrevious = state.keypadCurrent;
    state.keypadOperation = op;
    state.keypadResetNext = true;
    updateKeypadDisplay();
  }

  function executeKeypadCalculation() {
    if (!state.keypadPrevious || !state.keypadOperation || !state.keypadCurrent) return;

    const a = parseFloat(state.keypadPrevious);
    const b = parseFloat(state.keypadCurrent);
    const op = state.keypadOperation;

    try {
      const calcRes = calculate(a, b, op);
      const formattedRes = formatNumber(calcRes.result);
      
      addHistoryEntry(`${a} ${calcRes.symbol} ${b}`, formattedRes);

      state.keypadCurrent = formattedRes;
      state.keypadPrevious = '';
      state.keypadOperation = null;
      state.keypadResetNext = true;
    } catch (err) {
      state.keypadCurrent = 'Error';
      state.keypadPrevious = '';
      state.keypadOperation = null;
      state.keypadResetNext = true;
    }
    updateKeypadDisplay();
  }

  function clearKeypad() {
    state.keypadCurrent = '0';
    state.keypadPrevious = '';
    state.keypadOperation = null;
    state.keypadResetNext = false;
    updateKeypadDisplay();
  }

  function deleteKeypadChar() {
    if (state.keypadCurrent === 'Error' || state.keypadResetNext) {
      clearKeypad();
      return;
    }
    if (state.keypadCurrent.length <= 1) {
      state.keypadCurrent = '0';
    } else {
      state.keypadCurrent = state.keypadCurrent.slice(0, -1);
    }
    updateKeypadDisplay();
  }

  function handleKeypadAction(action) {
    switch (action) {
      case 'clear':
        clearKeypad();
        break;
      case 'delete':
        deleteKeypadChar();
        break;
      case 'percent':
        const val = parseFloat(state.keypadCurrent);
        if (!isNaN(val)) {
          state.keypadCurrent = formatNumber(val / 100);
          updateKeypadDisplay();
        }
        break;
      case 'calculate':
        executeKeypadCalculation();
        break;
    }
  }

  keypadGrid.addEventListener('click', (e) => {
    const target = e.target.closest('.key');
    if (!target) return;

    const numVal = target.getAttribute('data-val');
    const opVal = target.getAttribute('data-op');
    const actionVal = target.getAttribute('data-action');

    if (numVal !== null) handleKeypadInput(numVal);
    else if (opVal !== null) handleKeypadOperation(opVal);
    else if (actionVal !== null) handleKeypadAction(actionVal);
  });

  // === KEYBOARD EVENT BINDINGS ===
  document.addEventListener('keydown', (e) => {
    // Only capture keyboard shortcuts when in Keypad Mode or if focused outside input fields
    if (document.activeElement.tagName === 'INPUT' && state.activeTab === 'prompt') return;

    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
      switchTab('keypad');
      handleKeypadInput(e.key);
    } else if (['+', '-', '*', '/', '%', '^'].includes(e.key)) {
      switchTab('keypad');
      handleKeypadOperation(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
      if (state.activeTab === 'keypad') {
        e.preventDefault();
        executeKeypadCalculation();
      }
    } else if (e.key === 'Backspace') {
      if (state.activeTab === 'keypad') {
        e.preventDefault();
        deleteKeypadChar();
      }
    } else if (e.key === 'Escape') {
      if (state.activeTab === 'keypad') {
        clearKeypad();
      }
    }
  });
});
