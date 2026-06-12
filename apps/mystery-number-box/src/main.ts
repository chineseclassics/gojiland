import './styles.css';

type Language = 'zh' | 'en';

interface Profile {
  totalScore: number;
  badges: string[];
  loginStreak: number;
  winStreak: number;
  quickWinStreak: number;
  lastLoginDate?: string;
}

interface BadgeContext {
  guessCount: number;
  totalScore: number;
  isPrimeSecret: boolean;
  isPerfectSquare: boolean;
  isMultiple10: boolean;
  loginStreak: number;
  winStreak: number;
  quickWinStreak: number;
}

interface HintState {
  mainKey: string;
  status: string;
  secondaryKey: string;
  params: Record<string, string | number>;
  warmerColderKey: string;
}

const translations = {
  title: { zh: '神秘數字盒', en: 'Mystery Number Box' },
  prompt: { zh: '我從 1 到 100 選了一個數字，你猜得到嗎？', en: 'I picked a number from 1 to 100. Can you guess it?' },
  inputPlaceholder: { zh: '輸入你的猜測…', en: 'Enter your guess…' },
  guessButton: { zh: '猜猜看！', en: 'Guess!' },
  scoreLabel: { zh: '總分', en: 'Score' },
  attemptsLabel: { zh: '已猜次數', en: 'Attempts' },
  levelLabel: { zh: '等級', en: 'Level' },
  restartButton: { zh: '繼續挑戰', en: 'Continue' },
  factsShow: { zh: '顯示小知識', en: 'Show facts' },
  factsHide: { zh: '隱藏小知識', en: 'Hide facts' },
  invalidInput: { zh: '請輸入 1 到 100 之間的數字！', en: 'Please enter a number between 1 and 100!' },
  tooHigh: { zh: '太大了！', en: 'Too high!' },
  tooLow: { zh: '太小了！', en: 'Too low!' },
  gettingWarmer: { zh: ' 越來越熱了！', en: ' Getting warmer!' },
  gettingColder: { zh: ' 有點冷掉了…', en: ' Getting colder…' },
  correct: { zh: '答對了！就是 {secretNumber}！', en: 'Correct! The number is {secretNumber}!' },
  winJackpot: { zh: '一次就猜中！獲得 {points} 分！', en: 'First try! You get {points} points!' },
  winBonus: { zh: '只用了 {guessCount} 次，獲得 {points} 分！', en: 'Solved in {guessCount} tries for {points} points!' },
  winNoBonus: { zh: '你總共猜了 {guessCount} 次，成功找到了！', en: 'You found it in {guessCount} tries!' },
  hintOdd: { zh: '提示：神秘數字是奇數。', en: 'Hint: The mystery number is odd.' },
  hintEven: { zh: '提示：神秘數字是偶數。', en: 'Hint: The mystery number is even.' },
  hintMultiple10: { zh: '提示：它是 10 的倍數。', en: 'Hint: It is a multiple of 10.' },
  hintMultiple5: { zh: '提示：它可以被 5 整除。', en: 'Hint: It is divisible by 5.' },
  hintPrime: { zh: '提示：它是一個質數！', en: 'Hint: It is a prime number!' },
  hintSumOfDigits: { zh: '提示：各位數加起來是 {sum}。', en: 'Hint: Its digits add up to {sum}.' },
  hintPerfectSquare: { zh: '提示：它是一個平方數。', en: 'Hint: It is a perfect square.' },
  hintTensDigit: { zh: '提示：它的十位數是 {digit}。', en: 'Hint: Its tens digit is {digit}.' },
  factsTitle: { zh: '關於 {secretNumber} 的小知識', en: 'Fun facts about {secretNumber}' },
  factOdd: { zh: '它是一個奇數。', en: 'It is an odd number.' },
  factEven: { zh: '它是一個偶數。', en: 'It is an even number.' },
  factPrime: { zh: '它是一個質數。', en: 'It is a prime number.' },
  factPerfectSquare: { zh: '它是 {sqrt} 的平方。', en: 'It is the square of {sqrt}.' },
  factMultiple3: { zh: '它是 3 的倍數。', en: 'It is a multiple of 3.' },
  factMultiple5: { zh: '它是 5 的倍數。', en: 'It is a multiple of 5.' },
  factSumOfDigits: { zh: '它的各位數總和是 {sum}。', en: 'Its digits add up to {sum}.' }
} as const;

const levels = [
  { name: { zh: '見習探險家', en: 'Novice Explorer' }, min: 0, max: 49 },
  { name: { zh: '數字學徒', en: 'Number Apprentice' }, min: 50, max: 99 },
  { name: { zh: '邏輯小能手', en: 'Logic Adept' }, min: 100, max: 199 },
  { name: { zh: '智慧行者', en: 'Wise Walker' }, min: 200, max: 349 },
  { name: { zh: '心算達人', en: 'Mind Master' }, min: 350, max: 549 },
  { name: { zh: '謎題大師', en: 'Puzzle Maestro' }, min: 550, max: 799 },
  { name: { zh: '數字王者', en: 'Number Champion' }, min: 800, max: 1199 },
  { name: { zh: '猜數宗師', en: 'Grand Guesser' }, min: 1200, max: Number.POSITIVE_INFINITY }
] as const;

const badgeCatalog = [
  { id: 'first-try', icon: '★', rule: (ctx: BadgeContext) => ctx.guessCount === 1, name: { zh: '神來一筆', en: 'First Shot' } },
  { id: 'under-3', icon: '⚡', rule: (ctx: BadgeContext) => ctx.guessCount > 0 && ctx.guessCount <= 3, name: { zh: '電光火石', en: 'Lightning Fast' } },
  { id: 'over-10', icon: '◇', rule: (ctx: BadgeContext) => ctx.guessCount >= 10, name: { zh: '耐心挑戰', en: 'Patient Solver' } },
  { id: 'is-prime', icon: '◆', rule: (ctx: BadgeContext) => ctx.isPrimeSecret, name: { zh: '質數獵人', en: 'Prime Hunter' } },
  { id: 'perfect-square', icon: '■', rule: (ctx: BadgeContext) => ctx.isPerfectSquare, name: { zh: '平方觀察家', en: 'Square Spotter' } },
  { id: 'multiple-10', icon: '10', rule: (ctx: BadgeContext) => ctx.isMultiple10, name: { zh: '整十妙手', en: 'Deca Master' } },
  { id: 'score-200', icon: '◎', rule: (ctx: BadgeContext) => ctx.totalScore >= 200, name: { zh: '百步穿楊', en: 'Sharpshooter' } },
  { id: 'score-500', icon: '✦', rule: (ctx: BadgeContext) => ctx.totalScore >= 500, name: { zh: '寶石獵人', en: 'Gem Hunter' } },
  { id: 'score-1000', icon: '♛', rule: (ctx: BadgeContext) => ctx.totalScore >= 1000, name: { zh: '王者加冕', en: 'Crowned' } },
  { id: 'win-3', icon: '3', rule: (ctx: BadgeContext) => ctx.winStreak >= 3, name: { zh: '連勝三局', en: 'Win Streak x3' } },
  { id: 'win-5', icon: '5', rule: (ctx: BadgeContext) => ctx.winStreak >= 5, name: { zh: '連勝五局', en: 'Win Streak x5' } },
  { id: 'quick-3', icon: '↟', rule: (ctx: BadgeContext) => ctx.quickWinStreak >= 3, name: { zh: '三連速勝', en: 'Triple Quick Win' } },
  { id: 'daily-3', icon: '3d', rule: (ctx: BadgeContext) => ctx.loginStreak >= 3, name: { zh: '連登三日', en: 'Daily x3' } },
  { id: 'daily-7', icon: '7d', rule: (ctx: BadgeContext) => ctx.loginStreak >= 7, name: { zh: '連登七日', en: 'Daily x7' } },
  { id: 'daily-14', icon: '14', rule: (ctx: BadgeContext) => ctx.loginStreak >= 14, name: { zh: '連登十四日', en: 'Daily x14' } }
] as const;

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Missing #app root');

root.innerHTML = `
  <main class="game-page">
    <a class="gojiland-link" href="https://gojiland-platform.gnoluy.workers.dev" aria-label="Back to GojiLand">
      <span aria-hidden="true"></span>
      GojiLand
    </a>

    <section id="game-card" class="game-card">
      <div class="language-switch" aria-label="Language">
        <button id="lang-zh" type="button" class="active">中文</button>
        <button id="lang-en" type="button">EN</button>
      </div>

      <header class="game-header">
        <h1 data-i18n="title"></h1>
        <p data-i18n="prompt"></p>
      </header>

      <div class="mystery-stage">
        <span class="stage-star star-left" aria-hidden="true">✦</span>
        <div id="mystery-box" class="mystery-box bouncing">
          <span id="mystery-text">?</span>
        </div>
        <span class="stage-star star-right" aria-hidden="true">✦</span>
      </div>

      <div id="interaction-area" class="interaction-area">
        <input id="guess-input" type="number" inputmode="numeric" min="1" max="100" data-i18n-placeholder="inputPlaceholder" />
        <button id="guess-button" class="guess-button" type="button" data-i18n="guessButton"></button>
      </div>

      <div id="hint-container" class="hint-container" aria-live="polite">
        <p id="main-hint"></p>
        <p id="secondary-hint"></p>
      </div>

      <div id="range-container" class="range-container" aria-label="Possible number range">
        <div id="range-bar" class="range-bar">
          <span id="range-min">1</span>
          <span id="range-max">100</span>
        </div>
      </div>

      <dl class="game-stats">
        <div><dt data-i18n="scoreLabel"></dt><dd id="score-display">0</dd></div>
        <div><dt data-i18n="attemptsLabel"></dt><dd id="guess-count">0</dd></div>
        <div><dt data-i18n="levelLabel"></dt><dd id="level-name">—</dd></div>
      </dl>

      <div id="level-progress-container" class="level-progress">
        <div><span id="level-progress-bar"></span></div>
        <p id="level-progress-text">0 / 50</p>
      </div>

      <div id="badge-area" class="badge-area">
        <div id="badge-list"></div>
      </div>

      <section id="win-screen" class="win-screen hidden">
        <button id="toggle-facts" class="facts-toggle" type="button" data-i18n="factsShow"></button>
        <div id="number-facts" class="number-facts"></div>
        <button id="restart-button" class="restart-button" type="button" data-i18n="restartButton"></button>
      </section>

      <span id="score-plus" class="score-plus" aria-hidden="true"></span>
    </section>
  </main>
`;

function requiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
}

const gameCard = requiredElement<HTMLElement>('#game-card');
const guessInput = requiredElement<HTMLInputElement>('#guess-input');
const guessButton = requiredElement<HTMLButtonElement>('#guess-button');
const restartButton = requiredElement<HTMLButtonElement>('#restart-button');
const mainHint = requiredElement<HTMLParagraphElement>('#main-hint');
const secondaryHint = requiredElement<HTMLParagraphElement>('#secondary-hint');
const guessCountDisplay = requiredElement<HTMLElement>('#guess-count');
const mysteryBox = requiredElement<HTMLElement>('#mystery-box');
const mysteryText = requiredElement<HTMLElement>('#mystery-text');
const rangeBar = requiredElement<HTMLElement>('#range-bar');
const rangeMin = requiredElement<HTMLElement>('#range-min');
const rangeMax = requiredElement<HTMLElement>('#range-max');
const winScreen = requiredElement<HTMLElement>('#win-screen');
const numberFacts = requiredElement<HTMLElement>('#number-facts');
const scoreDisplay = requiredElement<HTMLElement>('#score-display');
const scorePlus = requiredElement<HTMLElement>('#score-plus');
const levelName = requiredElement<HTMLElement>('#level-name');
const levelProgressBar = requiredElement<HTMLElement>('#level-progress-bar');
const levelProgressText = requiredElement<HTMLElement>('#level-progress-text');
const badgeList = requiredElement<HTMLElement>('#badge-list');
const interactionArea = requiredElement<HTMLElement>('#interaction-area');
const toggleFactsButton = requiredElement<HTMLButtonElement>('#toggle-facts');
const langZhButton = requiredElement<HTMLButtonElement>('#lang-zh');
const langEnButton = requiredElement<HTMLButtonElement>('#lang-en');

const STORAGE_KEY = 'caishuzi_profile_v1';
let currentLanguage: Language = 'zh';
let secretNumber = 0;
let guessCount = 0;
let isGameOver = false;
let minRange = 1;
let maxRange = 100;
let previousGuess: number | null = null;
let givenHints: string[] = [];
let lastHint: HintState = { mainKey: '', status: '', secondaryKey: '', params: {}, warmerColderKey: '' };
let profile = loadProfile();
let totalScore = profile.totalScore;
const earnedBadges = new Set(profile.badges);

function t(key: keyof typeof translations, params: Record<string, string | number> = {}): string {
  let text: string = translations[key][currentLanguage];
  for (const [paramKey, value] of Object.entries(params)) {
    text = text.replace(`{${paramKey}}`, String(value));
  }
  return text;
}

function loadProfile(): Profile {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Profile>;
    return {
      totalScore: Number(stored.totalScore) || 0,
      badges: Array.isArray(stored.badges) ? stored.badges : [],
      loginStreak: Number(stored.loginStreak) || 0,
      winStreak: Number(stored.winStreak) || 0,
      quickWinStreak: Number(stored.quickWinStreak) || 0,
      lastLoginDate: stored.lastLoginDate
    };
  } catch {
    return { totalScore: 0, badges: [], loginStreak: 0, winStreak: 0, quickWinStreak: 0 };
  }
}

function saveProfile(): void {
  profile.totalScore = totalScore;
  profile.badges = [...earnedBadges];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function updateDailyStreak(): void {
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  if (profile.lastLoginDate === todayString) return;

  if (profile.lastLoginDate) {
    const previous = new Date(`${profile.lastLoginDate}T00:00:00`);
    const difference = Math.round((today.getTime() - previous.getTime()) / 86_400_000);
    profile.loginStreak = difference === 1 ? profile.loginStreak + 1 : 1;
  } else {
    profile.loginStreak = 1;
  }

  profile.lastLoginDate = todayString;
  saveProfile();
}

function isPrime(number: number): boolean {
  if (number <= 1) return false;
  for (let divisor = 2; divisor * divisor <= number; divisor += 1) {
    if (number % divisor === 0) return false;
  }
  return true;
}

function isPerfectSquare(number: number): boolean {
  return Number.isInteger(Math.sqrt(number));
}

function sumOfDigits(number: number): number {
  return [...String(number)].reduce((sum, digit) => sum + Number(digit), 0);
}

function renderLevel(): void {
  const level = levels.find((candidate) => totalScore >= candidate.min && totalScore <= candidate.max) ?? levels.at(-1)!;
  levelName.textContent = level.name[currentLanguage];

  if (!Number.isFinite(level.max)) {
    levelProgressBar.style.width = '100%';
    levelProgressText.textContent = `${totalScore - level.min} / ∞`;
    return;
  }

  const span = level.max + 1 - level.min;
  const progress = Math.max(0, totalScore - level.min);
  levelProgressBar.style.width = `${Math.min(100, Math.round((progress / span) * 100))}%`;
  levelProgressText.textContent = `${progress} / ${span}`;
}

function renderBadges(): void {
  badgeList.innerHTML = [...earnedBadges]
    .map((id) => {
      const badge = badgeCatalog.find((candidate) => candidate.id === id);
      if (!badge) return '';
      const label = badge.name[currentLanguage];
      return `<span class="badge" title="${label}"><b>${badge.icon}</b>${label}</span>`;
    })
    .join('');
}

function awardBadges(context: BadgeContext): void {
  let changed = false;
  for (const badge of badgeCatalog) {
    if (!earnedBadges.has(badge.id) && badge.rule(context)) {
      earnedBadges.add(badge.id);
      changed = true;
    }
  }
  if (changed) saveProfile();
  renderBadges();
}

function updateLanguage(): void {
  document.documentElement.lang = currentLanguage === 'zh' ? 'zh-Hant' : 'en';
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n as keyof typeof translations);
  });
  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder as keyof typeof translations);
  });

  langZhButton.classList.toggle('active', currentLanguage === 'zh');
  langEnButton.classList.toggle('active', currentLanguage === 'en');
  renderLevel();
  renderBadges();

  if (lastHint.mainKey) {
    displayHint(lastHint.mainKey as keyof typeof translations, lastHint.status, lastHint.secondaryKey as keyof typeof translations | '', lastHint.params, lastHint.warmerColderKey as keyof typeof translations | '');
  }
  if (isGameOver) renderWinMessage(true);
}

function updateRange(): void {
  const left = ((minRange - 1) / 99) * 100;
  const width = ((maxRange - minRange + 1) / 100) * 100;
  rangeBar.style.marginLeft = `${left}%`;
  rangeBar.style.width = `${Math.max(width, 8)}%`;
  rangeMin.textContent = String(minRange);
  rangeMax.textContent = String(maxRange);
}

function initGame(): void {
  secretNumber = Math.floor(Math.random() * 100) + 1;
  guessCount = 0;
  isGameOver = false;
  minRange = 1;
  maxRange = 100;
  previousGuess = null;
  givenHints = [];
  lastHint = { mainKey: '', status: '', secondaryKey: '', params: {}, warmerColderKey: '' };

  guessInput.value = '';
  guessInput.disabled = false;
  guessButton.disabled = false;
  guessCountDisplay.textContent = '0';
  mainHint.textContent = '';
  secondaryHint.textContent = '';
  interactionArea.classList.remove('hidden');
  winScreen.classList.add('hidden');
  numberFacts.classList.remove('mobile-visible');
  mysteryBox.classList.remove('solved');
  mysteryBox.classList.add('bouncing');
  mysteryText.textContent = '?';
  gameCard.classList.remove('first-try');
  scoreDisplay.textContent = String(totalScore);

  updateRange();
  updateLanguage();
  guessInput.focus();
}

function displayHint(
  mainKey: keyof typeof translations,
  status = 'info',
  secondaryKey: keyof typeof translations | '' = '',
  params: Record<string, string | number> = {},
  warmerColderKey: keyof typeof translations | '' = ''
): void {
  lastHint = { mainKey, status, secondaryKey, params, warmerColderKey };
  mainHint.textContent = t(mainKey, params) + (warmerColderKey ? t(warmerColderKey) : '');
  secondaryHint.textContent = secondaryKey ? t(secondaryKey, params) : '';
  mainHint.dataset.status = status;
  mainHint.classList.remove('hint-pop');
  void mainHint.offsetWidth;
  mainHint.classList.add('hint-pop');
}

function getFunHint(): { key: keyof typeof translations | ''; params?: Record<string, number> } {
  const choices: Array<() => { key: keyof typeof translations; params?: Record<string, number> }> = [];
  const add = (id: string, factory: () => { key: keyof typeof translations; params?: Record<string, number> }) => {
    if (!givenHints.includes(id)) {
      choices.push(() => {
        givenHints.push(id);
        return factory();
      });
    }
  };

  add('odd-even', () => ({ key: secretNumber % 2 === 0 ? 'hintEven' : 'hintOdd' }));
  if (secretNumber % 10 === 0) add('multiple-10', () => ({ key: 'hintMultiple10' }));
  else if (secretNumber % 5 === 0) add('multiple-5', () => ({ key: 'hintMultiple5' }));
  if (isPrime(secretNumber)) add('prime', () => ({ key: 'hintPrime' }));
  if (secretNumber > 9) add('digit-sum', () => ({ key: 'hintSumOfDigits', params: { sum: sumOfDigits(secretNumber) } }));
  if (isPerfectSquare(secretNumber)) add('square', () => ({ key: 'hintPerfectSquare' }));
  if (secretNumber > 9) add('tens', () => ({ key: 'hintTensDigit', params: { digit: Math.floor(secretNumber / 10) } }));

  if (!choices.length) return { key: '' };
  return choices[Math.floor(Math.random() * choices.length)]();
}

function giveFeedback(guess: number): void {
  gameCard.classList.remove('shake');
  void gameCard.offsetWidth;
  gameCard.classList.add('shake');

  const mainKey = guess > secretNumber ? 'tooHigh' : 'tooLow';
  const status = guess > secretNumber ? 'high' : 'low';
  let temperature: keyof typeof translations | '' = '';

  if (previousGuess !== null) {
    const oldDistance = Math.abs(secretNumber - previousGuess);
    const newDistance = Math.abs(secretNumber - guess);
    if (newDistance < oldDistance) temperature = 'gettingWarmer';
    else if (newDistance > oldDistance) temperature = 'gettingColder';
  }

  const hint = getFunHint();
  displayHint(mainKey, status, hint.key, hint.params, temperature);
}

function showScore(points: number): void {
  scorePlus.textContent = `+${points}`;
  scorePlus.classList.remove('score-rise');
  void scorePlus.offsetWidth;
  scorePlus.classList.add('score-rise');
}

function createConfetti(count = 80): void {
  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.animationDelay = `${Math.random() * 1.4}s`;
    piece.style.background = ['#ffd24a', '#f36b3f', '#e84e3b', '#53c8ef', '#ffffff'][index % 5];
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 4200);
  }
}

function renderFacts(): void {
  const facts = [t(secretNumber % 2 === 0 ? 'factEven' : 'factOdd')];
  if (isPrime(secretNumber)) facts.push(t('factPrime'));
  if (isPerfectSquare(secretNumber)) facts.push(t('factPerfectSquare', { sqrt: Math.sqrt(secretNumber) }));
  if (secretNumber % 3 === 0) facts.push(t('factMultiple3'));
  if (secretNumber % 5 === 0) facts.push(t('factMultiple5'));
  if (secretNumber > 9) facts.push(t('factSumOfDigits', { sum: sumOfDigits(secretNumber) }));

  numberFacts.innerHTML = `
    <h2>${t('factsTitle', { secretNumber })}</h2>
    <ul>${facts.map((fact) => `<li>${fact}</li>`).join('')}</ul>
  `;
}

function renderWinMessage(languageOnly = false): void {
  mainHint.textContent = t('correct', { secretNumber });
  mainHint.dataset.status = 'correct';

  const pointsByGuess: Record<number, number> = { 1: 100, 2: 40, 3: 30, 4: 20, 5: 10 };
  const points = pointsByGuess[guessCount] ?? 0;

  if (guessCount === 1) secondaryHint.textContent = t('winJackpot', { points });
  else if (points > 0) secondaryHint.textContent = t('winBonus', { guessCount, points });
  else secondaryHint.textContent = t('winNoBonus', { guessCount });

  if (languageOnly) {
    renderFacts();
    return;
  }

  totalScore += points;
  profile.winStreak += 1;
  profile.quickWinStreak = guessCount <= 5 ? profile.quickWinStreak + 1 : 0;
  scoreDisplay.textContent = String(totalScore);
  saveProfile();
  renderLevel();
  if (points) showScore(points);

  if (guessCount === 1) gameCard.classList.add('first-try');
  createConfetti(guessCount === 1 ? 150 : 80);
  renderFacts();

  awardBadges({
    guessCount,
    totalScore,
    isPrimeSecret: isPrime(secretNumber),
    isPerfectSquare: isPerfectSquare(secretNumber),
    isMultiple10: secretNumber % 10 === 0,
    loginStreak: profile.loginStreak,
    winStreak: profile.winStreak,
    quickWinStreak: profile.quickWinStreak
  });
}

function winGame(): void {
  isGameOver = true;
  guessInput.disabled = true;
  guessButton.disabled = true;
  interactionArea.classList.add('hidden');
  winScreen.classList.remove('hidden');
  mysteryBox.classList.remove('bouncing');
  mysteryBox.classList.add('solved');
  mysteryText.textContent = String(secretNumber);
  renderWinMessage();
}

function handleGuess(): void {
  if (isGameOver) return;
  const guess = Number.parseInt(guessInput.value, 10);

  if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
    displayHint('invalidInput', 'warning');
    guessInput.select();
    return;
  }

  guessCount += 1;
  guessCountDisplay.textContent = String(guessCount);
  guessInput.value = '';

  if (guess === secretNumber) {
    winGame();
    return;
  }

  giveFeedback(guess);
  if (guess < secretNumber) minRange = Math.max(minRange, guess + 1);
  else maxRange = Math.min(maxRange, guess - 1);
  previousGuess = guess;
  updateRange();
  guessInput.focus();
}

guessButton.addEventListener('click', handleGuess);
guessInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleGuess();
});
restartButton.addEventListener('click', initGame);
langZhButton.addEventListener('click', () => {
  currentLanguage = 'zh';
  updateLanguage();
});
langEnButton.addEventListener('click', () => {
  currentLanguage = 'en';
  updateLanguage();
});
toggleFactsButton.addEventListener('click', () => {
  const visible = numberFacts.classList.toggle('mobile-visible');
  toggleFactsButton.textContent = t(visible ? 'factsHide' : 'factsShow');
});

updateDailyStreak();
awardBadges({
  guessCount: 0,
  totalScore,
  isPrimeSecret: false,
  isPerfectSquare: false,
  isMultiple10: false,
  loginStreak: profile.loginStreak,
  winStreak: profile.winStreak,
  quickWinStreak: profile.quickWinStreak
});
initGame();
