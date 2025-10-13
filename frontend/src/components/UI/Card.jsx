import React from 'react'

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`liquid-card ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card