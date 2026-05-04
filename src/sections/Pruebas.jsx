import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import CodeBlock from '../components/CodeBlock'
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
  { text: 'Tests',     green: false, br: false },
  { text: 'primero,',  green: false, br: false },
  { text: 'deploy',    green: true,  br: true  },
  { text: 'después.',  green: false, br: false },
]

const JEST_SNIPPET = `// src/utils/sum.test.js
describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })

  it('returns 0 with no args', () => {
    expect(sum()).toBe(0)
  })
})`

const ACTIONS_SNIPPET = `test:
  name: Run Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm test`

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 4a2.5 2.5 0 0 0-5 0v2h5Z" />
    </svg>
  )
}

export default function Pruebas() {
  const headlineRef = useRef(null)
  const headlineInView = useInView(headlineRef, { amount: 0.3, once: true })

  const { ref: cardsRef, isInView: cardsInView } = useScrollReveal({ threshold: 0.15 })
  const { ref: codeRef, isInView: codeInView } = useScrollReveal({ threshold: 0.1 })

  return (
    <section id="pruebas" className="section pruebas-section">
      <div className="container">

        {/* Header centrado — eyebrow + título cinemático + subtítulo */}
        <div className="pruebas-header">
          <motion.span
            className="section-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Automatización de pruebas
          </motion.span>

          <motion.h2
            ref={headlineRef}
            className="pruebas-headline"
            initial="hidden"
            animate={headlineInView ? 'visible' : 'hidden'}
            aria-label="Tests primero, deploy después."
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

          <motion.p
            className="pruebas-sub"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
          >
            El job de <code className="token">test</code> actúa como guardián del pipeline.
            Si algún test falla, GitHub Actions marca el job de <code className="token">deploy</code> como{' '}
            <em>skipped</em> y el código nunca llega a producción.
          </motion.p>
        </div>

        {/* Cards comparativas */}
        <div className="pruebas-cards" ref={cardsRef}>

          {/* Card — PASSING */}
          <motion.div
            className="pruebas-card pruebas-card--pass"
            initial={{ opacity: 0, y: 32 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="pruebas-card-header">
              <span className="pruebas-icon pruebas-icon--pass"><CheckIcon /></span>
              Tests passing
            </div>
            <div className="pruebas-card-body">
              <div className="pruebas-job">
                <span className="pruebas-job-icon pruebas-job-icon--pass"><CheckIcon /></span>
                <span className="pruebas-job-name">Run Tests</span>
                <span className="pruebas-job-time">8s</span>
              </div>
              <div className="pruebas-arrow">↓</div>
              <div className="pruebas-job">
                <span className="pruebas-job-icon pruebas-job-icon--pass"><CheckIcon /></span>
                <span className="pruebas-job-name">Deploy to S3</span>
                <span className="pruebas-job-time">52s</span>
              </div>
            </div>
          </motion.div>

          {/* Card — FAILING */}
          <motion.div
            className="pruebas-card pruebas-card--fail"
            initial={{ opacity: 0, y: 32 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          >
            <div className="pruebas-card-header">
              <span className="pruebas-icon pruebas-icon--fail"><XIcon /></span>
              Tests failing
            </div>
            <div className="pruebas-card-body">
              <div className="pruebas-job pruebas-job--fail">
                <span className="pruebas-job-icon pruebas-job-icon--fail"><XIcon /></span>
                <span className="pruebas-job-name">Run Tests</span>
                <span className="pruebas-job-time pruebas-job-time--fail">3s</span>
              </div>
              <div className="pruebas-arrow">↓</div>
              <div className="pruebas-job pruebas-job--skip">
                <span className="pruebas-job-icon pruebas-job-icon--skip"><LockIcon /></span>
                <span className="pruebas-job-name">Deploy to S3</span>
                <span className="badge badge--muted">skipped</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* CodeBlocks: test Jest + job de Actions */}
        <motion.div
          className="pruebas-code"
          ref={codeRef}
          initial={{ opacity: 0, y: 32 }}
          animate={codeInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <CodeBlock filename="sum.test.js" language="jsx">
            {JEST_SNIPPET}
          </CodeBlock>
          <CodeBlock filename=".github/workflows/deploy.yml" language="yaml">
            {ACTIONS_SNIPPET}
          </CodeBlock>
        </motion.div>

      </div>
    </section>
  )
}
