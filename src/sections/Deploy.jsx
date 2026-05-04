import { Fragment, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import useScrollReveal from '../hooks/useScrollReveal'

const EASE = [0.22, 1, 0.36, 1]

const wordV = {
  hidden: { y: '110%' },
  visible: i => ({
    y: 0,
    transition: { duration: 0.75, ease: EASE, delay: 0.1 + i * 0.09 },
  }),
}

const HEADLINE_WORDS = [
  { text: 'Push.',  green: false, br: false },
  { text: 'Test.',  green: false, br: true  },
  { text: 'Live.',  green: true,  br: true  },
]

const BENEFITS = [
  'Sin servidor de CI que mantener — GitHub provisiona y destruye el runner automáticamente.',
  'HTTPS automático con CloudFront: certificados gestionados y caché global en cada edge.',
  'Costo casi cero — S3 cobra por byte almacenado, no por servidor activo las 24 horas.',
  'El pipeline vive en el mismo repo: el workflow está versionado junto con el código.',
]

const INFRA_NODES = [
  { label: 'dev push',      sub: 'git push origin', icon: 'code',         cls: 'green'  },
  { label: 'runner',        sub: 'ubuntu-latest',   icon: 'play',         cls: 'yellow' },
  { label: 'build + test',  sub: 'npm run build',   icon: 'check-circle', cls: 'blue'   },
  { label: 'S3 bucket',     sub: 's3://site',       icon: 'package',      cls: 'orange' },
  { label: 'CloudFront',    sub: 'CDN global',      icon: 'container',    cls: 'blue'   },
  { label: 'Live HTTPS',    sub: 'edge cache',      icon: 'shield-check', cls: 'green'  },
]

// ─── SVG icons ─────────────────────────────────────────────────────────────
function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M9.504.43a.75.75 0 0 1 .396.997L7.99 7.5h5.56a.75.75 0 0 1 .512 1.31l-9 8.5a.75.75 0 0 1-1.223-.65l.991-5.9H1a.75.75 0 0 1-.725-.944l2.5-10.5A.75.75 0 0 1 3.5 0h6a.75.75 0 0 1 .004 0Zm-7.357 9h2.29a.75.75 0 0 1 .745.835l-.734 4.372 6.204-5.863H7.5a.75.75 0 0 1-.696-1.037L8.803 2.5h-5.1Z" />
    </svg>
  )
}

const DIAGRAM_PATHS = {
  'code': (
    <path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06Z" />
  ),
  'play': (
    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z" />
  ),
  'check-circle': (
    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm3.78 5.22-4.53 4.53-1.53-1.53a.75.75 0 0 0-1.06 1.06l2.06 2.06a.75.75 0 0 0 1.06 0l5.06-5.06a.75.75 0 0 0-1.06-1.06Z" />
  ),
  'package': (
    <path d="m8.878.392 5.25 3.045c.54.314.872.89.872 1.514v6.098a1.75 1.75 0 0 1-.872 1.514l-5.25 3.045a1.75 1.75 0 0 1-1.756 0l-5.25-3.045A1.75 1.75 0 0 1 1 11.049V4.951c0-.624.332-1.2.872-1.514L7.122.392a1.75 1.75 0 0 1 1.756 0ZM7.875 1.69l-4.63 2.685L8 7.133l4.755-2.758-4.63-2.685a.25.25 0 0 0-.25 0ZM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432Zm6.25 8.271 4.625-2.683a.25.25 0 0 0 .125-.216V5.677L8.75 8.432Z" />
  ),
  'container': (
    <path d="M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v4c0 .372-.116.717-.314 1 .198.283.314.628.314 1v4a1.75 1.75 0 0 1-1.75 1.75H1.75A1.75 1.75 0 0 1 0 12.75v-4c0-.372.116-.717.314-1A1.755 1.755 0 0 1 0 6.75v-4C0 1.784.784 1 1.75 1ZM1.5 6.75v4c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-4a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25Zm12.5-1.5a.25.25 0 0 0 .25-.25v-4a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v4c0 .138.112.25.25.25ZM7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM3.75 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8.5 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-4.75 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
  ),
  'shield-check': (
    <path d="M7.467.133a1.748 1.748 0 0 1 1.066 0l5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.697 1.697 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667Zm.61 1.429a.25.25 0 0 0-.153 0l-5.25 1.68a.25.25 0 0 0-.174.238V7c0 1.358.275 2.666 1.057 3.86.784 1.194 2.121 2.34 4.366 3.297a.196.196 0 0 0 .154 0c2.245-.956 3.582-2.104 4.366-3.298C13.225 9.666 13.5 8.36 13.5 7V3.48a.25.25 0 0 0-.174-.237ZM11.28 6.78l-3.5 3.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 1.06-1.06l.97.97 2.97-2.97a.75.75 0 0 1 1.06 1.06Z" />
  ),
}

function DiagramIcon({ name }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      {DIAGRAM_PATHS[name]}
    </svg>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function Deploy() {
  const headlineRef = useRef(null)
  const headlineInView = useInView(headlineRef, { amount: 0.4, once: true })

  const { ref: colsRef, isInView: colsInView } = useScrollReveal({ threshold: 0.1 })

  return (
    <section id="deploy" className="section deploy-section">
      <div className="deploy-bg-glow" aria-hidden="true" />

      <div className="container">
        <div className="section-cols" ref={colsRef}>

          {/* Columna izquierda */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={colsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="section-eyebrow">El resultado</span>

            {/* Título cinemático */}
            <motion.h2
              ref={headlineRef}
              className="deploy-headline"
              style={{ marginTop: 'var(--space-3)' }}
              initial="hidden"
              animate={headlineInView ? 'visible' : 'hidden'}
              aria-label="Push. Test. Live."
            >
              {HEADLINE_WORDS.map(({ text, green, br }, i) => {
                const spaceAfter =
                  i < HEADLINE_WORDS.length - 1 && !HEADLINE_WORDS[i + 1].br
                return (
                  <span key={text}>
                    {br && <br />}
                    <span className={`hw-clip${green ? ' hw-clip--green' : ''}`}>
                      <motion.span className="hw" variants={wordV} custom={i}>
                        {text}
                      </motion.span>
                    </span>
                    {spaceAfter && ' '}
                  </span>
                )
              })}
            </motion.h2>

            {/* Beneficios */}
            <ul className="deploy-benefits">
              {BENEFITS.map((text, i) => (
                <li key={i} className="deploy-benefit">
                  <span className="deploy-benefit-icon"><CheckIcon size={13} /></span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Badge de tiempo */}
            <div className="deploy-time-badge">
              <ZapIcon />
              ~90s de push a producción
            </div>
          </motion.div>

          {/* Columna derecha */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={colsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
          >
            {/* Run card */}
            <div className="run-card">
              <div className="run-card-header">
                <div className="run-card-title">
                  <span className="dot-live" aria-hidden="true" />
                  Deploy to AWS S3 + CloudFront
                </div>
                <div className="run-card-meta-row">
                  <span className="run-card-meta">
                    push · main · Melo088 · 1m 34s ago
                  </span>
                  <span className="badge badge--green">
                    <CheckIcon size={11} />
                    success
                  </span>
                </div>
              </div>

              <div className="run-card-body">
                <p className="run-jobs-label">Jobs</p>
                <div className="run-job">
                  <span className="run-job-icon"><CheckIcon size={14} /></span>
                  <span className="run-job-name">Run Tests</span>
                  <span className="run-job-time">42s</span>
                </div>
                <div className="run-job">
                  <span className="run-job-icon"><CheckIcon size={14} /></span>
                  <span className="run-job-name">Deploy to S3</span>
                  <span className="run-job-time">52s</span>
                </div>
              </div>
            </div>

            {/* Diagrama de infraestructura */}
            <div className="deploy-diagram">
              {INFRA_NODES.map((node, i) => (
                <Fragment key={node.label}>
                  {i > 0 && (
                    <div className="deploy-diagram-arrow" aria-hidden="true">→</div>
                  )}
                  <div className={`deploy-node deploy-node--${node.cls}`}>
                    <div className="deploy-node-icon">
                      <DiagramIcon name={node.icon} />
                    </div>
                    <span className="deploy-node-label">{node.label}</span>
                    <span className="deploy-node-sub">{node.sub}</span>
                  </div>
                </Fragment>
              ))}
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}
