import './styles.css';
import RAPIER from '@dimforge/rapier3d-compat';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, VignetteEffect } from 'postprocessing';
import * as THREE from 'three';

type StoryPortal = 'meadow' | 'sky' | 'home' | 'slime';
type PortalId = StoryPortal | 'bonus';
type BodyKind = 'deck' | 'breakable' | 'household' | 'pushball' | 'coin' | 'goldpack' | 'key' | 'finish' | 'checkpoint';
type Pending = 'none' | 'fall' | 'finish' | 'bonus';
type PropKind = 'break' | 'book' | 'cup' | 'pencil' | 'push' | 'coin' | 'checkpoint' | 'key' | 'finish';

interface BodyRecord {
  id: string;
  kind: BodyKind;
  mesh: THREE.Object3D;
  body: RAPIER.RigidBody;
  collider: RAPIER.Collider;
  active: boolean;
  removed: boolean;
  restY: number;
  phase: number;
  reach: number;
  value: number;
  label: string;
  mark?: THREE.MeshStandardMaterial;
}

interface PlayerScore {
  name: string;
  score: number;
  cleared: boolean;
}

interface Profile {
  coins: number;
  xp: number;
  level: number;
  skins: string[];
  hints: number;
}

interface PortalTheme {
  name: string;
  short: string;
  lesson: string;
  hint: string;
  sky: number;
  ground: number;
  bridge: number;
  accent: number;
  sticky: boolean;
}

interface Span {
  x: number;
  width: number;
  length: number;
}

interface Slab {
  x: number;
  z: number;
  sx: number;
  sz: number;
}

interface Prop {
  kind: PropKind;
  index: number;
  z: number;
  x: number;
  yaw?: number;
}

interface LevelPlan {
  spans: Span[];
  props: Prop[];
  pocket?: { index: number; side: 1 | -1 };
  posts: boolean;
  blobs: boolean;
}

interface ReturnPoint {
  portal: StoryPortal;
  position: THREE.Vector3;
  checkpoint: THREE.Vector3;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const portalOrder: StoryPortal[] = ['meadow', 'sky', 'home', 'slime'];
const START_Z = 7;
const DECK_Y = -0.24;
const DECK_H = 0.48;
const BALL_R = 0.56;
const REST_Y = BALL_R + 0.03;
const BREAK_SPEED = 2.2;
const STORAGE_KEY = 'gojiland_rollance_profile_v1';

const themes: Record<PortalId, PortalTheme> = {
  meadow: {
    name: 'Portal 1: 白色起點',
    short: '白色起點',
    lesson: '第一關先練習慢慢推球。輕推會前進，放手後球會自己慢下來。',
    hint: '看形狀：綠色方塊可以撞碎，圓圓的金幣可以撿。杯子和書要繞開，不能打碎。',
    sky: 0xdbe9ee,
    ground: 0xd7e6d4,
    bridge: 0xf7f4e8,
    accent: 0x9bc9a5,
    sticky: false
  },
  sky: {
    name: 'Portal 2: 雲朵橋',
    short: '雲朵橋',
    lesson: '雲橋教你控制速度：窄路前先放慢，轉彎會更穩。',
    hint: '窄橋是細長的。轉彎前先放手，等球自己慢下來，再輕推過去。',
    sky: 0x90cfff,
    ground: 0xc6eef6,
    bridge: 0xe9f3f7,
    accent: 0x5fb8ff,
    sticky: false
  },
  home: {
    name: 'Portal 3: 玩具房',
    short: '玩具房',
    lesson: '日常物品不能打碎。杯子、書本和鉛筆盒要學會避開。',
    hint: '書是扁長方體，杯子是圓柱，鉛筆盒是長盒子。這些都不能打碎。綠色方塊才可以撞碎。',
    sky: 0xf5d4a6,
    ground: 0xc7865a,
    bridge: 0xf3d28f,
    accent: 0xe55d42,
    sticky: false
  },
  slime: {
    name: 'Portal 4: 史萊姆秘密地',
    short: '史萊姆秘密地',
    lesson: '黏黏的路面會改變球的速度。先試探，再前進。',
    hint: '綠色黏地面會把球拖慢。輕推就會前進，一直推也不會變得很快。',
    sky: 0x96e6c8,
    ground: 0x55ba92,
    bridge: 0xb7e98a,
    accent: 0x7bdb4f,
    sticky: true
  },
  bonus: {
    name: 'Super Bonus',
    short: 'Super Bonus',
    lesson: '獎勵關沒有陷阱，專心沿著金幣路線前進。',
    hint: '這關沒有方塊，也沒有杯子。金幣排成彎彎的線，跟著它們走。',
    sky: 0xffda7a,
    ground: 0xf5b85b,
    bridge: 0xffee9a,
    accent: 0xffb72d,
    sticky: false
  }
};

const levels: Record<PortalId, LevelPlan> = {
  meadow: {
    posts: true,
    blobs: false,
    spans: [
      { x: 0, width: 9.2, length: 14 },
      { x: 0, width: 7.6, length: 14 },
      { x: -1.2, width: 6.8, length: 14 },
      { x: 1, width: 6.6, length: 14 },
      { x: 0, width: 8.2, length: 14 }
    ],
    props: [
      { kind: 'coin', index: 0, z: 3, x: -2.2 },
      { kind: 'coin', index: 0, z: 0, x: -2.2 },
      { kind: 'coin', index: 0, z: -3, x: -2.2 },
      { kind: 'break', index: 0, z: -4.5, x: 0.4 },
      { kind: 'coin', index: 1, z: 3, x: 2 },
      { kind: 'coin', index: 1, z: 0, x: 2 },
      { kind: 'break', index: 1, z: 2, x: -1.6 },
      { kind: 'push', index: 1, z: -4, x: 2.3 },
      { kind: 'checkpoint', index: 2, z: 3, x: 0 },
      { kind: 'coin', index: 2, z: 0, x: -1.5 },
      { kind: 'break', index: 2, z: -2, x: 1.5 },
      { kind: 'book', index: 2, z: -4.5, x: -0.95, yaw: 0.4 },
      { kind: 'coin', index: 3, z: 3, x: 1.4 },
      { kind: 'cup', index: 3, z: -1, x: -0.9 },
      { kind: 'coin', index: 4, z: 3, x: 0.4 },
      { kind: 'key', index: 4, z: 0.5, x: -1.6 },
      { kind: 'finish', index: 4, z: -4, x: 0 }
    ],
    pocket: { index: 3, side: 1 }
  },
  sky: {
    posts: true,
    blobs: false,
    spans: [
      { x: 0, width: 6.2, length: 10 },
      { x: 0, width: 3.8, length: 12 },
      { x: -1.5, width: 3.6, length: 12 },
      { x: 1.5, width: 3.6, length: 12 },
      { x: 0, width: 6, length: 10 }
    ],
    props: [
      { kind: 'coin', index: 0, z: 2, x: -1.5 },
      { kind: 'coin', index: 0, z: 2, x: 1.5 },
      { kind: 'break', index: 0, z: -2, x: 0 },
      { kind: 'coin', index: 1, z: 3, x: 0 },
      { kind: 'coin', index: 1, z: 0, x: 0 },
      { kind: 'coin', index: 1, z: -3, x: 0 },
      { kind: 'checkpoint', index: 2, z: 2, x: 0 },
      { kind: 'coin', index: 2, z: -1, x: 0 },
      { kind: 'coin', index: 2, z: -4, x: 0 },
      { kind: 'coin', index: 3, z: 2, x: 0 },
      { kind: 'coin', index: 3, z: -2, x: 0 },
      { kind: 'coin', index: 4, z: 2, x: 1.1 },
      { kind: 'key', index: 4, z: 0, x: -1.3 },
      { kind: 'finish', index: 4, z: -2.4, x: 0 }
    ],
    pocket: { index: 4, side: 1 }
  },
  home: {
    posts: false,
    blobs: false,
    spans: [
      { x: 0, width: 7.2, length: 12 },
      { x: 0, width: 7.2, length: 14 },
      { x: 0, width: 7.2, length: 14 },
      { x: 0, width: 7.2, length: 12 }
    ],
    props: [
      { kind: 'break', index: 0, z: -1, x: 0 },
      { kind: 'coin', index: 0, z: 3, x: -2.1 },
      { kind: 'coin', index: 0, z: 3, x: 2.1 },
      { kind: 'checkpoint', index: 1, z: 4, x: 0 },
      { kind: 'book', index: 1, z: 0.5, x: -1.15, yaw: 0.35 },
      { kind: 'coin', index: 1, z: -3.5, x: 1.9 },
      { kind: 'pencil', index: 2, z: 3, x: -0.9 },
      { kind: 'cup', index: 2, z: -1.5, x: 1.7 },
      { kind: 'coin', index: 2, z: -4, x: -2 },
      { kind: 'book', index: 3, z: 3, x: 1.55, yaw: -0.25 },
      { kind: 'coin', index: 3, z: 1, x: -1.8 },
      { kind: 'cup', index: 3, z: -0.5, x: -1.55 },
      { kind: 'key', index: 3, z: -2.2, x: 0 },
      { kind: 'finish', index: 3, z: -4.2, x: 0 }
    ],
    pocket: { index: 2, side: -1 }
  },
  slime: {
    posts: false,
    blobs: true,
    spans: [
      { x: 0, width: 7.2, length: 12 },
      { x: 1.6, width: 5.4, length: 14 },
      { x: -1.6, width: 5.4, length: 14 },
      { x: 0, width: 7, length: 12 }
    ],
    props: [
      { kind: 'coin', index: 0, z: 2, x: -1.4 },
      { kind: 'coin', index: 0, z: -1, x: 1.2 },
      { kind: 'checkpoint', index: 1, z: 3, x: 0 },
      { kind: 'coin', index: 1, z: 0, x: 0 },
      { kind: 'coin', index: 1, z: -3, x: 0 },
      { kind: 'coin', index: 2, z: 2, x: 0 },
      { kind: 'coin', index: 2, z: -2, x: 0 },
      { kind: 'coin', index: 3, z: 2, x: 1 },
      { kind: 'key', index: 3, z: 0, x: -1.4 },
      { kind: 'finish', index: 3, z: -3.2, x: 0 }
    ],
    pocket: { index: 2, side: 1 }
  },
  bonus: {
    posts: true,
    blobs: false,
    spans: [
      { x: 0, width: 8.5, length: 18 },
      { x: 0, width: 8.5, length: 18 },
      { x: 0, width: 8.5, length: 16 }
    ],
    props: [{ kind: 'finish', index: 2, z: -4, x: 0 }]
  }
};

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Missing #app root');

const appState = {
  portal: 'meadow' as PortalId,
  lives: 5,
  coins: 0,
  xp: 0,
  level: 1,
  keys: 0,
  hints: 0,
  checkpoint: new THREE.Vector3(0, REST_Y, START_Z - 2),
  playerCount: 1,
  activePlayer: 0,
  scores: [] as PlayerScore[],
  started: false,
  paused: false
};

const profile = loadProfile();
appState.coins = profile.coins;
appState.xp = profile.xp;
appState.level = profile.level;
appState.hints = profile.hints;

root.innerHTML = `
  <main class="shell">
    <canvas id="game-canvas" class="game-canvas"></canvas>
    <section class="hud" aria-label="Rollance game">
      <div class="topbar">
        <div class="brand">
          <div class="brand-mark">R</div>
          <div class="brand-title">
            <strong>Rollance</strong>
            <span id="portal-name">Portal 1: 白色起點</span>
            <span id="lesson-line" class="lesson-line"></span>
          </div>
        </div>
        <div class="stats" aria-live="polite">
          <div class="stat"><span>Lives</span><strong id="lives">5</strong></div>
          <div class="stat"><span>Coins</span><strong id="coins">0</strong></div>
          <div class="stat"><span>Ball Lv.</span><strong id="level">1</strong></div>
          <div class="stat"><span>Keys</span><strong id="keys">0</strong></div>
          <div class="stat hidden" id="turn-stat"><span>Turn</span><strong id="turn">P1</strong></div>
        </div>
      </div>
      <div id="message" class="center-message"></div>
      <div class="bottom-panel">
        <section class="mode-panel" aria-label="Local players">
          <h2>本機輪流人數</h2>
          <div class="players" id="players"></div>
          <div class="turn-list" id="turn-list"></div>
        </section>
        <div id="control-pad" class="control-pad" aria-label="Touch control pad">
          <div id="stick" class="stick">•</div>
        </div>
        <section class="education-panel">
          <h2>Portal Note</h2>
          <p id="lesson"></p>
          <button id="hint-button" class="action-button" type="button">使用提示（0）</button>
        </section>
      </div>
    </section>
    <section id="start-overlay" class="overlay">
      <div class="start-card">
        <h1>Rollance</h1>
        <p>一顆小球在低多邊形玩具橋上慢慢冒險。用圓盤或 WASD 輕推，放手後球會自己慢下來。四座橋上可以撿金幣、避開不能打碎的東西，也可以找金色卡包。</p>
        <div class="feature-grid">
          <div class="feature">1-5 人本機輪流，每位都走完整座橋</div>
          <div class="feature">金色卡包進入 Super Bonus</div>
          <div class="feature">無廣告、無帳號、只存本機進度</div>
        </div>
        <p class="picker-label">幾個人輪流？</p>
        <div class="players" id="start-players"></div>
        <button id="start-button" class="primary-button" type="button" disabled>準備橋面…</button>
      </div>
    </section>
    <section id="finish-overlay" class="overlay hidden">
      <div class="chest-card">
        <h2 id="finish-title">完成</h2>
        <p id="finish-copy"></p>
        <div id="finish-chests" class="chest-grid hidden">
          <button class="chest" data-chest="coins" type="button">100 金幣</button>
          <button class="chest" data-chest="skin" type="button">Goji Berry 皮膚</button>
          <button class="chest" data-chest="hint" type="button">提示道具 +1</button>
        </div>
        <div class="finish-actions">
          <button id="continue-button" class="primary-button" type="button">繼續</button>
        </div>
      </div>
    </section>
  </main>
`;

const canvas = requiredElement<HTMLCanvasElement>('#game-canvas');
const livesElement = requiredElement<HTMLElement>('#lives');
const coinsElement = requiredElement<HTMLElement>('#coins');
const levelElement = requiredElement<HTMLElement>('#level');
const keysElement = requiredElement<HTMLElement>('#keys');
const turnElement = requiredElement<HTMLElement>('#turn');
const turnStat = requiredElement<HTMLElement>('#turn-stat');
const portalNameElement = requiredElement<HTMLElement>('#portal-name');
const lessonElement = requiredElement<HTMLElement>('#lesson');
const lessonLine = requiredElement<HTMLElement>('#lesson-line');
const messageElement = requiredElement<HTMLElement>('#message');
const controlPad = requiredElement<HTMLElement>('#control-pad');
const stick = requiredElement<HTMLElement>('#stick');
const playersElement = requiredElement<HTMLElement>('#players');
const startPlayersElement = requiredElement<HTMLElement>('#start-players');
const turnListElement = requiredElement<HTMLElement>('#turn-list');
const startOverlay = requiredElement<HTMLElement>('#start-overlay');
const finishOverlay = requiredElement<HTMLElement>('#finish-overlay');
const finishTitle = requiredElement<HTMLElement>('#finish-title');
const finishCopy = requiredElement<HTMLElement>('#finish-copy');
const finishChests = requiredElement<HTMLElement>('#finish-chests');
const startButton = requiredElement<HTMLButtonElement>('#start-button');
const continueButton = requiredElement<HTMLButtonElement>('#continue-button');
const hintButton = requiredElement<HTMLButtonElement>('#hint-button');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 180);
const cameraTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const composer = new EffectComposer(renderer, {
  multisampling: window.innerWidth < 800 ? 2 : 4,
  frameBufferType: THREE.HalfFloatType
});
composer.addPass(new RenderPass(scene, camera));
composer.addPass(
  new EffectPass(
    camera,
    new BloomEffect({
      intensity: 0.42,
      luminanceThreshold: 0.94,
      luminanceSmoothing: 0.12,
      mipmapBlur: true,
      radius: 0.42,
      levels: 5
    }),
    new VignetteEffect({ darkness: 0.38, offset: 0.34 })
  )
);
const sun = new THREE.DirectionalLight(0xfff6e4, 2.35);
const sunTarget = new THREE.Object3D();
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 42;
sun.shadow.camera.left = -16;
sun.shadow.camera.right = 16;
sun.shadow.camera.top = 16;
sun.shadow.camera.bottom = -16;
sun.shadow.bias = -0.0008;
scene.add(sun);
scene.add(sunTarget);
sun.target = sunTarget;
scene.add(new THREE.HemisphereLight(0xd7f3ff, 0x6fa35d, 1.15));

const loaderGroup = new THREE.Group();
scene.add(loaderGroup);

const records: BodyRecord[] = [];
const collected = new Set<string>();
const bumpCooldown = new Map<string, number>();
const held = { left: false, right: false, up: false, down: false, x: 0, y: 0 };

let world: RAPIER.World;
let ballBody: RAPIER.RigidBody | null = null;
let ballRig: THREE.Group | null = null;
let ballMesh: THREE.Mesh | null = null;
let returnPoint: ReturnPoint | null = null;
let animationId = 0;
let lastFrame = performance.now();
let messageTimer = 0;
let respawnCooldown = 0;
let pending: Pending = 'none';
let pointerId: number | null = null;
let hitstop = 0;
let shake = 0;
let squash = 1;
let lastVy = 0;
let landCooldown = 0;
let audio: AudioContext | null = null;
const inputVector = new THREE.Vector2();
const shards: { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }[] = [];

setupUI();
resize();
window.addEventListener('resize', resize);

await (RAPIER.init as unknown as (options?: object) => Promise<void>)();
world = new RAPIER.World({ x: 0, y: -12.5, z: 0 });
startAttempt('meadow');
startButton.disabled = false;
startButton.textContent = '開始滾動';
animationId = requestAnimationFrame(tick);

function requiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
}

function setupUI(): void {
  fillPlayerButtons(startPlayersElement);
  fillPlayerButtons(playersElement);
  resetScores();
  renderPlayers();
  updateHud();

  controlPad.addEventListener('pointerdown', (event) => {
    wakeAudio();
    pointerId = event.pointerId;
    controlPad.setPointerCapture(event.pointerId);
    updateStick(event);
  });
  controlPad.addEventListener('pointermove', (event) => {
    if (pointerId === event.pointerId) updateStick(event);
  });
  controlPad.addEventListener('pointerup', clearStick);
  controlPad.addEventListener('pointercancel', clearStick);

  window.addEventListener('keydown', (event) => {
    wakeAudio();
    if (!event.repeat) setKey(event.key, true);
    if (isControlKey(event.key) && appState.started && !appState.paused) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    setKey(event.key, false);
  });

  startButton.addEventListener('click', () => {
    wakeAudio();
    if (!ballBody) return;
    appState.started = true;
    appState.paused = false;
    startOverlay.classList.add('hidden');
    startButton.blur();
    showMessage('輕輕推動小球。放手後它會自己慢下來。');
  });

  continueButton.addEventListener('click', continueRun);
  hintButton.addEventListener('click', useHint);
  finishOverlay.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest<HTMLButtonElement>('[data-chest]');
    if (!button || button.disabled) return;
    openChest(button.dataset.chest ?? '');
    button.disabled = true;
    button.textContent = `${button.textContent} ✓`;
  });
}

function fillPlayerButtons(container: HTMLElement): void {
  for (let index = 1; index <= 5; index += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(index);
    button.addEventListener('click', () => setPlayerCount(index));
    container.append(button);
  }
}

function setPlayerCount(count: number): void {
  if (count === appState.playerCount || !finishOverlay.classList.contains('hidden')) return;
  appState.playerCount = count;
  resetScores();
  appState.lives = 5;
  appState.keys = 0;
  if (appState.started) {
    const portal = returnPoint?.portal ?? (appState.portal === 'bonus' ? 'meadow' : appState.portal);
    startAttempt(portal);
    showMessage(`${count} 人本機輪流，這一座橋重新開始。`);
  } else {
    showMessage(`${count} 人本機輪流`);
  }
  updateHud();
}

function isControlKey(key: string): boolean {
  const name = key.toLowerCase();
  return key.startsWith('Arrow') || name === 'a' || name === 'd' || name === 'w' || name === 's';
}

function setKey(key: string, down: boolean): void {
  const name = key.toLowerCase();
  if (key === 'ArrowLeft' || name === 'a') held.left = down;
  else if (key === 'ArrowRight' || name === 'd') held.right = down;
  else if (key === 'ArrowUp' || name === 'w') held.up = down;
  else if (key === 'ArrowDown' || name === 's') held.down = down;
  else return;
  held.x = (held.right ? 1 : 0) - (held.left ? 1 : 0);
  held.y = (held.up ? 1 : 0) - (held.down ? 1 : 0);
  if (pointerId === null) {
    updateStickVisual(held.x * 36, held.y * -36);
  }
}

function updateStick(event: PointerEvent): void {
  const rect = controlPad.getBoundingClientRect();
  const dx = event.clientX - rect.left - rect.width / 2;
  const dy = event.clientY - rect.top - rect.height / 2;
  const radius = rect.width * 0.42;
  const length = Math.hypot(dx, dy);
  const limited = Math.min(length, radius);
  const angle = Math.atan2(dy, dx);
  const x = Math.cos(angle) * limited;
  const y = Math.sin(angle) * limited;
  const raw = new THREE.Vector2(x / radius, -y / radius);
  const strength = raw.length();
  if (strength < 0.14) inputVector.set(0, 0);
  else {
    const eased = Math.min(1, ((strength - 0.14) / 0.86) ** 1.45);
    inputVector.copy(raw.normalize().multiplyScalar(eased));
  }
  updateStickVisual(x, y);
}

function clearStick(event: PointerEvent): void {
  if (pointerId !== event.pointerId) return;
  pointerId = null;
  inputVector.set(0, 0);
  updateStickVisual(held.x * 36, held.y * -36);
}

function updateStickVisual(x: number, y: number): void {
  stick.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function controlVector(): THREE.Vector2 {
  if (held.x !== 0 || held.y !== 0) {
    const vector = new THREE.Vector2(held.x, held.y);
    if (vector.lengthSq() > 1) vector.normalize();
    return vector;
  }
  if (pointerId === null) return new THREE.Vector2();
  return inputVector;
}

function tick(now: number): void {
  const delta = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  if (appState.started && !appState.paused && ballBody) updateGame(delta);
  else decayMessage(delta);
  renderScene(delta);
  animationId = requestAnimationFrame(tick);
}

let simTime = 0;
const FIXED_STEP = 1 / 60;

function updateGame(delta: number): void {
  if (respawnCooldown > 0) respawnCooldown -= delta;
  if (landCooldown > 0) landCooldown -= delta;
  if (hitstop > 0) {
    hitstop -= delta;
    flushPending();
    decayMessage(delta);
    return;
  }
  simTime += Math.min(delta, 0.05);
  if (simTime >= FIXED_STEP) {
    world.timestep = FIXED_STEP;
    substep(FIXED_STEP);
    simTime -= FIXED_STEP;
    if (simTime > FIXED_STEP) simTime = 0;
  }
  flushPending();
  decayMessage(delta);
}

function substep(dt: number): void {
  if (!ballBody) return;
  const stick = controlVector();
  const tune = motionTune();
  ballBody.resetForces(true);
  ballBody.resetTorques(true);
  const before = copyVec(ballBody.linvel());
  let vx = before.x;
  let vz = before.z;
  const pushing = stick.lengthSq() >= 0.0004;
  if (pushing) {
    const mass = Math.max(ballBody.mass(), 0.001);
    vx += (stick.x * tune.forceX * dt) / mass;
    vz += (-stick.y * tune.forceZ * dt) / mass;
  } else {
    const keep = Math.exp(-tune.coast * dt);
    vx *= keep;
    vz *= keep;
  }
  const planned = Math.hypot(vx, vz);
  if (planned > tune.max) {
    const scale = tune.max / planned;
    vx *= scale;
    vz *= scale;
  }
  ballBody.setLinvel({ x: vx, y: before.y, z: vz }, true);
  world.step();
  const pos = copyVec(ballBody.translation());
  const vel = copyVec(ballBody.linvel());
  const after = Math.hypot(vel.x, vel.z);
  if (after > tune.max) {
    const scale = tune.max / after;
    ballBody.setLinvel({ x: vel.x * scale, y: vel.y, z: vel.z * scale }, true);
  }
  syncPushers();
  if (respawnCooldown <= 0 && pos.y < -1.25) {
    request('fall');
    return;
  }
  scanPickups(pos, Math.max(planned, after));
}

function motionTune(): { forceX: number; forceZ: number; max: number; coast: number } {
  if (themes[appState.portal].sticky) return { forceX: 8.2, forceZ: 9.6, max: 2.35, coast: 3.6 };
  return { forceX: 6.4, forceZ: 8.6, max: 3.7, coast: 2.15 };
}

function scanPickups(pos: Vec3, speed: number): void {
  let gained = 0;
  let broke = false;
  let keyNote = false;
  let checkpointNote = false;
  for (const record of records) {
    if (!record.active || !within(record, pos)) continue;
    if (record.kind === 'coin') {
      take(record, true);
      gained += record.value;
    } else if (record.kind === 'breakable') {
      if (speed >= BREAK_SPEED) {
        burst(record.mesh.position, 0x8be05c);
        take(record, true);
        gained += record.value;
        broke = true;
      }
    } else if (record.kind === 'household') {
      if (speed > 0.45) bump(record);
    } else if (record.kind === 'key') {
      take(record, true);
      appState.keys += 1;
      keyNote = true;
    } else if (record.kind === 'checkpoint') {
      appState.checkpoint.set(record.mesh.position.x, REST_Y, record.mesh.position.z);
      take(record, false);
      checkpointNote = true;
    } else if (record.kind === 'goldpack') {
      take(record, true);
      request('bonus');
    } else if (record.kind === 'finish') {
      take(record, true);
      request('finish');
    }
  }
  if (gained > 0) {
    const note = broke && gained === 15 ? '撞碎綠色方塊 +15' : broke ? `撞碎方塊，+${gained} 金幣` : `+${gained} 金幣`;
    addCoins(gained, note);
    playJuice(broke ? 'break' : 'coin');
  }
  if (keyNote) {
    playJuice('key');
    showMessage('拿到鑰匙。過關後可以打開三個寶箱。');
    updateHud();
  }
  if (checkpointNote) showMessage('檢查點已記錄。');
}

function within(record: BodyRecord, pos: Vec3): boolean {
  const dx = record.mesh.position.x - pos.x;
  const dy = record.restY - pos.y;
  const dz = record.mesh.position.z - pos.z;
  return dx * dx + dy * dy + dz * dz <= record.reach * record.reach;
}

function bump(record: BodyRecord): void {
  const now = performance.now();
  if (now - (bumpCooldown.get(record.id) ?? 0) < 2200) return;
  bumpCooldown.set(record.id, now);
  playJuice('bump');
  showMessage(`這個${record.label}不能打碎，從旁邊繞過去。`);
}

function request(action: Pending): void {
  if (pending === 'fall') return;
  if (action === 'fall' || pending === 'none') pending = action;
}

function flushPending(): void {
  const action = pending;
  pending = 'none';
  if (action === 'fall') loseLife();
  else if (action === 'finish') finishRun();
  else if (action === 'bonus') enterBonus();
}

function loseLife(): void {
  appState.lives -= 1;
  if (appState.lives > 0) {
    showMessage('掉下橋了，回到檢查點，慢慢再試一次。');
    resetBall();
    respawnCooldown = 0.85;
    updateHud();
    return;
  }
  const portal = returnPoint?.portal ?? (appState.portal === 'bonus' ? 'meadow' : appState.portal);
  appState.lives = 5;
  const previous = appState.activePlayer;
  if (appState.playerCount > 1) {
    let nextPlayer = (previous + 1) % appState.playerCount;
    for (let guard = 0; guard < appState.playerCount; guard += 1) {
      if (!appState.scores[nextPlayer]?.cleared) break;
      nextPlayer = (nextPlayer + 1) % appState.playerCount;
    }
    appState.activePlayer = nextPlayer;
  }
  showMessage(
    appState.activePlayer === previous
      ? '生命用完了。這座橋再慢慢走一次。'
      : `生命用完了。輪到玩家 ${appState.activePlayer + 1}`
  );
  startAttempt(portal);
}

function resetBall(): void {
  if (!ballBody) return;
  ballBody.setTranslation(
    { x: appState.checkpoint.x, y: appState.checkpoint.y, z: appState.checkpoint.z },
    true
  );
  ballBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
  ballBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
  ballBody.wakeUp();
  squash = 1;
  lastVy = 0;
  if (ballRig) ballRig.scale.set(1, 1, 1);
}

function finishRun(): void {
  const portal = appState.portal;
  if (portal === 'bonus') {
    exitBonus();
    return;
  }
  appState.paused = true;
  const lifeBonus = appState.lives * 20;
  appState.coins += lifeBonus;
  appState.xp += Math.round(lifeBonus / 2);
  appState.level = Math.floor(appState.xp / 150) + 1;
  const player = appState.scores[appState.activePlayer];
  if (player) player.score += lifeBonus;
  const unlocked = appState.keys > 0;
  if (unlocked) appState.keys -= 1;
  const othersLeft = appState.scores.some((score, index) => index !== appState.activePlayer && !score.cleared);
  const next = portalOrder[(portalOrder.indexOf(portal) + 1) % portalOrder.length] ?? 'meadow';
  const clearedAll = portal === 'slime' && !othersLeft;
  finishTitle.textContent = clearedAll ? '四座橋都走完了' : `${themes[portal].short} 完成`;
  const reward = `生命獎勵 +${lifeBonus}。`;
  if (othersLeft) {
    finishCopy.textContent = `${reward} 其他玩家還要走這一座橋。${unlocked ? '你的鑰匙可以打開三個固定獎勵。' : ''}`;
    continueButton.textContent = '換下一位';
  } else if (clearedAll) {
    finishCopy.textContent = `${reward} 白色起點、雲朵橋、玩具房和史萊姆秘密地都走過了。${unlocked ? '先打開寶箱，再走新的一輪。' : '可以再走一輪。'}`;
    continueButton.textContent = '再從白色起點開始';
  } else {
    finishCopy.textContent = `${reward} 下一座是${themes[next].name}。${unlocked ? '鑰匙寶箱的三個獎勵都是固定的。' : '這次沒有拿到鑰匙，下一座橋還可以再找。'}`;
    continueButton.textContent = `前往${themes[next].short}`;
  }
  finishChests.classList.toggle('hidden', !unlocked);
  if (unlocked) resetChests();
  finishOverlay.classList.remove('hidden');
  messageElement.classList.remove('show');
  saveProfile();
  updateHud();
  renderPlayers();
}

function continueRun(): void {
  if (finishOverlay.classList.contains('hidden')) return;
  finishOverlay.classList.add('hidden');
  const player = appState.scores[appState.activePlayer];
  if (player) player.cleared = true;
  const portal = appState.portal === 'bonus' ? 'meadow' : appState.portal;
  const allDone = appState.scores.every((score) => score.cleared);
  appState.paused = false;
  appState.started = true;
  appState.lives = 5;
  appState.keys = 0;
  if (allDone) {
    const next = portalOrder[(portalOrder.indexOf(portal) + 1) % portalOrder.length] ?? 'meadow';
    for (const score of appState.scores) score.cleared = false;
    appState.activePlayer = 0;
    startAttempt(next);
    showMessage(next === 'meadow' ? '新的一輪。輕推，放手後球會慢下來。' : themes[next].lesson);
    return;
  }
  let nextPlayer = (appState.activePlayer + 1) % appState.playerCount;
  for (let guard = 0; guard < appState.playerCount; guard += 1) {
    if (!appState.scores[nextPlayer]?.cleared) break;
    nextPlayer = (nextPlayer + 1) % appState.playerCount;
  }
  appState.activePlayer = nextPlayer;
  startAttempt(portal);
  showMessage(`輪到玩家 ${nextPlayer + 1}`);
}

function enterBonus(): void {
  if (!ballBody || appState.portal === 'bonus') return;
  const pos = copyVec(ballBody.translation());
  returnPoint = {
    portal: appState.portal,
    position: new THREE.Vector3(pos.x, REST_Y, pos.z),
    checkpoint: appState.checkpoint.clone()
  };
  const spawn = new THREE.Vector3(0, REST_Y, START_Z - 2);
  appState.checkpoint.copy(spawn);
  buildWorld('bonus', spawn);
  showMessage('金色卡包：Super Bonus。沒有陷阱，跟著金幣走。');
}

function exitBonus(): void {
  const back = returnPoint;
  returnPoint = null;
  if (!back) {
    startAttempt('meadow');
    showMessage('回到白色起點。');
    return;
  }
  appState.checkpoint.copy(back.checkpoint);
  buildWorld(back.portal, back.position);
  showMessage('Super Bonus 完成，回到原來的橋。');
}

function startAttempt(portal: StoryPortal): void {
  collected.clear();
  returnPoint = null;
  pending = 'none';
  respawnCooldown = 0;
  bumpCooldown.clear();
  appState.keys = 0;
  const spawn = new THREE.Vector3(levels[portal].spans[0]?.x ?? 0, REST_Y, START_Z - 2);
  appState.checkpoint.copy(spawn);
  buildWorld(portal, spawn);
  updateHud();
  renderPlayers();
}

function buildWorld(portal: PortalId, spawn: THREE.Vector3): void {
  clearWorld();
  pending = 'none';
  appState.portal = portal;
  const theme = themes[portal];
  const level = levels[portal];
  scene.background = new THREE.Color(theme.sky);
  scene.fog = new THREE.Fog(theme.sky, 24, 78);
  renderer.setClearColor(theme.sky, 1);
  const laid = laySpans(level.spans);
  for (const slab of laid.slabs) addDeck(slab, theme.bridge);
  level.spans.forEach((_, index) => {
    const pose = spanPose(level.spans, index);
    if (level.posts) addPosts(pose);
    if (level.blobs) addBlobs(pose, theme.accent);
  });
  level.props.forEach((prop, ordinal) => addProp(portal, level.spans, prop, ordinal));
  if (portal === 'bonus') addBonusCoins(level.spans);
  if (level.pocket) addPocket(level.spans, level.pocket.index, level.pocket.side, theme, portal);
  addScenery(theme, portal);
  createBall(spawn);
  placeCamera();
  updatePortalCopy();
}

function clearWorld(): void {
  shards.length = 0;
  for (const record of records) {
    if (!record.removed) world.removeRigidBody(record.body);
  }
  records.length = 0;
  if (ballBody) world.removeRigidBody(ballBody);
  ballBody = null;
  ballRig = null;
  ballMesh = null;
  const materials = new Set<THREE.Material>();
  loaderGroup.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      const mats = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of mats) materials.add(material);
    }
  });
  for (const material of materials) material.dispose();
  loaderGroup.clear();
}

function laySpans(spans: Span[]): { slabs: Slab[] } {
  const slabs: Slab[] = [];
  let zFront = START_Z;
  let previous: Span | null = null;
  for (const span of spans) {
    slabs.push({
      x: span.x,
      z: zFront - span.length / 2,
      sx: span.width,
      sz: Math.max(1, span.length - 0.08)
    });
    if (previous) {
      const left = Math.min(previous.x - previous.width / 2, span.x - span.width / 2);
      const right = Math.max(previous.x + previous.width / 2, span.x + span.width / 2);
      slabs.push({
        x: (left + right) / 2,
        z: zFront,
        sx: right - left,
        sz: 0.06
      });
    }
    previous = span;
    zFront -= span.length;
  }
  return { slabs };
}

function spanPose(spans: Span[], index: number): { x: number; z: number; width: number } {
  const span = spans[index];
  if (!span) throw new Error(`Missing span ${index}`);
  let cursor = START_Z;
  for (let i = 0; i < index; i += 1) cursor -= spans[i]?.length ?? 0;
  return { x: span.x, z: cursor - span.length / 2, width: span.width };
}

function addDeck(slab: Slab, color: number): void {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(slab.sx, DECK_H, slab.sz),
    new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
  );
  mesh.position.set(slab.x, DECK_Y, slab.z);
  own(mesh);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(slab.x, DECK_Y, slab.z));
  const collider = world.createCollider(
    RAPIER.ColliderDesc.cuboid(slab.sx / 2, DECK_H / 2, slab.sz / 2).setFriction(1.12).setRestitution(0),
    body
  );
  remember({
    id: `deck:${slab.x}:${slab.z}:${slab.sx}:${slab.sz}`,
    kind: 'deck',
    mesh,
    body,
    collider,
    restY: DECK_Y,
    reach: 0,
    value: 0,
    label: ''
  });
}

function addProp(portal: PortalId, spans: Span[], prop: Prop, ordinal: number): void {
  const pose = spanPose(spans, prop.index);
  const x = pose.x + prop.x;
  const z = pose.z + prop.z;
  const id = `${portal}:${prop.kind}:${ordinal}:${prop.index}:${prop.x}:${prop.z}`;
  if (collected.has(id)) return;
  if (prop.kind === 'coin') addCoin(id, x, z);
  else if (prop.kind === 'break') addBreak(id, x, z);
  else if (prop.kind === 'book') addHousehold(id, x, z, 'book', prop.yaw ?? 0);
  else if (prop.kind === 'cup') addHousehold(id, x, z, 'cup', 0);
  else if (prop.kind === 'pencil') addHousehold(id, x, z, 'pencil', prop.yaw ?? 0);
  else if (prop.kind === 'push') addPush(id, x, z);
  else if (prop.kind === 'checkpoint') addCheckpoint(id, x, z);
  else if (prop.kind === 'key') addKey(id, x, z);
  else addFinish(id, x, z);
}

function addBonusCoins(spans: Span[]): void {
  let count = 0;
  spans.forEach((span, index) => {
    if (index === spans.length - 1) return;
    for (let step = 0; step < 6; step += 1) {
      const pose = spanPose(spans, index);
      const z = pose.z - span.length / 2 + 2.2 + step * ((span.length - 3.4) / 5);
      const x = pose.x + Math.sin(count * 0.85) * 1.55;
      addCoin(`bonus:coin:${count}`, x, z);
      count += 1;
    }
  });
}

function addCoin(id: string, x: number, z: number): void {
  if (collected.has(id)) return;
  const group = new THREE.Group();
  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.08, 7),
    new THREE.MeshStandardMaterial({
      color: 0xffc93f,
      emissive: 0xffb020,
      emissiveIntensity: 0.7,
      roughness: 0.32,
      metalness: 0.22
    })
  );
  coin.rotation.x = Math.PI / 2;
  group.add(coin);
  const y = 0.78;
  group.position.set(x, y, z);
  own(group);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  const collider = world.createCollider(RAPIER.ColliderDesc.ball(0.3).setSensor(true), body);
  remember({ id, kind: 'coin', mesh: group, body, collider, restY: y, reach: 1.12, value: 10, label: '金幣' });
}

function addBreak(id: string, x: number, z: number): void {
  const y = 0.5;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x8be05c, roughness: 0.72 })
  );
  mesh.position.set(x, y, z);
  own(mesh);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  const collider = world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setFriction(0.7).setRestitution(0.02),
    body
  );
  remember({ id, kind: 'breakable', mesh, body, collider, restY: y, reach: 1.18, value: 15, label: '綠色方塊' });
}

function addHousehold(id: string, x: number, z: number, shape: 'book' | 'cup' | 'pencil', yaw: number): void {
  const group = new THREE.Group();
  let colliderDesc: RAPIER.ColliderDesc;
  let label = '東西';
  let y = 0.2;
  if (shape === 'book') {
    label = '書本';
    y = 0.16;
    const cover = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.32, 1.9), new THREE.MeshStandardMaterial({ color: 0x4b8ac9, roughness: 0.82 }));
    const pages = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 1.72), new THREE.MeshStandardMaterial({ color: 0xf3efe2, roughness: 0.9 }));
    pages.position.y = 0.04;
    group.add(cover, pages);
    colliderDesc = RAPIER.ColliderDesc.cuboid(0.72, 0.16, 0.95).setFriction(0.85);
  } else if (shape === 'cup') {
    label = '杯子';
    y = 0.52;
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 1.05, 7), new THREE.MeshStandardMaterial({ color: 0xf4f1e4, roughness: 0.78 })));
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.045, 5, 8, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf4f1e4, roughness: 0.78 })
    );
    handle.position.set(0.34, 0.02, 0);
    handle.rotation.y = Math.PI / 2;
    handle.rotation.z = Math.PI / 2;
    group.add(handle);
    colliderDesc = RAPIER.ColliderDesc.cylinder(0.52, 0.42).setFriction(0.8);
  } else {
    label = '鉛筆盒';
    y = 0.2;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 1.65), new THREE.MeshStandardMaterial({ color: 0xf0b429, roughness: 0.8 }));
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.12, 0.18), new THREE.MeshStandardMaterial({ color: 0x8b623f, roughness: 0.7 }));
    clasp.position.y = 0.2;
    group.add(box, clasp);
    colliderDesc = RAPIER.ColliderDesc.cuboid(0.35, 0.2, 0.82).setFriction(0.85);
  }
  group.position.set(x, y, z);
  group.rotation.y = yaw;
  own(group);
  const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z).setRotation({ x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w })
  );
  const collider = world.createCollider(colliderDesc, body);
  remember({ id, kind: 'household', mesh: group, body, collider, restY: y + 0.2, reach: 1.28, value: 0, label });
}

function addPush(id: string, x: number, z: number): void {
  const y = 0.72;
  const mesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.72, 0),
    new THREE.MeshStandardMaterial({ color: 0xff8a47, roughness: 0.68 })
  );
  mesh.position.set(x, y, z);
  own(mesh);
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z).setLinearDamping(2.4).setAngularDamping(1.6).setCcdEnabled(true)
  );
  const collider = world.createCollider(
    RAPIER.ColliderDesc.ball(0.72).setDensity(2.8).setFriction(1.25).setRestitution(0.04),
    body
  );
  remember({ id, kind: 'pushball', mesh, body, collider, restY: y, reach: 0, value: 0, label: '球' });
}

function addCheckpoint(id: string, x: number, z: number): void {
  const group = new THREE.Group();
  const mark = new THREE.MeshStandardMaterial({ color: 0x3aa0e0, roughness: 0.55 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 4, 8), mark);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.08;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.1, 5), new THREE.MeshStandardMaterial({ color: 0xf7f4e8, roughness: 0.8 }));
  pole.position.set(0.85, 0.55, 0);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.06), mark);
  flag.position.set(0.58, 0.92, 0);
  group.add(ring, pole, flag);
  const y = 0.2;
  group.position.set(x, y, z);
  own(group);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, 0.5, z));
  const collider = world.createCollider(RAPIER.ColliderDesc.ball(0.75).setSensor(true), body);
  remember({ id, kind: 'checkpoint', mesh: group, body, collider, restY: 0.5, reach: 1.35, value: 0, label: '檢查點', mark });
}

function addKey(id: string, x: number, z: number): void {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xffd447,
    emissive: 0xffc24a,
    emissiveIntensity: 0.55,
    roughness: 0.35,
    metalness: 0.18
  });
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 4, 6), material);
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.48), material);
  shaft.position.z = 0.28;
  group.add(bow, shaft);
  const y = 0.72;
  group.position.set(x, y, z);
  own(group);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  const collider = world.createCollider(RAPIER.ColliderDesc.ball(0.34).setSensor(true), body);
  remember({ id, kind: 'key', mesh: group, body, collider, restY: y, reach: 1.15, value: 0, label: '鑰匙' });
}

function addFinish(id: string, x: number, z: number): void {
  const y = 0.98;
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.12, 5, 8),
    new THREE.MeshStandardMaterial({
      color: 0x67db73,
      emissive: 0x3cae55,
      emissiveIntensity: 0.35,
      roughness: 0.42
    })
  );
  mesh.position.set(x, y, z);
  own(mesh);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  const collider = world.createCollider(RAPIER.ColliderDesc.ball(0.72).setSensor(true), body);
  remember({ id, kind: 'finish', mesh, body, collider, restY: y, reach: 1.2, value: 0, label: '終點' });
}

function addPocket(spans: Span[], index: number, side: 1 | -1, theme: PortalTheme, portal: PortalId): void {
  const pose = spanPose(spans, index);
  const id = `${portal}:goldpack`;
  const edge = pose.x + side * (pose.width / 2);
  const pocketCenter = edge + side * 4.6;
  const connectorInner = edge + side * 0.08;
  const connectorOuter = pocketCenter - side * 2.16;
  addDeck(
    {
      x: (connectorInner + connectorOuter) / 2,
      z: pose.z,
      sx: Math.abs(connectorOuter - connectorInner),
      sz: 3.1
    },
    theme.bridge
  );
  addDeck({ x: pocketCenter, z: pose.z, sx: 4.2, sz: 4.4 }, theme.bridge);
  if (collected.has(id)) return;
  const group = new THREE.Group();
  const pack = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.86, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0xffcf33,
      emissive: 0xffc107,
      emissiveIntensity: 0.75,
      roughness: 0.38,
      metalness: 0.16
    })
  );
  const band = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.16, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xfff6d4, roughness: 0.4 })
  );
  group.add(pack, band);
  const y = 0.7;
  group.position.set(pocketCenter, y, pose.z);
  own(group);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(pocketCenter, y, pose.z));
  const collider = world.createCollider(RAPIER.ColliderDesc.ball(0.48).setSensor(true), body);
  remember({ id, kind: 'goldpack', mesh: group, body, collider, restY: y, reach: 1.25, value: 0, label: '卡包' });
}

function addPosts(pose: { x: number; z: number; width: number }): void {
  if (pose.width < 6.5) return;
  const material = new THREE.MeshStandardMaterial({ color: 0x8b623f, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.9, 5), material);
    post.position.set(pose.x + side * (pose.width / 2 - 0.28), 0.45, pose.z);
    own(post);
  }
}

function addBlobs(pose: { x: number; z: number; width: number }, color: number): void {
  for (const spot of [
    { x: pose.x - pose.width * 0.18, z: pose.z - 1.1, scale: 1.15 },
    { x: pose.x + pose.width * 0.16, z: pose.z + 1.3, scale: 0.85 }
  ]) {
    const blob = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.5, 0),
      new THREE.MeshStandardMaterial({ color, roughness: 0.48, transparent: true, opacity: 0.8 })
    );
    blob.scale.set(spot.scale, 0.16, spot.scale);
    blob.position.set(spot.x, 0.05, spot.z);
    own(blob);
  }
}

function addScenery(theme: PortalTheme, portal: PortalId): void {
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(46, 58, 2.2, 8),
    new THREE.MeshStandardMaterial({ color: theme.ground, roughness: 0.96 })
  );
  ground.position.set(0, -16, -28);
  ground.receiveShadow = true;
  loaderGroup.add(ground);
  const random = mulberry32(portal);
  for (let index = 0; index < 16; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const tree = makeTree(theme.accent, 0.8 + random() * 1.1);
    tree.position.set(side * (12 + random() * 16), -14.6, 10 - random() * 78);
    loaderGroup.add(tree);
  }
}

function makeTree(accent: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.24, 1.15, 5),
    new THREE.MeshStandardMaterial({ color: 0x8b5738, roughness: 0.92 })
  );
  const crown = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.85, 0),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.88 })
  );
  trunk.position.y = 0.45 * scale;
  crown.position.y = 1.25 * scale;
  group.add(trunk, crown);
  group.scale.setScalar(scale);
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) object.castShadow = true;
  });
  return group;
}

function own(object: THREE.Object3D): void {
  loaderGroup.add(object);
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function remember(record: Omit<BodyRecord, 'active' | 'removed' | 'phase'>): void {
  records.push({ ...record, active: true, removed: false, phase: records.length * 0.7 });
}

function take(record: BodyRecord, hide: boolean): void {
  if (!record.active || record.removed) return;
  record.active = false;
  if (hide) record.mesh.visible = false;
  if (!hide && record.mark) record.mark.color.set(0x67c46a);
  record.removed = true;
  world.removeRigidBody(record.body);
  if (record.kind !== 'checkpoint' && record.kind !== 'deck' && !record.id.startsWith('bonus:')) collected.add(record.id);
}

function createBall(spawn: THREE.Vector3): void {
  const sticky = themes[appState.portal].sticky;
  squash = 1;
  lastVy = 0;
  ballRig = new THREE.Group();
  ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_R, 28, 20),
    new THREE.MeshPhysicalMaterial({
      color: profile.skins.includes('goji-berry') ? 0xc72e5b : 0xf3544c,
      roughness: 0.22,
      metalness: 0.04,
      clearcoat: 0.72,
      clearcoatRoughness: 0.22
    })
  );
  ballMesh.castShadow = true;
  ballRig.add(ballMesh);
  ballRig.position.copy(spawn);
  loaderGroup.add(ballRig);
  ballBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(spawn.x, spawn.y, spawn.z)
      .setLinearDamping(sticky ? 3.1 : 0.42)
      .setAngularDamping(sticky ? 2.4 : 0.62)
      .setCanSleep(false)
      .setCcdEnabled(true)
  );
  world.createCollider(
    RAPIER.ColliderDesc.ball(BALL_R).setDensity(1.15).setFriction(sticky ? 1.35 : 0.9).setRestitution(0.04),
    ballBody
  );
}

function syncPushers(): void {
  for (const record of records) {
    if (record.kind !== 'pushball' || !record.active || record.removed) continue;
    const pos = copyVec(record.body.translation());
    const rot = copyQuat(record.body.rotation());
    record.mesh.position.set(pos.x, pos.y, pos.z);
    record.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    if (pos.y < -2) take(record, true);
  }
}

function renderScene(delta: number): void {
  if (hitstop <= 0) updateShards(delta);
  if (ballBody && ballRig && ballMesh) {
    const pos = copyVec(ballBody.translation());
    const rot = copyQuat(ballBody.rotation());
    const vel = copyVec(ballBody.linvel());
    ballRig.position.set(pos.x, pos.y, pos.z);
    ballMesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    settleBall(pos, vel, delta);
    const now = performance.now();
    for (const record of records) {
      if (!record.mesh.visible) continue;
      if (record.kind === 'finish') {
        record.mesh.rotation.z += delta * 0.6;
      } else if (record.kind === 'coin' || record.kind === 'key' || record.kind === 'goldpack') {
        record.mesh.rotation.y += delta * 1.7;
        record.mesh.position.y = record.restY + Math.sin(now * 0.003 + record.phase) * 0.1;
      }
    }
    aimCamera(pos, vel, delta, false);
  }
  composer.render(delta);
}

function placeCamera(): void {
  if (!ballBody) return;
  const pos = copyVec(ballBody.translation());
  const vel = copyVec(ballBody.linvel());
  aimCamera(pos, vel, 0, true);
}

function aimCamera(pos: Vec3, vel: Vec3, delta: number, snap: boolean): void {
  const speed = Math.hypot(vel.x, vel.z);
  const ahead = speed > 0.4 ? Math.min(1.5, (speed - 0.4) * 0.55) : 0;
  const scale = speed > 0.05 ? ahead / speed : 0;
  const ax = vel.x * scale;
  const az = vel.z * scale;
  cameraTarget.set(pos.x * 0.14 + ax * 0.2, pos.y + 7.2, pos.z + 10.35 + az * 0.15);
  lookTarget.set(pos.x * 0.16 + ax, pos.y + 0.18, pos.z - 2.15 + az);
  if (snap) camera.position.copy(cameraTarget);
  else camera.position.lerp(cameraTarget, 1 - Math.exp(-4.2 * delta));
  if (shake > 0 && !snap) {
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake * 0.55;
    shake = Math.max(0, shake - delta * 2.4);
  }
  camera.lookAt(lookTarget);
  sunTarget.position.set(pos.x, pos.y, pos.z);
  sun.position.set(pos.x - 8, pos.y + 14, pos.z + 8);
}

function settleBall(pos: Vec3, vel: Vec3, delta: number): void {
  if (!ballRig) return;
  const grounded = pos.y < REST_Y + 0.2;
  if (grounded && lastVy < -1.6 && vel.y > -0.4 && landCooldown <= 0) {
    squash = 0.76;
    landCooldown = 0.4;
    playJuice('land');
  }
  lastVy = vel.y;
  squash += (1 - squash) * (1 - Math.exp(-11 * delta));
  const wide = 1 / Math.sqrt(squash);
  ballRig.scale.set(wide, squash, wide);
}

function addCoins(amount: number, message: string): void {
  appState.coins += amount;
  appState.xp += Math.max(1, Math.round(amount / 2));
  const nextLevel = Math.floor(appState.xp / 150) + 1;
  const player = appState.scores[appState.activePlayer];
  if (player) player.score += amount;
  if (nextLevel > appState.level) {
    appState.level = nextLevel;
    showMessage(`球升到 Lv. ${nextLevel}！`);
  } else {
    showMessage(message);
  }
  saveProfile();
  updateHud();
  renderPlayers();
}

function openChest(kind: string): void {
  if (kind === 'coins') addCoins(100, '寶箱：100 金幣');
  if (kind === 'skin') {
    if (!profile.skins.includes('goji-berry')) profile.skins.push('goji-berry');
    paintBall();
    showMessage('新皮膚：Goji Berry');
  }
  if (kind === 'hint') {
    appState.hints += 1;
    showMessage('提示道具 +1');
  }
  saveProfile();
  updateHud();
}

function paintBall(): void {
  if (!ballMesh) return;
  const material = ballMesh.material;
  if (material instanceof THREE.MeshStandardMaterial) {
    material.color.set(profile.skins.includes('goji-berry') ? 0xc72e5b : 0xf3544c);
  }
}

function useHint(): void {
  if (!appState.started || appState.paused) return;
  if (appState.hints <= 0) {
    showMessage('提示在鑰匙寶箱裡。過關時拿到鑰匙就能打開。');
    return;
  }
  appState.hints -= 1;
  saveProfile();
  updateHud();
  showMessage(themes[appState.portal].hint);
}

function resetChests(): void {
  for (const chest of finishChests.querySelectorAll<HTMLButtonElement>('.chest')) {
    chest.disabled = false;
    const kind = chest.dataset.chest;
    if (kind === 'coins') chest.textContent = '100 金幣';
    if (kind === 'skin') chest.textContent = 'Goji Berry 皮膚';
    if (kind === 'hint') chest.textContent = '提示道具 +1';
  }
}

function resetScores(): void {
  appState.scores = Array.from({ length: appState.playerCount }, (_, index) => ({
    name: `P${index + 1}`,
    score: 0,
    cleared: false
  }));
  appState.activePlayer = 0;
}

function renderPlayers(): void {
  for (const container of [playersElement, startPlayersElement]) {
    container.querySelectorAll('button').forEach((button, index) => {
      button.classList.toggle('active', index + 1 === appState.playerCount);
    });
  }
  turnListElement.innerHTML = appState.scores
    .map(
      (score, index) => `
      <div class="turn-row ${index === appState.activePlayer ? 'active' : ''}">
        <span>${score.name}${score.cleared ? ' ✓' : ''}</span>
        <span>${score.score}</span>
      </div>
    `
    )
    .join('');
  turnElement.textContent = `P${appState.activePlayer + 1}`;
  turnStat.classList.toggle('hidden', appState.playerCount < 2);
}

function updatePortalCopy(): void {
  const theme = themes[appState.portal];
  portalNameElement.textContent = theme.name;
  lessonElement.textContent = theme.lesson;
  lessonLine.textContent = theme.lesson;
}

function updateHud(): void {
  livesElement.textContent = String(appState.lives);
  coinsElement.textContent = String(appState.coins);
  levelElement.textContent = String(appState.level);
  keysElement.textContent = String(appState.keys);
  hintButton.textContent = `使用提示（${appState.hints}）`;
  updatePortalCopy();
  renderPlayers();
}

function showMessage(text: string): void {
  messageElement.textContent = text;
  messageElement.classList.add('show');
  messageTimer = 2.6;
}

function decayMessage(delta: number): void {
  if (messageTimer <= 0) return;
  messageTimer -= delta;
  if (messageTimer <= 0) messageElement.classList.remove('show');
}

function loadProfile(): Profile {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Profile>;
    return {
      coins: Number(stored.coins) || 0,
      xp: Number(stored.xp) || 0,
      level: Math.max(1, Number(stored.level) || 1),
      skins: Array.isArray(stored.skins) ? stored.skins.filter((skin): skin is string => typeof skin === 'string') : [],
      hints: Number(stored.hints) || 0
    };
  } catch {
    return { coins: 0, xp: 0, level: 1, skins: [], hints: 0 };
  }
}

function saveProfile(): void {
  profile.coins = appState.coins;
  profile.xp = appState.xp;
  profile.level = appState.level;
  profile.hints = appState.hints;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function resize(): void {
  const width = window.innerWidth;
  const height = window.innerHeight;
  composer.setSize(width, height, false);
  camera.fov = width < 720 ? 58 : 46;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

function copyVec(value: Vec3): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function copyQuat(value: { x: number; y: number; z: number; w: number }): { x: number; y: number; z: number; w: number } {
  return { x: value.x, y: value.y, z: value.z, w: value.w };
}

function burst(origin: Vec3, color: number): void {
  hitstop = 0.07;
  shake = Math.max(shake, 0.16);
  for (let index = 0; index < 6; index += 1) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.14),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, roughness: 0.5 })
    );
    mesh.position.set(origin.x + (index - 2.5) * 0.05, Math.max(origin.y, 0.45), origin.z);
    loaderGroup.add(mesh);
    shards.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 3.2, 1.7 + Math.random() * 2.1, (Math.random() - 0.5) * 3.2),
      life: 0.42
    });
  }
}

function updateShards(delta: number): void {
  for (let index = shards.length - 1; index >= 0; index -= 1) {
    const shard = shards[index];
    if (!shard) continue;
    shard.life -= delta;
    shard.velocity.y -= 14 * delta;
    shard.mesh.position.addScaledVector(shard.velocity, delta);
    shard.mesh.rotation.x += delta * 7;
    shard.mesh.rotation.z += delta * 5;
    if (shard.life > 0) continue;
    shard.mesh.geometry.dispose();
    const material = shard.mesh.material;
    if (material instanceof THREE.Material) material.dispose();
    shard.mesh.removeFromParent();
    shards.splice(index, 1);
  }
}

function wakeAudio(): void {
  const Ctx = window.AudioContext;
  if (!Ctx) return;
  if (!audio) audio = new Ctx();
  if (audio.state === 'suspended') void audio.resume();
}

function playJuice(kind: 'coin' | 'break' | 'bump' | 'key' | 'land'): void {
  if (!audio || audio.state !== 'running') return;
  if (kind === 'break') {
    playNoise(0.12, 0.07);
    return;
  }
  const tone = {
    coin: { freq: 880, end: 1320, dur: 0.09, type: 'triangle' as OscillatorType, vol: 0.07 },
    bump: { freq: 150, end: 80, dur: 0.08, type: 'sine' as OscillatorType, vol: 0.06 },
    key: { freq: 660, end: 1040, dur: 0.14, type: 'triangle' as OscillatorType, vol: 0.07 },
    land: { freq: 240, end: 120, dur: 0.06, type: 'sine' as OscillatorType, vol: 0.04 }
  }[kind];
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = tone.type;
  osc.frequency.setValueAtTime(tone.freq, now);
  osc.frequency.exponentialRampToValueAtTime(tone.end, now + tone.dur);
  gain.gain.setValueAtTime(tone.vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + tone.dur);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + tone.dur + 0.02);
}

function playNoise(duration: number, volume: number): void {
  if (!audio) return;
  const length = Math.max(1, Math.floor(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / length);
  }
  const now = audio.currentTime;
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  source.connect(gain);
  gain.connect(audio.destination);
  source.start(now);
}

function mulberry32(seedKey: string): () => number {
  let seed = 2166136261;
  for (const char of seedKey) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationId);
});
