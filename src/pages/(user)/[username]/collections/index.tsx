import { useWatchListData } from '@/components/hooks/useCourseFinderHooks'
import List from '@/components/List'
import { RenderGuard } from '@/components/providers/render.provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ListData } from '@/types/shelvd'
import { cn } from '@/utils/dom'
import { useUser } from '@clerk/clerk-react'
import { InfoCircledIcon } from '@radix-ui/react-icons'

const UserPage = () => {
  //#endregion  //*======== STORE ===========
  const { user, isLoaded } = useUser()

  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========

  //#endregion  //*======== USER/CORELISTS ===========

  const userid = user?.id || ''

  const {
    data,
    isSuccess,
    isLoading,
    isFetching,
  } = useWatchListData(userid)

  const isDataLoading = isLoading || isFetching
  const isFound = (!isDataLoading && isSuccess)
  const courses = isFound? data?? [] : []
  console.log(courses)

  const watchlist: List = {
    key: 'Collections',
    name: 'Collections',
    courses: courses,
    coursesCount: courses.length
  }

  const isWatchListEmpty = watchlist.coursesCount === 0

  //#endregion  //*======== USER/CORELISTS ===========

  //#endregion  //*======== QUERIES ===========

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
            {!isLoaded ? (
              <Skeleton className="h-8 w-1/3" />
            ) : (
              <h1>{`${user?.firstName ?? 'Watchlist'} ${user?.lastName ?? ''}`}</h1>
            )}
            {!isLoaded ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <p className="leading-tight text-muted-foreground">{`@${user?.username ?? ''}`}</p>
            )}
          </aside>
        </div>
      </section>

      {isWatchListEmpty && (
        <Alert>
          <InfoCircledIcon className="size-4" />
          <AlertTitle>TIP</AlertTitle>
          <AlertDescription>
            Begin creating a watchlist by starring your courses!
          </AlertDescription>
        </Alert>
      )}

      {!isWatchListEmpty &&(<section className='w-full flex'>
        <RenderGuard
          key={`${user?.id}-list-core-${watchlist.key}`}
          renderIf={ListData.safeParse(watchlist).success}
        >
          <List
            data={ListData.parse(watchlist)}
            overwriteCourses={watchlist.courses}
          >
            <div className="flex flex-col gap-y-2">
              <h3
                className={cn(
                  'cursor-pointer underline-offset-4 hover:!underline',
                  'small line-clamp-1 truncate text-pretty font-semibold uppercase leading-none tracking-tight text-muted-foreground',
                )}
              >
                {'Collections'}&nbsp;
                <Badge variant={'outline'}>
                  {watchlist?.coursesCount ?? 0} courses
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
                </List.Courses>
              </div>
            </div>
          </List>
        </RenderGuard>
      </section>
      )}
    </>
  )
}

export default UserPage
