import '@/styles/globals.css'

import { ClerkProvider } from '@/components/providers/clerk.provider'
import ReduxProvider from '@/components/providers/redux.provider'
import { ThemeProvider } from '@/components/providers/theme.provider'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'

import { Routes } from '@generouted/react-router/lazy'
import StoreProvider from '@/components/providers/store.provider'

export const App = () => {
  return (
    <HelmetProvider>
      <ReduxProvider>
        {/* <PersistGate
          loading={null}
          persistor={AppStorePersistor}
        > */}
        <ThemeProvider>
          <ClerkProvider>
            <StoreProvider>
              <Routes />
            </StoreProvider>
          </ClerkProvider>
        </ThemeProvider>
        {/* </PersistGate> */}
      </ReduxProvider>
    </HelmetProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
