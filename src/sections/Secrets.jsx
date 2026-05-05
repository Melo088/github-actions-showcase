import { motion } from 'framer-motion'
import useScrollReveal from '../hooks/useScrollReveal'
import CodeBlock from '../components/CodeBlock'

const EASE = [0.22, 1, 0.36, 1]

const VAULT_ROWS = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
  'S3_BUCKET_NAME',
  'CLOUDFRONT_DIST_ID',
]

const SNIPPET_ACTION = `# Opción 1 — via action
- uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: \${{ secrets.AWS_REGION }}`

const SNIPPET_ENV = `# Opción 2 — via env vars (este proyecto)
jobs:
  deploy:
    env:
      AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
      AWS_SESSION_TOKEN: \${{ secrets.AWS_SESSION_TOKEN }}
      AWS_DEFAULT_REGION: \${{ secrets.AWS_REGION }}`

const OIDC_SNIPPET = `permissions:
  id-token: write
  contents: read

- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: \${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1
    # No AWS_ACCESS_KEY_ID ni AWS_SECRET_ACCESS_KEY`

const SECRET_TYPES = [
  {
    name: 'Repository',
    desc: 'Aislados al contexto del repositorio actual',
  },
  {
    name: 'Environment',
    desc: (
      <span>
        Vinculados a entornos de despliegue (ej. <code className="production">production</code>). Requieren reglas de protección y reviewers.
      </span>
    ),
  },
  {
    name: 'Organization',
    desc: 'Compartidos transversalmente entre repositorios de una organización. Ideales para credenciales de infraestructura core.',
  },
]

// SVG lock icon (Primer-style)
function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 4a2.5 2.5 0 0 0-5 0v2h5Z" />
    </svg>
  )
}

export default function Secrets() {
  const { ref, isInView } = useScrollReveal({ threshold: 0.12 })

  return (
    <section id="secrets" className="section">
      <div className="container">
        <div className="section-cols" ref={ref}>

          {/* Columna izquierda — Vault */}
          <motion.div
            className='secrets-sticky'
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="section-eyebrow">Seguridad</span>
            <h2 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
              Aislamiento<br />de credenciales
            </h2>
            <p className="section-lead" style={{ marginBottom: 'var(--space-5)' }}>
              GitHub cifra cada secret con libsodium antes de almacenarlo.
              Dentro del runner se inyectan como variables de entorno.
            </p>

            {/* Vault — simula GitHub Settings → Secrets */}
            <div className="vault">
              {/* Header de la tabla */}
              <div className="vault-header">
                <span>Name</span>
                <span>Value</span>
                <span>Estado</span>
              </div>

              {VAULT_ROWS.map(name => (
                <div key={name} className="vault-row">
                  <div className="vault-row-name">
                    <span className="dot-live vault-dot" aria-hidden="true" />
                    <code className="vault-name">{name}</code>
                  </div>
                  <span className="vault-masked" aria-label="valor cifrado">
                    {'•'.repeat(8)}
                  </span>
                  <span className="badge badge--green vault-badge">
                    <LockIcon />
                    cifrado
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Columna derecha — Stack de 3 cards */}
          <motion.div
            className="secrets-cards"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
          >

            {/* Card 1 — Tipos de secrets */}
            <div className="secrets-card">
              <h3 className="secrets-card-title" style={{ marginBottom: 'var(--space-4)' }}>Secret Scopes (Ámbitos)</h3>
              <div className="secrets-types">
                {SECRET_TYPES.map(({ name, desc }) => (
                  <div key={name} className="secrets-type">
                    <span className="secrets-type-name">{name}</span>
                    <p className="secrets-type-desc">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Uso en workflow */}
            <div className="secrets-card">
              <h3 className="secrets-card-title">Estrategias de Inyección</h3>
              <CodeBlock filename="deploy.yml" language="yaml">
                {SNIPPET_ACTION}
              </CodeBlock>
              <p className="secrets-card-compare">
                <code className="token">with:</code> pasa el valor como parámetro a la action.{' '}
                <code className="token">env:</code> lo expone como variable de entorno del runner
                — AWS CLI lo lee automáticamente sin intermediarios.
              </p>
              <CodeBlock filename="deploy.yml" language="yaml">
                {SNIPPET_ENV}
              </CodeBlock>
            </div>

            {/* Card 3 — Pro tip OIDC */}
            <div className="secrets-card">
              <div className="secrets-oidc-header">
                <span className="badge badge--green">Security Standard</span>
                <h3 className="secrets-card-title">OIDC (Federación de Identidades)</h3>
              </div>
              <p className="secrets-card-lead">
                Con OpenID Connect el runner negocia credenciales temporales con AWS directamente,
                sin necesidad de guardar <code className="token">AWS_ACCESS_KEY_ID</code> ni{' '}
                <code className="token">AWS_SECRET_ACCESS_KEY</code>. Solo necesitas el ARN del rol
                de IAM que Actions puede asumir. Las credenciales expiran al terminar el job.
              </p>
              <CodeBlock filename="deploy.yml" language="yaml">
                {OIDC_SNIPPET}
              </CodeBlock>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}
