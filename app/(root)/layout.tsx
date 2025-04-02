import React, { ReactNode } from 'react'

const Layout = ({children}:{children:ReactNode}) => {
  return (
    <div>
        this is root layout
      {children}
    </div>
  )
}

export default Layout