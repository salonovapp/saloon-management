import React from 'react'

export default function BrandLogo({
  className = '',
  color = '#08DEC7',
  size = 'text-4xl',
}) {
  return (
    <span
      className={`inline-block leading-none ${size} ${className}`}
      style={{
        color,
        fontFamily: '"PROPONO BC", sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.03em',
      }}
    >
      salonovapp
    </span>
  )
}
