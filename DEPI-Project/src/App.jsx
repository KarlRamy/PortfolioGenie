import './App.css'
import Home from './Home.jsx'
import CreatePortfolio from './CreatePortfolio.jsx'
import PortfolioPage from './Portfolio.jsx'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/CreatePortfolio' || path === '/preview') {
    return <CreatePortfolio />
  }

  const portfolioMatch = path.match(/^\/portfolio\/([^/]+)$/)
  if (portfolioMatch) {
    return <PortfolioPage slug={portfolioMatch[1]} />
  }

  return <Home />
}

export default App
