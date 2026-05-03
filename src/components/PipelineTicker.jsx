import { useState, useEffect, Fragment } from 'react'
import { PIPELINE_STEPS } from '../data/pipeline'

const PREFIX = {
  pending: '·',
  running: '»',
  success: '✓',
}

function getState(i, active) {
  if (i < active)   return 'success'
  if (i === active) return 'running'
  return 'pending'
}

export default function PipelineTicker() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep(prev =>
        prev + 1 >= PIPELINE_STEPS.length ? 0 : prev + 1
      )
    }, 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="pticker" role="status" aria-label="Pipeline en ejecución">
      {PIPELINE_STEPS.map(({ id, label, sublabel }, i) => {
        const state = getState(i, activeStep)

        return (
          <Fragment key={id}>
            {i > 0 && (
              <div className="pticker-arrow" aria-hidden="true">→</div>
            )}
            <div className="pticker-step">
              <div className={`pticker-pill pticker-pill--${state}`}>
                <span className="pticker-icon" aria-hidden="true">
                  {PREFIX[state]}
                </span>
                <span className="pticker-name">{label}</span>
              </div>
              <span className="pticker-sub">{sublabel}</span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
