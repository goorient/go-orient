'use client'

import { motion } from 'framer-motion'
import { useTilt } from '@/hooks/use-tilt'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function TiltCard({ children, className = '', onClick }: TiltCardProps) {
  const {
    ref,
    rotateX,
    rotateY,
    isHovering,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useTilt()

  return (
    <motion.div
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      animate={{
        scale: isHovering ? 1.02 : 1,
        boxShadow: isHovering
          ? '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)'
          : '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}
