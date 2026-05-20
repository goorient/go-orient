'use client'

import { useRef, useState, useCallback } from 'react'
import type { MotionValue } from 'framer-motion'
import { useMotionValue, useSpring } from 'framer-motion'

const SPRING_CONFIG = { stiffness: 300, damping: 20 }
const MAX_ROTATION = 10

export function useTilt() {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(y, SPRING_CONFIG)
  const rotateY = useSpring(x, SPRING_CONFIG)

  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const percentX = (e.clientX - centerX) / (rect.width / 2)
      const percentY = (e.clientY - centerY) / (rect.height / 2)

      x.set(percentX * MAX_ROTATION)
      y.set(-percentY * MAX_ROTATION)
    },
    [x, y]
  )

  const handleMouseEnter = useCallback(() => setIsHovering(true), [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    x.set(0)
    y.set(0)
  }, [x, y])

  return {
    ref,
    rotateX,
    rotateY,
    isHovering,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  }
}
