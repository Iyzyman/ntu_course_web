import Course from '@/components/Course'
import User from '@/components/Layout.User'
import List from '@/components/List'
import { RenderGuard } from '@/components/providers/render.provider'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { mockList } from '@/data/clients/mockdata'
import { ShelvdEndpoints } from '@/data/clients/shelvd.api'
import { useRootSelector } from '@/data/stores/root'
import { SearchSelectors } from '@/data/stores/search.slice'
import { ListData } from '@/types/shelvd'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { InfoCircledIcon } from '@radix-ui/react-icons'

const UserPage = () => {
  //#endregion  //*======== STORE ===========
  const current = useRootSelector(SearchSelectors.state).current
  const user = current.origin as User

  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const username = user?.username ?? ''

  const isValidUser = !current.isNotFound && !!username.length

  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========
  const { getListsByType } = ShelvdEndpoints

  //#endregion  //*======== USER/CORELISTS ===========
  const queryCorelists = getListsByType.useQuery(
    {
      type: 'core',
      username,
    },
    {
      skip: !isValidUser,
    },
  )
  const isMock = true
  const corelistsResults = isMock
    ? mockList
    : ((queryCorelists.data ?? []) as ListData[])
  const isCoreAllEmpty = corelistsResults.every((list) => !list.coursesCount)
  // const corelistsIsLoading =
  //   queryCorelists.isLoading || queryCorelists.isFetching
  // const corelistsIsNotFound =
  //   !corelistsIsLoading && !queryCorelists.isSuccess && !corelistsResults.length
  //#endregion  //*======== USER/CORELISTS ===========

  //#endregion  //*======== QUERIES ===========

  logger(
    { breakpoint: '[index.tsx:66]/UserPage' },
    {
      corelistsResults,
    },
  )
  if (!isValidUser) return null
  return (
    <>
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
          <aside className="flex w-full flex-col gap-2 *:!mt-0">
            {current.isLoading ? (
              <Skeleton className="h-8 w-1/3" />
            ) : (
              <h1>{`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}</h1>
            )}
            {current.isLoading ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <p className="leading-tight text-muted-foreground">{`@${user?.username ?? ''}`}</p>
            )}
          </aside>
        </div>
      </section>

      <Accordion
        type="multiple"
        defaultValue={['core']}
        className="w-full"
      >
        <AccordionItem value="core">
          <AccordionTrigger className="w-full !place-content-between gap-4">
            <aside className="inline-flex flex-row !place-content-start place-items-center gap-2">
              <h2 className="h3 capitalize">Watchlist</h2>
            </aside>
          </AccordionTrigger>

          <AccordionContent className={cn('flex flex-col gap-4')}>
            {isCoreAllEmpty && (
              <Alert>
                <InfoCircledIcon className="size-4" />
                <AlertTitle>TIP</AlertTitle>
                <AlertDescription>
                  Begin creating a watchlist by starring your courses!
                </AlertDescription>
              </Alert>
            )}

            {corelistsResults.map((list) => {
              return (
                <RenderGuard
                  key={`${user.id}-list-core-${list.key}`}
                  renderIf={ListData.safeParse(list).success}
                >
                  <List data={ListData.parse(list)}>
                    <div className="flex flex-col gap-y-2">
                      <h3
                        className={cn(
                          'cursor-pointer underline-offset-4 hover:!underline',
                          'small line-clamp-1 truncate text-pretty font-semibold uppercase leading-none tracking-tight text-muted-foreground',
                        )}
                      >
                        {list.name}&nbsp;
                        <Badge variant={'outline'}>
                          {list?.coursesCount ?? 0} courses
                        </Badge>
                      </h3>

                      <div
                        className={cn(
                          'w-full place-content-start place-items-start gap-2',
                          'flex flex-row flex-wrap',
                          // 'sm:max-w-xl',
                        )}
                      >
                        <List.Courses>
                          <Course.Thumbnail className="w-fit !rounded-none" />
                        </List.Courses>
                      </div>
                    </div>
                  </List>
                </RenderGuard>
              )
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export default UserPage
