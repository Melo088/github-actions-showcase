import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useScrollReveal from '../hooks/useScrollReveal'
import CodeBlock from '../components/CodeBlock'

const EASE = [0.22, 1, 0.36, 1]

// deploy.yml completo — los números de línea deben coincidir
// exactamente con las anotaciones de abajo
const DEPLOY_YAML = `name: Deploy to AWS S3 + CloudFront

on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test --if-present

  deploy:
    name: Deploy to S3
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ secrets.AWS_REGION }}
      - name: Sync to S3
        run: aws s3 sync ./dist s3://\${{ secrets.S3_BUCKET_NAME }} --delete
      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \\
            --distribution-id \${{ secrets.CLOUDFRONT_DIST_ID }} \\
            --paths "/*"`

const ANNOTATIONS = [
  {
    id: 'on',
    lineLabel: 'L3–7',
    lines: [3, 4, 5, 6, 7],
    title: 'Triggers — cuándo ejecutar',
    body: 'El bloque on: define qué eventos activan el workflow. Respondemos a push en main (para deploy) y a pull_request (para validación). Ambos triggers conviven en el mismo archivo.',
    tip: 'Puedes combinar todos los eventos que necesites en un solo on:',
  },
  {
    id: 'test',
    lineLabel: 'L10–20',
    lines: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    title: 'Job de tests — el guardián',
    body: 'El job test corre en un runner ubuntu-latest que GitHub provisiona y destruye gratis en cada ejecución. Instala dependencias con npm ci y ejecuta la suite de pruebas antes de cualquier deploy.',
    tip: 'ubuntu-latest: GitHub provisiona la VM, tú solo pagas con minutos gratuitos',
  },
  {
    id: 'needs',
    lineLabel: 'L24–26',
    lines: [24, 25, 26],
    title: 'needs: test — dependencia de jobs',
    body: 'Esta línea hace el pipeline secuencial: deploy no puede empezar hasta que test termine con éxito. Si los tests fallan, el deploy nunca ocurre. Por defecto, los jobs corren en paralelo.',
    tip: 'Sin needs:, todos los jobs corren en paralelo simultáneamente',
  },
  {
    id: 'secrets',
    lineLabel: 'L40–44',
    lines: [40, 41, 42, 43, 44],
    title: 'Secrets — credenciales seguras',
    body: 'Las credenciales de AWS nunca se escriben directamente en el YAML. Se inyectan en tiempo de ejecución desde el vault cifrado de GitHub, y solo existen dentro del runner durante la ejecución.',
    tip: '${{ secrets.NAME }} nunca aparece en logs — GitHub lo redacta automáticamente',
  },
]

// Bloque de anotación individual — notifica al padre cuando entra en view
function AnnotationBlock({ annotation, isActive, onEnter }) {
  const { ref, isInView } = useScrollReveal({ threshold: 0.45, once: true })

  useEffect(() => {
    if (isInView) onEnter(annotation.id)
  }, [isInView]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      ref={ref}
      className={`yaml-annotation${isActive ? ' yaml-annotation--active' : ''}`}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <span className="yaml-ann-linelabel">{annotation.lineLabel}</span>
      <h3 className="yaml-ann-title">{annotation.title}</h3>
      <p className="yaml-ann-body">{annotation.body}</p>
      <span className="badge badge--purple">{annotation.tip}</span>
    </motion.div>
  )
}

export default function Yaml() {
  const [activeId, setActiveId] = useState(null)

  const activeAnnotation = ANNOTATIONS.find(a => a.id === activeId)
  const highlightLines = activeAnnotation?.lines ?? []

  return (
    <section id="yaml" className="section yaml-section">
      <div className="container">

        {/* Header de sección */}
        <motion.div
          className="yaml-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="section-eyebrow">El workflow</span>
          <h2 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
            El propósito de<br />cada bloque
          </h2>
          <p className="section-lead" style={{ margin: '0 auto' }}>
            El <code className="token">deploy.yml</code> que despliega esta página ahora mismo.
            Desplaza para entender cada bloque.
          </p>
        </motion.div>

        {/* Layout sticky */}
        <div className="yaml-layout">

          {/* Columna izquierda — sticky */}
          <div className="yaml-sticky">
            <CodeBlock
              filename=".github/workflows/deploy.yml"
              language="yaml"
              showLineNumbers
              highlightLines={highlightLines}
            >
              {DEPLOY_YAML}
            </CodeBlock>
          </div>

          {/* Columna derecha — anotaciones que scrollean */}
          <div className="yaml-annotations">
            {ANNOTATIONS.map(annotation => (
              <AnnotationBlock
                key={annotation.id}
                annotation={annotation}
                isActive={annotation.id === activeId}
                onEnter={setActiveId}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
