import { RootStore } from '@/data/stores/root'
import { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'

const ReduxProvider = ({ children }: PropsWithChildren) => {
  return <Provider store={RootStore}>{children}</Provider>
}

export default ReduxProvider
