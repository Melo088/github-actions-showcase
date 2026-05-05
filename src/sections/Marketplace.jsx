import { motion } from 'framer-motion'
import { MARKETPLACE_ACTIONS } from '../data/marketplace'
import CodeBlock from '../components/CodeBlock'
import useScrollReveal from '../hooks/useScrollReveal'

const EASE = [0.22, 1, 0.36, 1]

const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardV = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const USES_SNIPPET = `- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: '20'
- uses: aws-actions/configure-aws-credentials@v4`

function shortName(full) {
  return full.includes('/') ? full.split('/').pop() : full
}

const ICON_PATHS = {
  'repo-clone': (
    <path d="M9.75 3h4.5a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25H9.75a.75.75 0 0 1 0-1.5h3.75V4.5H9.75a.75.75 0 0 1 0-1.5Zm-7.5 9.5H5.5V4.5H2.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25Zm0 1.5A1.75 1.75 0 0 1 .5 12.25v-7.5C.5 3.784 1.284 3 2.25 3H6.5a.75.75 0 0 1 .75.75v10a.75.75 0 0 1-.75.75ZM8 12.75a.75.75 0 0 0 1.5 0v-9.5A.75.75 0 0 0 8 3.5Z" />
  ),
  'package': (
    <path d="m8.878.392 5.25 3.045c.54.314.872.89.872 1.514v6.098a1.75 1.75 0 0 1-.872 1.514l-5.25 3.045a1.75 1.75 0 0 1-1.756 0l-5.25-3.045A1.75 1.75 0 0 1 1 11.049V4.951c0-.624.332-1.2.872-1.514L7.122.392a1.75 1.75 0 0 1 1.756 0ZM7.875 1.69l-4.63 2.685L8 7.133l4.755-2.758-4.63-2.685a.25.25 0 0 0-.25 0ZM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432Zm6.25 8.271 4.625-2.683a.25.25 0 0 0 .125-.216V5.677L8.75 8.432Z" />
  ),
  'key': (
    <path d="M10.5 0a5.499 5.499 0 1 1-1.288 10.848l-.932.932a.749.749 0 0 1-.53.22H7v.75a.749.749 0 0 1-.22.53l-.5.5a.749.749 0 0 1-.53.22H5v.75a.749.749 0 0 1-.22.53l-.5.5a.749.749 0 0 1-.53.22h-2a.75.75 0 0 1-.75-.75v-2.19c0-.199.079-.39.22-.53l5.185-5.185A5.501 5.501 0 0 1 10.5 0Zm-4 5.5c-.001.431.069.86.205 1.274L2.22 11.264a.25.25 0 0 0-.073.177V13h1.19l.5-.5V11.75a.75.75 0 0 1 .75-.75h.75V9.75a.75.75 0 0 1 .75-.75h.904l.63-.63a5.503 5.503 0 0 1-.124-.117l-.195-.21a.75.75 0 0 1 1.09-1.027l.185.196A4 4 0 1 0 6.5 5.5Z" />
  ),
  'container': (
    <path d="M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v4c0 .372-.116.717-.314 1 .198.283.314.628.314 1v4a1.75 1.75 0 0 1-1.75 1.75H1.75A1.75 1.75 0 0 1 0 12.75v-4c0-.372.116-.717.314-1A1.755 1.755 0 0 1 0 6.75v-4C0 1.784.784 1 1.75 1ZM1.5 6.75v4c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-4a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25Zm12.5-1.5a.25.25 0 0 0 .25-.25v-4a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v4c0 .138.112.25.25.25ZM7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM3.75 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8.5 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-4.75 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
  ),
  'shield-check': (
    <path d="M7.467.133a1.748 1.748 0 0 1 1.066 0l5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.697 1.697 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667Zm.61 1.429a.25.25 0 0 0-.153 0l-5.25 1.68a.25.25 0 0 0-.174.238V7c0 1.358.275 2.666 1.057 3.86.784 1.194 2.121 2.34 4.366 3.297a.196.196 0 0 0 .154 0c2.245-.956 3.582-2.104 4.366-3.298C13.225 9.666 13.5 8.36 13.5 7V3.48a.25.25 0 0 0-.174-.237ZM11.28 6.78l-3.5 3.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 1.06-1.06l.97.97 2.97-2.97a.75.75 0 0 1 1.06 1.06Z" />
  ),
  'tag': (
    <path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
  ),
}

function ActionIcon({ name }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 11.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  )
}

export default function Marketplace() {
  const { ref: headerRef, isInView: headerInView } = useScrollReveal({ threshold: 0.15 })

  return (
    <section id="marketplace" className="section marketplace-section">
      <div className="container">

        {/* Encabezado centrado con intro y snippet de uses: */}
        <motion.div
          ref={headerRef}
          className="marketplace-header"
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="section-eyebrow">Marketplace</span>
          <h2
            className="section-title"
            style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}
          >
            Ecosistema & Abstracción de Lógica
          </h2>
          <p className="marketplace-intro-text">
            El Marketplace de GitHub permite la integración de lógica versionada mediante la directiva <code className="token">uses:</code>. 
            Esto elimina la redundancia en la configuración del runtime, permitiendo que el runner aprovisione dependencias y credenciales de forma externa y segura.
          </p>
          <div className="marketplace-intro-code">
            <CodeBlock filename=".github/workflows/deploy.yml" language="yaml">
              {USES_SNIPPET}
            </CodeBlock>
          </div>
        </motion.div>

        {/* Grid de 3 columnas con stagger */}
        <motion.div
          className="marketplace-grid"
          variants={containerV}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {MARKETPLACE_ACTIONS.map(action => (
            <motion.div
              key={action.name}
              className="marketplace-card"
              variants={cardV}
            >
              <div className="marketplace-card-top">
                <div className="marketplace-avatar">
                  <ActionIcon name={action.icon} />
                </div>
                <div className="marketplace-meta">
                  <code className="marketplace-name">{shortName(action.name)}</code>
                  <span className="marketplace-author">{action.author}</span>
                </div>
              </div>

              <p className="marketplace-desc">{action.description}</p>

              <div className="marketplace-footer">
                <span className="marketplace-stars">
                  <StarIcon />
                  {action.stars}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
