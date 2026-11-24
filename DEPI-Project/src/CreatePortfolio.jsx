import favIconImg from './assets/favIconImg.jpg'
import {useState, useEffect, useRef} from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const DRAFT_KEY = 'portfolio-draft'
const SAVE_KEY = 'portfolio-saved'
const LAST_TEMPLATE_KEY = 'portfolio-last-template'
const PORTFOLIO_TEMPLATES = ['minimal', 'dark-dev', 'modern', 'terminal']

const requestApi = async (path, body) => {
  const options = body === undefined
    ? {}
    : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const result = await response.json()

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed with status ${response.status}`)
  }

  return result
}

const initialState = () => {
  return {
    currentStep: 1,
    githubUsername: '',
    projects: [],
    name: '',
    role: '',
    location: '',
    writingStyle: 'Thoughtful and minimal',
    about: ''
  }
}

const createProjectId = () => `project-${Date.now()}-${Math.random().toString(36).slice(2)}`

const createEmptyProject = () => ({
  id: createProjectId(),
  name: '',
  techStack: '',
  description: '',
  repoUrl: '',
  stars: 0,
})

const readStoredState = (key) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

const readPortfolioState = () => {
  const storedState = readStoredState(DRAFT_KEY) ?? readStoredState(SAVE_KEY)
  if (!storedState) return initialState()

  const projects = Array.isArray(storedState.projects)
    ? storedState.projects.map((project) => ({
        ...createEmptyProject(),
        ...project,
        id: project.id || createProjectId(),
      }))
    : storedState.projectName
      ? [{
          ...createEmptyProject(),
          name: storedState.projectName,
          techStack: storedState.techStack || '',
          description: storedState.description || '',
        }]
      : []

  return { ...initialState(), ...storedState, projects }
}

const CreatePortfolio = () => { 
  const [data, setData] = useState(readPortfolioState)

  const [saveStatus, setSavedStatus] = useState(() => {
   return localStorage.getItem(DRAFT_KEY) ? 'draft-saved' : 'saved';
  })
  const [pendingAction, setPendingAction] = useState('')
  const [actionFeedback, setActionFeedback] = useState(null)

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSavedStatus('saving-draft');

    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      setSavedStatus('draft-saved');
    }, 500);

    return () => clearTimeout(timer);
  }, [data]);

  const getStatusLabel = () => {
    if (saveStatus === 'saving-draft') return 'Saving draft...';
    if (saveStatus === 'draft-saved') return 'Draft saved';
    return 'All changes saved';
  };

  const saveChanges = () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    localStorage.removeItem(DRAFT_KEY);
    setSavedStatus('saved');
  };

  const buildPortfolio = async () => {
    const fullName = data.name.trim()
    const roleTitle = data.role.trim()
    const githubUsername = data.githubUsername.trim()
    const bio = data.about.trim()

    if (!fullName || !roleTitle || !githubUsername) {
      setActionFeedback({
        type: 'error',
        message: 'Add your name, role, and GitHub username before building.',
      })
      return
    }

    const projects = data.projects
      .filter((project) => typeof project.name === 'string' && project.name.trim())
      .map((project) => {
        const techStack = Array.isArray(project.techStack)
          ? project.techStack.map((item) => item.trim()).filter(Boolean)
          : typeof project.techStack === 'string'
            ? project.techStack.split(',').map((item) => item.trim()).filter(Boolean)
            : []

        return {
          name: project.name.trim(),
          description: project.description || '',
          optimizedDescription: project.optimizedDescription || '',
          techStack,
          repoUrl: project.repoUrl || '',
          liveUrl: project.liveUrl || '',
          stars: Number.isFinite(project.stars) ? project.stars : 0,
        }
      })
    const skills = [...new Set(projects.flatMap((project) => project.techStack))]
      .map((name) => ({ name, category: 'Other' }))

    setPendingAction('build')
    setActionFeedback(null)

    try {
      const savedThemeConfig = readStoredState(SAVE_KEY)?.themeConfig
      const lastTemplate = localStorage.getItem(LAST_TEMPLATE_KEY)
      const rememberedTemplate = PORTFOLIO_TEMPLATES.includes(lastTemplate)
        ? lastTemplate
        : savedThemeConfig?.template
      const previousTemplate = PORTFOLIO_TEMPLATES.includes(rememberedTemplate) ? rememberedTemplate : ''
      const aiResult = await requestApi('/api/ai/build-portfolio', {
        fullName,
        roleTitle,
        location: data.location.trim(),
        writingStyle: data.writingStyle,
        currentBio: bio,
        previousTemplate,
        projects: projects.map(({ name, description, techStack }) => ({
          name,
          description,
          techStack,
        })),
      })
      const generated = aiResult.data
      const generatedBio = typeof generated?.aboutMe === 'string' ? generated.aboutMe.trim() : ''

      if (
        !generatedBio ||
        typeof generated.headline !== 'string' ||
        !generated.headline.trim() ||
        !generated.themeConfig
      ) {
        throw new Error('The AI did not return a complete portfolio. Please try again.')
      }

      const aiTemplate = PORTFOLIO_TEMPLATES.includes(generated.themeConfig.template)
        ? generated.themeConfig.template
        : 'modern'
      const template = previousTemplate && aiTemplate === previousTemplate
        ? PORTFOLIO_TEMPLATES[(PORTFOLIO_TEMPLATES.indexOf(previousTemplate) + 1) % PORTFOLIO_TEMPLATES.length]
        : aiTemplate
      const generatedThemeConfig = { ...generated.themeConfig, template }
      const generatedProjects = projects.map((project, index) => ({
        ...project,
        optimizedDescription: generated.projectDescriptions?.[index]
          || project.optimizedDescription
          || project.description,
      }))
      const generatedSkills = [...new Set(generatedProjects.flatMap((project) => project.techStack))]
        .map((name) => ({ name, category: 'Other' }))

      const result = await requestApi('/api/portfolios', {
        fullName,
        roleTitle,
        location: data.location.trim(),
        githubUsername,
        writingStyle: data.writingStyle,
        bio: generatedBio,
        headline: generated.headline,
        skills: generatedSkills,
        socialLinks: {
          github: `https://github.com/${githubUsername}`,
        },
        themeConfig: generatedThemeConfig,
        seoMetadata: {
          metaTitle: `${fullName} | Portfolio`,
          metaDescription: generatedBio.slice(0, 160),
          keywords: generatedSkills.map((skill) => skill.name),
        },
        projects: generatedProjects,
      })

      if (!result.data?.slug) {
        throw new Error('The server did not return a portfolio URL.')
      }

      let generatedProjectIndex = 0
      const savedState = {
        ...data,
        about: generatedBio,
        themeConfig: generatedThemeConfig,
        projects: data.projects.map((project) => {
          if (!project.name?.trim()) return project
          const generatedProject = generatedProjects[generatedProjectIndex]
          generatedProjectIndex += 1
          return {
            ...project,
            optimizedDescription: generatedProject?.optimizedDescription || project.optimizedDescription,
          }
        }),
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(savedState))
      localStorage.setItem(LAST_TEMPLATE_KEY, generatedThemeConfig.template)
      localStorage.removeItem(DRAFT_KEY)
      setSavedStatus('saved')
      window.location.assign(`/portfolio/${encodeURIComponent(result.data.slug)}`)
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not build the portfolio.',
      })
    } finally {
      setPendingAction('')
    }
  }

  const updateProject = (projectId, field, value) => {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId ? { ...project, [field]: value } : project,
      ),
    }))
  }

  const addProject = () => {
    setData((current) => ({
      ...current,
      projects: [...current.projects, createEmptyProject()],
    }))
  }

  const removeProject = (projectId) => {
    setData((current) => ({
      ...current,
      projects: current.projects.filter((project) => project.id !== projectId),
    }))
  }

  const runRequest = async (action, path, body, onSuccess, successMessage) => {
    setPendingAction(action)
    setActionFeedback(null)

    try {
      const result = await requestApi(path, body)
      if (onSuccess) onSuccess(result)
      setActionFeedback({
        type: 'success',
        message: typeof successMessage === 'function' ? successMessage(result) : successMessage,
      })
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'The request failed.',
      })
    } finally {
      setPendingAction('')
    }
  }

  const analyzeProfile = () => {
    const username = data.githubUsername.trim()
    if (!username) {
      setActionFeedback({ type: 'error', message: 'Enter a GitHub username first.' })
      return
    }

    runRequest(
      'github',
      `/api/github/${encodeURIComponent(username)}`,
      undefined,
      (result) => {
        const latestRepos = (Array.isArray(result.repos) ? [...result.repos] : [])
          .sort((a, b) =>
            (Date.parse(b.updated_at || '') || 0) - (Date.parse(a.updated_at || '') || 0),
          )
          .slice(0, 3)
        const importedProjects = latestRepos.map((repo) => {
          const repoId = repo.id ?? repo.html_url ?? repo.name
          const projectId = `github-${repoId}`
          const existingProject = data.projects.find((project) => project.id === projectId)

          return {
            ...createEmptyProject(),
            ...existingProject,
            id: projectId,
            githubRepoId: repoId,
            name: repo.name,
            techStack: existingProject?.techStack || repo.language || '',
            description: existingProject?.description || repo.description || '',
            repoUrl: repo.html_url,
            stars: repo.stargazers_count || 0,
          }
        })

        setData((current) => ({
          ...current,
          githubUsername: username,
          name: current.name || result.profile?.name || '',
          location: current.location || result.profile?.location || '',
          projects: [
            ...importedProjects,
            ...current.projects.filter((project) => !project.githubRepoId),
          ],
        }))
      },
      (result) => {
        const importedCount = Math.min(Array.isArray(result.repos) ? result.repos.length : 0, 3)
        return importedCount
          ? `Imported the ${importedCount} most recently updated repositories. Add or edit projects in the next step.`
          : `No public repositories found for ${username}. You can add projects manually in the next step.`
      },
    )
  }

  const optimizeProjectDescription = (projectId) => {
    const project = data.projects.find((item) => item.id === projectId)
    if (!project || typeof project.name !== 'string' || !project.name.trim()) {
      setActionFeedback({ type: 'error', message: 'Enter a project name before generating a description.' })
      return
    }

    runRequest(
      `description-${projectId}`,
      '/api/ai/optimize-project-description',
      {
        projectName: project.name,
        techStack: project.techStack.split(',').map((item) => item.trim()).filter(Boolean),
        description: project.description,
      },
      (result) => {
        updateProject(projectId, 'description', result.data.optimizedDescription)
      },
      'Project description improved.',
    )
  }

  const generateAbout = () => {
    runRequest(
      'about',
      '/api/ai/generate-about',
      {
        fullName: data.name,
        roleTitle: data.role,
        location: data.location,
        writingStyle: data.writingStyle,
        currentBio: data.about,
        projects: data.projects.map((project) => ({
          name: project.name,
          techStack: project.techStack.split(',').map((item) => item.trim()).filter(Boolean),
        })),
      },
      (result) => {
        setData((current) => ({ ...current, about: result.data.aboutMe }))
      },
      'About section generated.',
    )
  }

  return (
    <div className="create-portfolio">
      <header className="portfolio-header">
        <a href="/" aria-label="PortfolioGenie home" className="create-portfolio-header-logo">
          <img src={favIconImg} alt="PortfolioGenie logo" className="create-portfolio-logo" />
          <span>Portfolio<span style={{color: '#2867e8'}}>Genie</span></span>
        </a>
        <nav className="portfolio-nav" aria-label="Portfolio actions">
          <span className="save-status">{getStatusLabel()}</span>
          <a className="preview-button" href="/preview">Preview</a>
          <button type="button" className="save-button" onClick={saveChanges}>Save</button>
        </nav>
      </header>
      <main className="portfolio-builder">
        <aside className="portfolio-sidebar">
          <p className="sidebar-label">Your portfolio</p>
          <ol className="step-list">
            {[1, 2, 3].map((step) => (
              <li
                key={step}
                className={data.currentStep === step ? 'active' : data.currentStep > step ? 'complete' : ''}
              >
                <button type="button" onClick={() => setData({...data, currentStep: step})}>
                  <span className="step-number">{data.currentStep > step ? '✓' : `0${step}`}</span>
                  <span>
                    <strong>{step === 1 ? 'Connect GitHub' : step === 2 ? 'Shape your projects' : 'Make it yours'}</strong>
                    <small>{step === 1 ? 'Import your best work' : step === 2 ? 'Tell a stronger story' : 'Add your voice'}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="genie-tip">
            <span className="tip-icon" aria-hidden="true">✦</span>
            <strong>Genie tip</strong>
            <p>Your repository must have <b>README.md</b>.</p>
          </div>
        </aside>

        <section className="portfolio-content">
          {data.currentStep === 1 && (
            <div className="step-content">
              <p className="step-eyebrow">STEP 1 OF 3</p>
              <h1>Let's find your <span>best work.</span></h1>
              <p className="step-description">Connect your GitHub profile. Genie analyzes public activity to surface the projects and skills that make you stand out.</p>
              <div className="github-card">
                <label htmlFor="githubUsername">GitHub username</label>
                <div className="github-input-row">
                  <div className="github-input">
                    <span>github.com/</span>
                    <input
                      id="githubUsername"
                      type="text"
                      placeholder="username"
                      value={data.githubUsername}
                      onChange={(e) => setData({...data, githubUsername: e.target.value})}
                    />
                  </div>
                  <button
                    type="button"
                    className="analyze-button"
                    onClick={analyzeProfile}
                    disabled={Boolean(pendingAction)}
                  >
                    {pendingAction === 'github' ? 'Analyzing...' : '✦ Analyze profile'}
                  </button>
                </div>
                <small>We only read public profile data. No GitHub password required.</small>
              </div>
            </div>
          )}

          {data.currentStep === 2 && (
            <div className="step-content">
              <p className="step-eyebrow">STEP 2 OF 3</p>
              <h1>Turn your code into a <span>great story.</span></h1>
              <p className="step-description">Add context to your strongest builds. Genie improves clarity, impact, and search visibility without losing your voice.</p>
              <div className="form-card">
                {data.projects.length ? (
                  <div className="project-list">
                    {data.projects.map((project, index) => (
                      <article className="project-editor" key={project.id}>
                        <div className="project-editor-heading">
                          <h2>Project {index + 1}</h2>
                          {project.repoUrl && (
                            <a href={project.repoUrl} target="_blank" rel="noreferrer">View repository</a>
                          )}
                          <button type="button" className="remove-project-button" onClick={() => removeProject(project.id)}>
                            Remove
                          </button>
                        </div>
                        <div className="form-grid">
                          <label>Project name<input value={project.name} onChange={(e) => updateProject(project.id, 'name', e.target.value)} /></label>
                          <label>Tech stack<input value={project.techStack} onChange={(e) => updateProject(project.id, 'techStack', e.target.value)} placeholder="React, Node.js" /></label>
                          <label className="full-width">Description<textarea value={project.description} onChange={(e) => updateProject(project.id, 'description', e.target.value)} /></label>
                        </div>
                        <button
                          type="button"
                          className="analyze-button ai-action-button"
                          onClick={() => optimizeProjectDescription(project.id)}
                          disabled={Boolean(pendingAction)}
                        >
                          {pendingAction === `description-${project.id}` ? 'Improving...' : '✦ Improve description with AI'}
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="empty-projects-message">No projects yet. Add one manually or go back to analyze your GitHub profile.</p>
                )}
                <button type="button" className="add-project-button" onClick={addProject}>
                  + Add project
                </button>
              </div>
            </div>
          )}

          {data.currentStep === 3 && (
            <div className="step-content">
              <p className="step-eyebrow">STEP 3 OF 3</p>
              <h1>Now, make it sound <span>like you.</span></h1>
              <p className="step-description">Add a few personal details, then AI will create your introduction, project summaries, headline, and visual direction. Consecutive builds use different templates. Building uses one AI request, so free-tier daily limits apply.</p>
              <div className="form-card">
                <div className="form-grid">
                  <label>Your name<input value={data.name} onChange={(e) => setData({...data, name: e.target.value})} /></label>
                  <label>Your role<input value={data.role} onChange={(e) => setData({...data, role: e.target.value})} /></label>
                  <label>Location<input value={data.location} onChange={(e) => setData({...data, location: e.target.value})} /></label>
                  <label>Writing style
                    <select value={data.writingStyle} onChange={(e) => setData({...data, writingStyle: e.target.value})}>
                      <option>Thoughtful and minimal</option>
                      <option>Friendly and energetic</option>
                      <option>Technical and precise</option>
                    </select>
                  </label>
                  <label className="full-width">About me<textarea value={data.about} onChange={(e) => setData({...data, about: e.target.value})} /></label>
                </div>
                <button
                  type="button"
                  className="analyze-button ai-action-button"
                  onClick={generateAbout}
                  disabled={Boolean(pendingAction)}
                >
                  {pendingAction === 'about' ? 'Generating...' : '✦ Generate About me with AI'}
                </button>
              </div>
            </div>
          )}

          {actionFeedback && (
            <p className={`action-feedback ${actionFeedback.type}`} role={actionFeedback.type === 'error' ? 'alert' : 'status'}>
              {actionFeedback.message}
            </p>
          )}

          <div className="step-actions">
            {data.currentStep > 1 && <button type="button" className="back-button" onClick={() => setData({...data, currentStep: data.currentStep - 1})}>← Back</button>}
            {data.currentStep < 3
              ? <button type="button" className="continue-button" onClick={() => setData({...data, currentStep: data.currentStep + 1})}>Continue →</button>
              : (
                <button
                  type="button"
                  className="continue-button"
                  onClick={buildPortfolio}
                  disabled={Boolean(pendingAction)}
                >
                  {pendingAction === 'build' ? 'AI is building...' : 'Build my portfolio with AI →'}
                </button>
              )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default CreatePortfolio