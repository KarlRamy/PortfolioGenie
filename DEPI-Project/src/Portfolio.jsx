import { useEffect, useState } from 'react';
import './Portfolio.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PortfolioPage({ slug }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`${API_BASE_URL}/api/portfolios/${slug}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Portfolio not found');
        }

        setPortfolio(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPortfolio();
    }
  }, [slug]);

  if (loading) {
    return <main className="portfolio-state">Loading portfolio...</main>;
  }

  if (error || !portfolio) {
    return (
      <main className="portfolio-state">
        <p>{error || 'Portfolio not found'}</p>
        <a href="/">
          Create your own portfolio
        </a>
      </main>
    );
  }

  const {
    fullName,
    roleTitle,
    location,
    bio,
    headline,
    skills = [],
    projects = [],
    socialLinks = {},
    githubUsername,
    themeConfig = {},
  } = portfolio;

  const allowedTemplates = ['modern', 'minimal', 'dark-dev', 'terminal'];
  const template = allowedTemplates.includes(themeConfig.template) ? themeConfig.template : 'modern';
  const primaryColor = /^#[\da-f]{6}$/i.test(themeConfig.primaryColor || '')
    ? themeConfig.primaryColor
    : '#2867e8';

  return (
    <main
      className={`generated-portfolio theme-${template}`}
      style={{ '--portfolio-accent': primaryColor }}
    >
      <div className="generated-portfolio__inner">
        <header className="generated-portfolio__hero">
          <div className="generated-portfolio__topline">
            <span>PortfolioGenie</span>
            {location && <span>{location}</span>}
          </div>
          <p className="generated-portfolio__eyebrow">{roleTitle || 'Developer portfolio'}</p>
          <h1>{fullName}</h1>
          {headline && <p className="generated-portfolio__headline">{headline}</p>}
          <nav className="generated-portfolio__links" aria-label="Profile links">
            {githubUsername && (
              <a href={`https://github.com/${githubUsername}`} target="_blank" rel="noreferrer">GitHub</a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            )}
            {(socialLinks.website || socialLinks.portfolioUrl) && (
              <a href={socialLinks.website || socialLinks.portfolioUrl} target="_blank" rel="noreferrer">Website</a>
            )}
            {socialLinks.email && <a href={`mailto:${socialLinks.email}`}>Email</a>}
          </nav>
          <span className="generated-portfolio__glow" aria-hidden="true" />
        </header>

        <section className="generated-portfolio__section">
          <p className="generated-portfolio__eyebrow">Introduction</p>
          <h2>About me</h2>
          <p className="generated-portfolio__bio">{bio}</p>
        </section>

        {skills.length > 0 && (
          <section className="generated-portfolio__section">
            <p className="generated-portfolio__eyebrow">Tools of the trade</p>
            <h2>Skills</h2>
            <div className="generated-portfolio__skills">
              {skills.map((skill, index) => (
                <span key={`${skill.name || skill}-${index}`}>{skill.name || skill}</span>
              ))}
            </div>
          </section>
        )}

        <section className="generated-portfolio__section">
          <p className="generated-portfolio__eyebrow">Selected work</p>
          <h2>Projects</h2>
          {projects.length === 0 ? (
            <p className="generated-portfolio__muted">No projects added yet.</p>
          ) : (
            <div className="generated-portfolio__projects">
              {projects.map((project) => {
                const description = project.optimizedDescription || project.description;
                const techStack = Array.isArray(project.techStack)
                  ? project.techStack
                  : typeof project.techStack === 'string'
                    ? project.techStack.split(',').map((tech) => tech.trim()).filter(Boolean)
                    : [];

                return (
                  <article className="generated-portfolio__project" key={project._id || project.name}>
                    <div className="generated-portfolio__project-title">
                      <h3>{project.name}</h3>
                      {typeof project.stars === 'number' && project.stars > 0 && (
                        <span>★ {project.stars}</span>
                      )}
                    </div>
                    {description && <p>{description}</p>}
                    {techStack.length > 0 && (
                      <div className="generated-portfolio__skills">
                        {techStack.map((tech, index) => <span key={`${tech}-${index}`}>{tech}</span>)}
                      </div>
                    )}
                    <div className="generated-portfolio__project-links">
                      {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noreferrer">View code ↗</a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noreferrer">Live demo ↗</a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="generated-portfolio__footer">
          <span>{fullName}</span>
          <span>Built with PortfolioGenie</span>
        </footer>
      </div>
    </main>
  );
}