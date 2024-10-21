import '@/styles/globals.css'

import { ClerkProvider } from '@/components/providers/clerk.provider'
import ReduxProvider from '@/components/providers/redux.provider'
import { ThemeProvider } from '@/components/providers/theme.provider'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'

import { Routes } from '@generouted/react-router/lazy'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ReduxProvider>
          {/* <PersistGate
          loading={null}
          persistor={AppStorePersistor}
        > */}
          <ThemeProvider>
            <ClerkProvider>
              <Routes />
            </ClerkProvider>
          </ThemeProvider>
          {/* </PersistGate> */}
        </ReduxProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
