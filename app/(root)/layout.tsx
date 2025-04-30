import Header from '@/components/Header'
import Footer from '@/components/ui/Footer'
import React, { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <main>
        <div className='relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full  text-lg py-3'>
          <div className='max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between'>
            {children}
          </div>
        </div>
      </main>
      <Footer/>

    </>
  )
}

export default Layout