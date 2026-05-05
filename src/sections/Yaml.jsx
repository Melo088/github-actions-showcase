import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import useScrollReveal from '../hooks/useScrollReveal'
import CodeBlock from '../components/CodeBlock'
import { line } from 'framer-motion/client'

const EASE = [0.22, 1, 0.36, 1]

// deploy.yml completo — los números de línea deben coincidir
// exactamente con las anotaciones de abajo
const DEPLOY_YAML = `name: Deploy to AWS S3 + CloudFront

on:
  push:
    branches: ['main']
    paths-ignore:
      - '**.md'
      - 'README*'
  pull_request:
    branches: ['main']
    paths-ignore:
      - '**.md'
      - 'README*'

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
    env:
      AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
      AWS_SESSION_TOKEN: \${{ secrets.AWS_SESSION_TOKEN }}
      AWS_DEFAULT_REGION: \${{ secrets.AWS_REGION }}
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
    lineLabel: 'L3–13',
    lines: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    title: 'Event Triggers',
    body: 'Configuración del webhook de GitHub. Define la ejecución automática en ramas protegidas. Filtra por tipo de evento (push) y estado de integración (pull_request).',
    tip: 'Soporta filtros por paths, tags y cron schedule.',
  },
  {
    id: 'test',
    lineLabel: 'L15–26',
    lines: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    title: 'Job: Test Runtime',
    body: 'Aislamiento de ejecución en runners ubuntu-latest. Provisionamiento de entorno Node.js 20 con caché de dependencias habilitado para reducir el tiempo de cold-start.',
    tip: 'npm ci garantiza builds deterministas basados en el lockfile.',
  },
  {
    id: 'needs',
    lineLabel: 'L28–32',
    lines: [28, 29, 30, 31, 32],
    title: 'Job Dependency & Logical Flow',
    body: 'Control de flujo secucencial mediante needs. El job de deploy solo entra en cola si el job de test retorna exit code 0. La sentencia if restringe el despliegue a la rama productiva.',
    tip: 'Evita despliegues accidentales desde ramas de desarrollo.',
  },
  {
    id: 'secrets',
    lineLabel: 'L33–37',
    lines: [33, 34, 35, 36, 37],
    title: 'Environment Variables',
    body: 'Inyección de secretos cifrados en el runtime del runner. AWS CLI consume estas variables de forma nativa para autenticar sesiones temporales sin persistencia de credenciales.',
    tip: 'Usa AWS_SESSION_TOKEN para compatibilidad con AWS Academy/Sandboxes.',
  },
    {
    id: 'steps-deploy',
    lineLabel: 'L38–47',
    lines: [38,39,40,41,42,43,44,45,46,47],
    title: 'Build Pipeline',
    body: 'Reproducción del entorno de build: checkout del código, provisión de Node.js 20 con caché npm, instalación determinista de dependencias y compilación del bundle de producción.',
    tip: 'El artefacto resultante en dist/ es lo que se sube a S3.',
  },
  {
    id: 'sync',
    lineLabel: 'L48-49',
    lines: [48, 49],
    title: 'S3 State Sync',
    body: 'Sincronización de artefactos de build hacia el bucket. El flag --delete asegura que el estado del bucket sea idéntico al directorio dist/, eliminando archivos obsoletos.',
    tip: 'Operación idempotente: solo transfiere archivos modificados.'
  },
  {
    id: 'cloudfront',
    lineLabel: 'L50-54',
    lines: [50, 51, 52, 53, 54],
    title: 'Edge Cache Invalidation',
    body: 'Purga de caché en los nodos del borde de CloudFront. Obliga a la CDN a recuperar los nuevos archivos de S3 para que el usuario final vea los cambios inmediatamente después del despliegue.',
    tip: 'Path /* invalida toda la distribución; usa rutas específicas para optimizar costos.'
  }
]

// Bloque de anotación individual — notifica al padre cuando entra en view
function AnnotationBlock({ annotation, isActive, onEnter }) {
  const { ref, isInView } = useScrollReveal({ 
    threshold: 0,
    once: false,
    margin: '-49% 0px -49% 0px' 
  })

  useEffect(() => {
    if (isInView) {
      onEnter(annotation.id)
    } 
  }, [isInView, isActive, annotation.id, onEnter])

  return (
    <motion.div
      ref={ref}
      className={`yaml-annotation${isActive ? ' yaml-annotation--active' : ''}`}
      initial={{ opacity: 0, y: 32 }}
      animate={{
        opacity: isActive ? 1 : 0.3,
        y: isActive ? 0 : 15,
        scale: isActive ? 1 : 0.98,
        filter: isActive ? 'blur(0px)' : 'blur(1px)',
      }}
      transition={{
        type: 'spring',
        stiffness: 50,
        damping: 15,
        mass: 1
      }}
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
