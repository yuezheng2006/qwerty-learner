import type { PropsWithChildren } from 'react'
import type React from 'react'

const Header: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <header className="container z-20 mx-auto w-full px-10 py-6">
      <div className="flex w-full justify-center lg:justify-end">
        <nav className="my-card on element theme-bg-card theme-transition theme-border flex w-auto content-center items-center justify-end space-x-3 rounded-xl border p-4 shadow-md">
          {children}
        </nav>
      </div>
    </header>
  )
}

export default Header
