import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Eventos',     href: '#eventos'    },
  { label: 'YAML',        href: '#yaml'       },
  { label: 'Secrets',     href: '#secrets'    },
  { label: 'Pruebas',     href: '#pruebas'    },
  { label: 'Marketplace', href: '#marketplace'},
  { label: 'Deploy',      href: '#deploy'     },
]

function WaveText({ text }) {
  return (
    <span className="wave-text" aria-label={text}>
      {[...text].map((char, i) => (
        <span key={i} className="wave-char" style={{ '--i': i }} aria-hidden="true">
          <span className="wave-char-inner">
            <span>{char === ' ' ? ' ' : char}</span>
            <span>{char === ' ' ? ' ' : char}</span>
          </span>
        </span>
      ))}
    </span>
  )
}

/* GitHub Primer octicon — mark-github */
function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
               0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
               -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
               .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
               -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
               .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
               .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
               0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8
               c0-4.42-3.58-8-8-8z"/>
    </svg>
  )
}

/* Animated "workflow running" badge */
function WorkflowBadge() {
  return (
    <span className="nav-workflow-badge">
      <span className="dot-live" aria-hidden="true" />
      workflow running
    </span>
  )
}

export default function Nav() {
  const [active, setActive] = useState('')

  /* Track active section via IntersectionObserver */
  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.slice(1))
    const observers = []

    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-40% 0px -55% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <nav className="nav" aria-label="Navegación principal">
      <div className="nav-inner container">

        {/* Left — logo + name */}
        <a href="#" className="nav-logo" aria-label="Inicio">
          <GitHubIcon />
          <span className="nav-sep" aria-hidden="true" />
          <span className="nav-brand">GitHub Actions.</span>
        </a>

        {/* Center — anchor links */}
        <ul className="nav-links" role="list">
          {NAV_LINKS.map(({ label, href }) => {
            const id = href.slice(1)
            return (
              <li key={href}>
                <a
                  href={href}
                  className={`nav-link${active === id ? ' nav-link--active' : ''}`}
                >
                  <WaveText text={label} />
                </a>
              </li>
            )
          })}
        </ul>

        {/* Right — live badge */}
        <WorkflowBadge />
      </div>
    </nav>
  )
}
