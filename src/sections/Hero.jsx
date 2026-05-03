import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import PipelineTicker from '../components/PipelineTicker'

const EASE = [0.22, 1, 0.36, 1]

// Variante con custom=índice para el delay staggered por palabra.
// El padre motion.h1 propaga initial/animate a todos los motion
// descendientes, incluso a través de spans no-motion.
const wordV = {
  hidden: { y: '110%' },
  visible: i => ({
    y: 0,
    transition: { duration: 0.75, ease: EASE, delay: 0.1 + i * 0.09 },
  }),
}

const HEADLINE_WORDS = [
  { text: 'Cada',      purple: false, br: false },
  { text: 'push',      purple: true,  br: false },
  { text: 'dispara',   purple: false, br: true  },
  { text: 'el',        purple: false, br: false },
  { text: 'pipeline.', purple: false, br: true  },
]

export default function Hero() {
  const headlineRef = useRef(null)
  const inView = useInView(headlineRef, { amount: 0.4, once: true })

  const { scrollY } = useScroll()
  const cueOpacity = useTransform(scrollY, [0, 180], [1, 0])

  return (
    <section className="hero">
      {/* Fondo: grid de líneas + glow purple */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-bg-grid" />
        <div className="hero-bg-glow" />
      </div>

      <div className="hero-inner container">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="section-eyebrow">
            <span className="dot-live" aria-hidden="true" />
            CI/CD nativo · Infra III
          </span>
        </motion.div>

        {/* Headline — word-by-word reveal */}
        <motion.h1
          ref={headlineRef}
          className="hero-headline"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          aria-label="Cada push dispara el pipeline."
        >
          {HEADLINE_WORDS.map(({ text, purple, br }, i) => {
            const spaceAfter =
              i < HEADLINE_WORDS.length - 1 && !HEADLINE_WORDS[i + 1].br
            return (
              <span key={text}>
                {br && <br />}
                <span className={`hw-clip${purple ? ' hw-clip--purple' : ''}`}>
                  <motion.span className="hw" variants={wordV} custom={i}>
                    {text}
                  </motion.span>
                </span>
                {spaceAfter && ' '}
              </span>
            )
          })}
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: EASE, delay: 0.55 }}
        >
          GitHub Actions convierte cada commit en una entrega automática.
          Sin servidores de CI externos, es decir, el pipeline vive en el mismo
          repositorio que el código.
        </motion.p>

        {/* Pipeline Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.75 }}
        >
          <PipelineTicker />
        </motion.div>

      </div>

      {/* Scroll cue — desaparece al hacer scroll */}
      <motion.div
        className="hero-scroll-cue"
        style={{ opacity: cueOpacity }}
        aria-hidden="true"
      >
        <motion.span
          className="hero-scroll-arrow"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Primer chevron-down doble */}
          <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 9.5a.75.75 0 0 1-.53-.22l-4-4a.75.75 0 0 1 1.06-1.06L8 7.69l3.47-3.47a.75.75 0 0 1 1.06 1.06l-4 4A.75.75 0 0 1 8 9.5Z" />
            <path d="M8 13.5a.75.75 0 0 1-.53-.22l-4-4a.75.75 0 0 1 1.06-1.06L8 11.69l3.47-3.47a.75.75 0 0 1 1.06 1.06l-4 4A.75.75 0 0 1 8 13.5Z" />
          </svg>
        </motion.span>
      </motion.div>
    </section>
  )
}
