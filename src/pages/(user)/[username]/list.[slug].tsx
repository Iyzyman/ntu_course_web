import Status from '@/components/Layout.Status'
import List from '@/components/List'
import { RenderGuard } from '@/components/providers/render.provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { ShelvdEndpoints } from '@/data/clients/shelvd.api'
import { useRootDispatch, useRootSelector } from '@/data/stores/root'
import {
  SearchActions,
  SearchSelectors,
  SourceOrigin,
} from '@/data/stores/search.slice'
import { Link, Navigate, useParams } from '@/router'
import {
  BookSource,
  ListData,
  ListType,
  SearchArtifact,
  SearchCategory,
  List as zList,
} from '@/types/shelvd'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { useEffect } from 'react'

const UserListPage = () => {
  // const navigate = useNavigate()

  //#endregion  //*======== STORE ===========
  const dispatch = useRootDispatch()
  const [current, setCurrent] = [
    useRootSelector(SearchSelectors.state).current,
    SearchActions.setCurrent,
  ]
  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const { username = '', slug = '' } = useParams('/:username/list/:slug')

  const searchCategory = SearchCategory.enum.lists
  const source: BookSource = BookSource.enum.shelvd

  const isValidUsername = username.startsWith('@')
  const isValidSlug = !!slug.length
  const isValidParams = isValidSlug && isValidUsername
  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========
  const { getList } = ShelvdEndpoints
  const queryUserlist = getList.useQuery(
    {
      username,
      key: slug,
      type: ListType.enum.created,
    },
    {
      skip: !isValidParams,
    },
  )

  const results = queryUserlist.data
  const isLoading = queryUserlist.isLoading || queryUserlist.isFetching
  let isNotFound =
    !isValidParams || (!isLoading && !queryUserlist.isSuccess && !results)

  let origin: SourceOrigin<'shelvd', 'lists'> = current.origin as SourceOrigin<
    'shelvd',
    'lists'
  >
  let common: SearchArtifact<'lists'> =
    current.common as SearchArtifact<'lists'>

  if (results) {
    isNotFound = !ListData.safeParse(results).success

    if (!isNotFound) {
      // source: 'shelvd' = assume common
      origin = ListData.parse(results)
      common = zList.parse({
        ...results,
        books: [],
      })
    }
  } else {
    isNotFound = true
  }

  const ctx: typeof current = {
    slug,
    source,
    category: searchCategory,

    origin,
    common,

    isNotFound,
    isLoading,
  }

  useEffect(() => {
    if (isLoading) return
    logger(
      { breakpoint: '[[username].list.[slug].tsx:89]/UserListPage/ctx' },
      { isLoading, ctx },
    )

    dispatch(setCurrent(ctx))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isLoading])

  //#endregion  //*======== QUERIES ===========

  if (!isValidParams)
    return (
      <Navigate
        to={'/discover'}
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
            isNotFound={isNotFound}
            isLoading={isLoading}
          />
        }
      >
        <List data={(origin as ListData)!}>
          {/* HEADER */}
          <section
            style={{
              backgroundImage: `linear-gradient(to bottom, hsl(var(--muted)) 0%, transparent 70%)`,
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
            }}
            className={cn(
              'relative w-full',
              'rounded-lg',

              'pt-8',
            )}
          >
            <div
              className={cn(
                'mx-auto w-11/12',
                'flex flex-col flex-wrap place-content-center place-items-center gap-8 sm:flex-row sm:place-content-start sm:place-items-start',
              )}
            >
              <aside className="flex flex-1 flex-col gap-1 *:!mt-0">
                <h1>{origin?.name ?? ''}</h1>

                <p className="leading-tight text-muted-foreground">
                  {origin?.description ?? ''}
                </p>

                <p>
                  <small className="uppercase text-muted-foreground">by</small>
                  &nbsp;
                  <Link
                    to={{
                      pathname: '/:username',
                    }}
                    params={{
                      username,
                    }}
                    unstable_viewTransition
                  >
                    <span
                      className={cn(
                        'cursor-pointer underline-offset-4 hover:underline',
                      )}
                    >
                      {username}
                    </span>
                  </Link>
                </p>
              </aside>

              <List.EditDialog />
            </div>
          </section>

          {!(origin?.booksCount ?? 0) && (
            <Alert className="my-4 mb-8">
              <InfoCircledIcon className="size-4" />
              <AlertTitle>TIP</AlertTitle>
              <AlertDescription>
                Don't know which books to add?
                <br />
                Find out what's&nbsp;
                <Link
                  to={{
                    pathname: '/trending',
                  }}
                >
                  <span
                    className={cn(
                      'cursor-pointer underline underline-offset-4',
                    )}
                  >
                    trending
                  </span>
                </Link>
                &nbsp;or&nbsp;
                <Link to={{ pathname: '/discover' }}>
                  <span
                    className={cn(
                      'cursor-pointer underline underline-offset-4',
                    )}
                  >
                    discover
                  </span>
                </Link>
                &nbsp; your interests through our recommendations
              </AlertDescription>
            </Alert>
          )}
          <section className="w-full overflow-auto">
            <List.Books>
              {/* <Book.Thumbnail className="w-fit !rounded-none" /> */}
            </List.Books>
          </section>
        </List>
      </RenderGuard>
    </main>
  )
}

export default UserListPage
