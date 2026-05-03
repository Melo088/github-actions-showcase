import { useRef } from 'react'
import { useInView } from 'framer-motion'

export default function useScrollReveal({
  threshold = 0.12,
  once = true,
  margin = '-40px',
} = {}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: threshold, once, margin })
  return { ref, isInView }
}
