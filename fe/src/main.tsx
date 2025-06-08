import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './app.router.tsx'
import './index.css'
import { BreadcrumbProvider } from '@/context/breadcrumb-context.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <QueryClientProvider client={queryClient}>
     <BreadcrumbProvider>
       <RouterProvider router={router}/>
     </BreadcrumbProvider>
     <ReactQueryDevtools initialIsOpen={false} />
   </QueryClientProvider>
  </StrictMode>,
)
