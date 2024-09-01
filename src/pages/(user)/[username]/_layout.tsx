import Status from '@/components/Layout.Status'
import User from '@/components/Layout.User'
import { RenderGuard } from '@/components/providers/render.provider'
import { ShelvdEndpoints } from '@/data/clients/shelvd.api'
import { useRootDispatch, useRootSelector } from '@/data/stores/root'
import { SearchActions, SearchSelectors } from '@/data/stores/search.slice'
import { Navigate, useParams } from '@/router'
import { BookSource, SearchCategory } from '@/types/shelvd'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  //#endregion  //*======== STORE ===========
  const dispatch = useRootDispatch()
  const [current, setCurrent] = [
    useRootSelector(SearchSelectors.state).current,
    SearchActions.setCurrent,
  ]

  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const { username = '' } = useParams('/:username')

  const searchCategory = SearchCategory.enum.users
  const source: BookSource = BookSource.enum.shelvd

  const isValidUsername = username.startsWith('@') && username.length > 1
  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========
  const { getUserByUsername } = ShelvdEndpoints

  const queryUser = getUserByUsername.useQuery(
    {
      username,
    },
    {
      skip: !isValidUsername,
    },
  )
  const user = queryUser.data
  const isLoading = queryUser.isLoading || queryUser.isFetching
  const isNotFound = !isLoading && !queryUser.isSuccess && !user

  const ctx: typeof current = {
    slug: username,
    source,
    category: searchCategory,

    origin: user,
    common: user,

    isNotFound: isNotFound,
    isLoading: isLoading,
  }

  useEffect(() => {
    if (isLoading) return
    logger(
      { breakpoint: '[_layout.tsx:71]/UserLayout/ctx' },
      { isLoading, ctx },
    )

    dispatch(setCurrent(ctx))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isLoading])

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
        renderIf={!isNotFound}
        fallback={
          <Status
            isLoading={isLoading}
            isNotFound={isNotFound}
          />
        }
      >
        <User user={(ctx.common as User)!}>
          <Outlet />
        </User>
      </RenderGuard>
    </main>
  )
}

export default UserLayout
