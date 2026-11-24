import favIconImg from './assets/favIconImg.jpg'


const Logo = () => (
  <span className="brand-mark" aria-hidden="true">
    <img src={favIconImg} alt="PortfolioGenie logo" />
  </span>
)

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
    <path d="M4.5 10h11m-4.5-4.5L15.5 10 11 14.5" />
  </svg>
)

const features = [
  [
    '01',
    'Connect your GitHub',
    'We analyze your public repositories, languages, stars, and activity to find the work worth showing.',
  ],
  [
    '02',
    'Shape your story',
    'Genie turns technical details into clear project stories optimized for recruiters and search.',
  ],
  [
    '03',
    'Publish with confidence',
    'Preview a fast, accessible portfolio that looks considered on every screen—then make it yours.',
  ],
]

const handleSmoothScroll = (e) => {
  e.preventDefault();
  const target = document.getElementById('how-it-works');
  if (!target) return;

  const targetPosition = target.getBoundingClientRect().top + window.scrollY;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const duration = 2000;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
  
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);

    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
};

const Home = () => (
  <div className="home-page">
    <header className="home-header">
      <div className="home-nav">
        <a href="/" aria-label="PortfolioGenie home" className="home-header-logo">
          <Logo />
          <span>Portfolio<span style={{color: '#2867e8'}}>Genie</span></span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#showcase">Showcase</a>
        </nav>
        <a className="primary-button header-cta" href="/CreatePortfolio">
          Build your portfolio <ArrowIcon />
        </a>
      </div>
    </header>

    <main>
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span aria-hidden="true">💡</span>
            AI-powered portfolio builder
          </div>
          <h1 className="hero-heading">
            Your Portfolio tells a story.
            <span className="hero-highlight">Make it count.</span>
          </h1>
          <p className="hero-description" id="features">
            PortfolioGenie analyzes your GitHub, finds your strongest work, and helps you
            <br className="desktop-break" /> turn it into a professional portfolio recruiters actually want to read.
          </p>
          <div className="hero-actions">
            <a className="hero-primary-button" href="/CreatePortfolio">
              Create my portfolio <ArrowIcon />
            </a>
            <a 
            className="hero-secondary-button" 
             href="#how-it-works" 
            onClick={handleSmoothScroll}
            >
           See how it works <span aria-hidden="true">↓</span>
          </a>
          </div>
          <ul className="hero-benefits">
            <li><span aria-hidden="true">✓</span>No credit card</li>
            <li><span aria-hidden="true">✓</span>Ready in minutes</li>
            <li><span aria-hidden="true">✓</span>Built for developers</li>
          </ul>
        </div>
      </div>

      <section className="how-it-works-section" id="how-it-works">
        <div className="how-it-works-inner">
          <div className="how-it-works-heading">
            <div className="how-it-works-title">How it works</div>
            <h2>From repositories<br />to remarkable.</h2>
          </div>
          <p className="how-it-works-intro">
            You did the hard part—you built the projects. PortfolioGenie handles
            the storytelling, structure, and presentation.
          </p>
          <div className="features-grid" id="features">
            {features.map(([number, title, description]) => (
              <article className="feature-card" key={number}>
                <span className={`feature-number feature-${number}`}>{number}</span>
                <div>
                  <h3 className="feature-title">{title}</h3>
                  <p className="feature-description">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-body">
          <div className="features-heading">
            <div className="features-title">
              AI That Writes Your Descriptions
            </div>
            <h2>Technical work, <span>clearly explained.</span></h2>
          </div>
          <p className="features-intro">
            Genie added outcomes, context, and searchable language
             while keeping the detaials that prove you know your craft. 
          </p>
          <ul className="features-list">
            <li><span aria-hidden="true">✓</span>SEO- friendly projects descriptions</li>
            <li><span aria-hidden="true">✓</span>Personalized suggestions</li>
            <li><span aria-hidden="true">✓</span>Clear, concise, and recruiter-friendly</li>
          </ul>
          <div className="feature-card">
            <div className="before">
              <div className="before-head">
                <h6>Before</h6>
              </div>
              <div className="before-p">
                <p>Made a dashboard using React. It shows data and has charts. Used an API for the backend.</p>
              </div>
            </div>
            <div className="middle">
              <h6>Optimized by Genie</h6>
            </div>
            <div className="after">
              <div className="after-header">
                <h6>After</h6>
              </div>
              <div className="after-p">
                <p>Built a real-time analytics dashboard that transforms complex product data into clear,
                   actionable insights—using React, D3, and a scalable API architecture.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="showcase" id="showcase">
        <div className="showcase-content">
          <p className="showcase-eyebrow">Made for your next opportunity</p>
          <h2>Stop sending recruiters to<br className="showcase-break" /> a list of repositories.</h2>
          <p className="showcase-description">
            Build a focused portfolio that shows what you made, why it matters, and the developer you are becoming.
          </p>
          <a className="showcase-button" href="/CreatePortfolio">
            Build my portfolio free <ArrowIcon />
          </a>
        </div>
        <footer className="showcase-footer">
          <a href="/" aria-label="PortfolioGenie home" className="showcase-footer-logo">
            <Logo />
            <span>Portfolio<span>Genie</span></span>
          </a>
        </footer>
      </section>
  
    </main>
  </div>
)

export default Home
