import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './app.router.tsx'
import './index.css'
import { BreadcrumbProvider } from '@/context/breadcrumb-context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <BreadcrumbProvider>
     <RouterProvider router={router}/>
   </BreadcrumbProvider>
  </StrictMode>,
)
