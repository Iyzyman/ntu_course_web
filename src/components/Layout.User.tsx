import { RenderGuard } from '@/components/providers/render.provider'
import { User as UserInfo } from '@/types/shelvd'
import { PropsWithChildren, createContext } from 'react'

export type User = UserInfo

type UserContext = {
  user: User
  isSkeleton?: boolean
  onNavigate: () => void
}

const UserContext = createContext<UserContext | undefined>(undefined)
// const useUserContext = () => {
//   let ctxValue = useContext(UserContext)
//   if (ctxValue === undefined) {
//     ctxValue = {
//       user: {} as User,
//       isSkeleton: true,
//       onNavigate: () => { },
//     }
//   }

//   return ctxValue
// }
//#endregion  //*======== CONTEXT ===========

type UserProvider = PropsWithChildren & Omit<UserContext, 'onNavigate'>
export const User = ({ children, ...value }: UserProvider) => {
  // const navigate = useNavigate()

  const onNavigate = () => {
    if (!value.user) return
  }

  const isValid = !!Object.keys(value?.user ?? {}).length
  return (
    <UserContext.Provider
      value={{
        isSkeleton: !isValid,
        onNavigate,
        ...value,
      }}
    >
      <RenderGuard renderIf={isValid}>{children}</RenderGuard>
    </UserContext.Provider>
  )
}

export default User
