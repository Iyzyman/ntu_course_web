import { ShelvdEndpoints } from '@/data/clients/shelvd.api'
import { useRootDispatch } from '@/data/stores/root'
import { UserActions } from '@/data/stores/user.slice'
import { ListTypeInfo } from '@/types/shelvd'
import { useUser } from '@clerk/clerk-react'
import { PropsWithChildren, useEffect } from 'react'

type StoreProvider = PropsWithChildren
const StoreProvider = ({ children }: StoreProvider) => {
  const { isSignedIn, user } = useUser()

  //#endregion  //*======== STORE ===========
  const dispatch = useRootDispatch()
  const [setLists, resetLists] = [UserActions.setLists, UserActions.resetLists]

  const username = user?.username ?? ''
  //#endregion  //*======== STORE ===========

  //#endregion  //*======== QUERIES ===========
  //#endregion  //*======== USER/LISTS ===========
  const { getListKeys } = ShelvdEndpoints

  const queryListKeys = getListKeys.useQuery(
    {
      username,
    },
    {
      skip: !isSignedIn || !username.length,
    },
  )
  //#endregion  //*======== USER/LISTS ===========
  //#endregion  //*======== QUERIES ===========

  useEffect(() => {
    if (!isSignedIn) {
      dispatch(resetLists())
      return
    }

    if (queryListKeys.isSuccess) {
      dispatch(setLists(queryListKeys.data as ListTypeInfo))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, queryListKeys])

  return children
}

export default StoreProvider
