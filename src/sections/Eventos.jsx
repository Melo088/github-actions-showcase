import { motion } from 'framer-motion'
import useScrollReveal from '../hooks/useScrollReveal'
import CodeBlock from '../components/CodeBlock'
import { EVENTOS } from '../data/eventos'

const EASE = [0.22, 1, 0.36, 1]

const YAML_ON = `on:
  # Push a main o a ramas de release
  push:
    branches:
      - main
      - 'release/**'

  # Validación automática en pull requests
  pull_request:
    branches:
      - main

  # Tarea programada — todos los días a medianoche UTC
  schedule:
    - cron: '0 0 * * *'

  # Disparo manual desde la UI o la API de GitHub
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]`

// Primer-style SVG octicons inline
function EventIcon({ name }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      {name === 'git-push' && (
        <path d="M8 12a.75.75 0 0 1-.75-.75V5.56L4.78 8.03a.75.75 0 0 1-1.06-1.06l3.5-3.5a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1-1.06 1.06L8.75 5.56v5.69A.75.75 0 0 1 8 12Z" />
      )}
      {name === 'git-pull-request' && (
        <>
          <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677 6.5H12.5a.75.75 0 0 1 0 1.5H7.177a2.251 2.251 0 1 1 0-1.5ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
          <path d="M12.5 3.75v3.19l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2.75 2.75a.75.75 0 0 0 1.06 0l2.75-2.75a.75.75 0 0 0-1.06-1.06L14 6.94V3.75a.75.75 0 0 0-1.5 0Z" />
        </>
      )}
      {name === 'clock' && (
        <path d="M8 .25a7.75 7.75 0 1 0 0 15.5A7.75 7.75 0 0 0 8 .25ZM1.75 8a6.25 6.25 0 1 1 12.5 0A6.25 6.25 0 0 1 1.75 8ZM8 4a.75.75 0 0 1 .75.75v3.19l2.086 1.043a.75.75 0 0 1-.672 1.343l-2.25-1.125A.75.75 0 0 1 7.25 8.5v-3.75A.75.75 0 0 1 8 4Z" />
      )}
      {name === 'play' && (
        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z" />
      )}
    </svg>
  )
}

export default function Eventos() {
  const { ref, isInView } = useScrollReveal({ threshold: 0.15 })

  return (
    <section id="eventos" className="section">
      <div className="container">
        <div className="section-cols" ref={ref}>

          {/* Columna izquierda — entra desde la izquierda */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="section-eyebrow">
              Triggers
            </span>
            <h2 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
              Cuándo se ejecuta<br />el workflow
            </h2>
            <p className="section-lead">
              La clave <code className="token">on:</code> define qué eventos disparan
              el workflow. Puedes combinar varios en el mismo archivo.
            </p>

            <ul className="event-list" role="list">
              {EVENTOS.map(({ id, nombre, descripcion, icon }) => (
                <li key={id} className="event-card">
                  <span className="event-card-icon">
                    <EventIcon name={icon} />
                  </span>
                  <div className="event-card-body">
                    <code className="event-card-name">{nombre}</code>
                    <p className="event-card-desc">{descripcion}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Columna derecha — entra desde la derecha */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
          >
            <CodeBlock filename="on: — cuatro formas de disparar" language="yaml">
              {YAML_ON}
            </CodeBlock>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
