import Status from '@/components/Layout.Status'
import { RenderGuard } from '@/components/providers/render.provider'
import { Navigate, useParams } from '@/router'
import { cn } from '@/utils/dom'
import { useUser } from '@clerk/clerk-react'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  //#endregion  //*======== PARAMS ===========
  const { username = '' } = useParams('/:username/collections')

  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========
  const { isLoaded, isSignedIn, user } = useUser()
  const isValidUsername = username === `@${user?.username}`

  //#endregion  //*======== QUERIES ===========

  if (!isValidUsername)
    return (
      <Navigate
        to={'/'}
        unstable_viewTransition
      />
    )
  return (
    <main
      className={cn(
        'page-container',
        'flex flex-col gap-8',
        'place-items-center',
        '*:w-full',
      )}
    >
      <RenderGuard
        renderIf={isSignedIn}
        fallback={
          <Status
            isLoading={!isLoaded}
            isNotFound={isLoaded && !isSignedIn}
          />
        }
      >
        <Outlet />
      </RenderGuard>
    </main>
  )
}

export default UserLayout
