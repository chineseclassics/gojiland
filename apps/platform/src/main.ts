import './styles.css';

interface CatalogApp {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  subject: string;
  ageRange: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  url: string;
  accent: string;
}

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) throw new Error('Missing #app root');

root.innerHTML = `
  <div class="site-shell">
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="GojiLand home">
        <span class="wordmark-dot" aria-hidden="true"></span>
        GojiLand
      </a>
      <a class="header-link" href="#work">Explore the apps</a>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <h1>A small world<br />of big ideas.</h1>
          <p>Built by Goji, age 8, with curiosity and code.</p>
          <a class="primary-link" href="#work">
            Explore the apps
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div class="hero-art" aria-label="A floating island with a mystery number box">
          <span class="orbit orbit-one" aria-hidden="true"></span>
          <span class="orbit orbit-two" aria-hidden="true"></span>
          <img src="/images/gojiland-island.png" alt="" />
        </div>
      </section>

      <section class="work-section" id="work" aria-labelledby="work-title">
        <div class="section-intro">
          <p>Made in GojiLand</p>
          <h2 id="work-title">Small games with big ideas.</h2>
        </div>
        <div id="app-catalog" class="app-catalog" aria-live="polite">
          <p class="loading-message">Opening the app catalogue…</p>
        </div>
      </section>
    </main>

    <footer>
      <a class="wordmark footer-mark" href="/">
        <span class="wordmark-dot" aria-hidden="true"></span>
        GojiLand
      </a>
      <p>Made with care by Goji and her family.</p>
    </footer>
  </div>
`;

function renderCatalog(apps: CatalogApp[]): void {
  const container = document.querySelector<HTMLDivElement>('#app-catalog');
  if (!container) return;

  container.innerHTML = apps
    .map((app, index) => `
      <article class="app-card ${index === 0 ? 'app-card-featured' : ''}" style="--app-accent: ${app.accent}">
        <div class="app-copy">
          <div class="app-number">${String(index + 1).padStart(2, '0')}</div>
          <h3>${app.titleEn}</h3>
          <p>${app.descriptionEn}</p>
          <dl class="app-details">
            <div>
              <dt>Made for</dt>
              <dd>Ages ${app.ageRange}</dd>
            </div>
            <div>
              <dt>Explore</dt>
              <dd>${app.subject}</dd>
            </div>
          </dl>
          <a class="play-link" href="${app.url}">
            Play now
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div class="game-preview game-preview-${app.id}" aria-hidden="true">
          <span class="preview-star star-one">✦</span>
          <span class="preview-star star-two">✦</span>
          <div class="preview-window">
            <div class="preview-top">
              <span></span><span></span><span></span>
            </div>
            <div class="preview-body">
              ${renderPreview(app)}
            </div>
          </div>
        </div>
      </article>
    `)
    .join('');
}

function renderPreview(app: CatalogApp): string {
  if (app.id === 'rollance') {
    return `
      <div class="rollance-preview-track">
        <span class="rollance-ball"></span>
        <span class="rollance-coin coin-one"></span>
        <span class="rollance-coin coin-two"></span>
        <span class="rollance-block block-one"></span>
        <span class="rollance-block block-two"></span>
      </div>
    `;
  }

  return `
    <div class="preview-box">?</div>
    <div class="preview-lines">
      <span class="line-long"></span>
      <span class="line-short"></span>
    </div>
    <div class="preview-answer">
      <span>1</span>
      <span class="answer-track"></span>
      <span>100</span>
    </div>
  `;
}

async function loadCatalog(): Promise<void> {
  try {
    const response = await fetch('/catalog/apps.json');
    if (!response.ok) throw new Error(`Catalogue returned ${response.status}`);
    const catalog = (await response.json()) as CatalogApp[];
    const published = catalog
      .filter((app) => app.status === 'published')
      .sort((left, right) => Number(right.featured) - Number(left.featured));
    if (published.length === 0) throw new Error('No published apps');
    renderCatalog(published);
  } catch (error) {
    console.error(error);
    const container = document.querySelector<HTMLDivElement>('#app-catalog');
    if (container) {
      container.innerHTML = '<p class="loading-message">The apps will be back shortly.</p>';
    }
  }
}

void loadCatalog();
