import { RenderGuard } from '@/components/providers/render.provider'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, BadgeProps } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader } from '@/components/ui/Card'
import { List } from '@/components/List'
import { Hardcover } from '@/types'
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/Hover.Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDeleteCourseFromCollectionMutation } from '@/data/clients/collections.api'
import { Link, useNavigate } from '@/router'
import { Course as CourseInfo, ListData } from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { getLimitedArray } from '@/utils/helpers'
import { useClerk, useUser } from '@clerk/clerk-react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import {
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import StarIcon from '@mui/icons-material/Star'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { ring2 } from 'ldrs'
import {
  useGetLikeCourse,
  useGetWatchList,
  useLikeCourse,
  useWatchListCourse,
} from './hooks/useCourseFinderHooks'
ring2.register()
export type Course = CourseInfo
//#endregion  //*======== CONTEXT ===========
export type CourseContext = {
  course: Course
  isSkeleton?: boolean
  onNavigate: () => void
}
const CourseContext = createContext<CourseContext | undefined>(undefined)
const useCourseContext = () => {
  let ctxValue = useContext(CourseContext)
  if (ctxValue === undefined) {
    // throw new Error(
    //   'Expected an Context Provider somewhere in the react tree to set context value',
    // )

    ctxValue = {
      course: {} as Course,
      isSkeleton: true,
      onNavigate: () => { },
    }
  }
  return ctxValue
}
//#endregion  //*======== CONTEXT ===========

//#endregion  //*======== PROVIDER ===========
type CourseProvider = PropsWithChildren & Omit<CourseContext, 'onNavigate'>
export const Course = ({ children, ...value }: CourseProvider) => {
  const navigate = useNavigate()
  const onNavigate = () => {
    if (!value.course) return
    navigate(
      {
        pathname: '/course/:slug',
      },
      {
        params: {
          slug: value.course?.slug ?? '',
        },
        // unstable_viewTransition: true,
      },
    )
  }

  const isValid = CourseInfo.safeParse(value?.course ?? {}).success
  if (!isValid) {
    logger(
      { breakpoint: '[Course.tsx:112]/CourseProvider' },
      CourseInfo.safeParse(value?.course),
      value,
    )
  }
  return (
    <CourseContext.Provider
      value={{
        isSkeleton: !isValid,
        onNavigate,
        ...value,
      }}
    >
      <RenderGuard renderIf={isValid}>{children}</RenderGuard>
    </CourseContext.Provider>
  )
}

//#endregion  //*======== PROVIDER ===========

//#endregion  //*======== COMPONENTS ===========

type CourseImage = Avatar
export const CourseImage = ({ className, children, ...rest }: CourseImage) => {
  const { course } = useCourseContext()
  return (
    <Avatar
      className={cn(
        'flex place-content-center place-items-center overflow-clip p-0.5',
        'aspect-square', // Ensures aspect ratio of 1:1
        'h-[109px] w-[109px]', // Set the size to 113px by 113px
        'bg-[#373B45]', // Set background color
        className,
      )}
      style={{ borderRadius: '5px', position: 'relative' }}
      {...rest}
    >
      {children ?? (
        <>
          <div
            className={cn('text-center')}
            style={{
              fontFamily: 'Bebas Neue',
              fontWeight: '400', // Corrected fontWeight syntax
              fontSize: '40px',
              cursor: 'default', // Sets the cursor to default, preventing text selection pointer
            }}
          >
            {/* {course.title} */}
            {course.code}
          </div>
          <div
            style={{
              position: 'absolute', // Absolute positioning
              bottom: '5px', // Align at the bottom
              left: '0', // Full width alignment
              right: '0', // Full width alignment
              fontSize: '12px', // Adjust size for better fit
            }}
          >
            <Stats
              likes={course.likes}
              watchlists={course.watchlists}
            ></Stats>
          </div>
        </>
      )}
    </Avatar>
  )
}

Course.Image = CourseImage

type CourseThumbnail = Card & {
  isSkeleton?: boolean
}
export const CourseThumbnail = ({
  className,
  children,
  isSkeleton = false,
  ...rest
}: CourseThumbnail) => {
  const { course, onNavigate } = useCourseContext()
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card
          className={cn(
            'flex place-content-center place-items-center',
            'hover:bg-primary',
            'shrink-0',
            'rounded-md',
            'border-none',
            className,
          )}
          style={{ width: '113px', height: '113px', borderRadius: '8px' }}
          onClick={onNavigate}
          {...rest}
        >
          {children}
          <Course.Image />
        </Card>
      </HoverCardTrigger>
      {!isSkeleton && (
        <HoverCardContent
          side="bottom"
          sideOffset={5}
          className={cn(
            'flex flex-col gap-2',
            'w-[113]',
            'h-[113]',
            'p-4',
            'py-4',
            'rounded-md',
          )}
        >
          <HoverCardArrow className="fill-secondary" />
          <small className="text-sm leading-none">
            <small className="capitalize">{course.title.toLowerCase()}</small>
          </small>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}
Course.Thumbnail = CourseThumbnail

type CourseTags = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  tags: string[]

  tag?: BadgeProps

  header?: HTMLAttributes<HTMLDivElement>
}

export const CourseTags = ({
  title,
  tags,
  children,
  className,
  tag: { className: tagClsx, ...tagProps } = { className: '' },
  ...rest
}: CourseTags) => {
  const { isSkeleton = !tags.length } = useCourseContext()
  const [showAllTags, setShowAllTags] = useState<boolean>(false)

  const allTags: string[] = isSkeleton ? new Array(5).fill(false) : tags
  const tagsPreviewThreshold = 5
  const isTagsLong = allTags.length > tagsPreviewThreshold

  const TagChevron = showAllTags ? ChevronUpIcon : ChevronDownIcon

  if (!allTags.length) return null

  return (
    <section
      className={cn('flex flex-1 flex-col gap-2', className)}
      {...rest}
    >
      <header className="flex flex-row place-content-between gap-2">
        {typeof title === 'string' ? <h4>{title}</h4> : title}
        {isTagsLong && (
          <Button
            variant="link"
            onClick={() => setShowAllTags(!showAllTags)}
            className="flex text-xs text-muted-foreground !no-underline"
          >
            <TagChevron className="size-4" />
            {showAllTags ? 'Collapse' : 'Expand'}
          </Button>
        )}
      </header>
      <aside
        className={cn(
          'flex flex-row flex-wrap place-items-center gap-2 overflow-hidden transition-all',
          showAllTags ? 'max-h-full' : 'max-h-8',
        )}
        style={{
          maxHeight: showAllTags ? 'none' : 'calc(1rem * 2 + 4px)', // Adjust for one row (approximate)
        }}
      >
        {allTags.map((tag, idx) =>
          isSkeleton ? (
            <Skeleton
              key={`game-tag-${idx}`}
              className="h-5 w-[100px]"
            />
          ) : (
            <Badge
              key={`game-tag-${idx}`}
              variant="secondary"
              className={cn(
                'truncate text-xs capitalize',
                idx + 1 > tagsPreviewThreshold && (showAllTags ? 'block' : ''),
                tagClsx,
              )}
              style={{
                height: '31px',
                borderRadius: '5px',
                fontWeight: '400',
                fontSize: '16px',
                justifyContent: 'center',
                alignContent: 'center',
              }}
              {...tagProps}
            >
              {tag}
            </Badge>
          ),
        )}
      </aside>
      {children}
    </section>
  )
}
Course.Tags = CourseTags

type CourseDescription = HTMLAttributes<HTMLDivElement>
export const CourseDescription = ({
  className,
  children,
  ...rest
}: CourseDescription) => {
  const { course } = useCourseContext()

  const description = course.description ?? ''
  const isEmptyDescription = !description.length
  const [showFullDesc, setShowFullDesc] = useState<boolean>(isEmptyDescription)

  return (
    <article
      className={cn(
        'flex flex-col place-content-between',
        'overflow-hidden',

        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          'p whitespace-break-spaces text-pretty',
          'relative flex-1',
          !showFullDesc &&
          'masked-overflow masked-overflow-top line-clamp-4 !overflow-y-hidden',
          isEmptyDescription && 'italic text-muted-foreground',
        )}
        style={{
          fontFamily: 'Inter',
          fontSize: '20px',
          fontWeight: 300,
          lineHeight: '24.2px',
          textAlign: 'justify',
          color: 'var(----course-description)',
        }}
      >
        {isEmptyDescription
          ? "We don't have a description for this course yet."
          : description}
      </div>

      {children}

      <Button
        variant="secondary"
        onClick={() => setShowFullDesc(!showFullDesc)}
        className={cn(
          'flex w-full flex-row place-content-center place-items-center gap-2',
          'rounded-t-none',
          showFullDesc && 'hidden',
        )}
      >
        <ChevronDownIcon className="size-4" />
        <span>See More</span>
      </Button>
    </article>
  )
}
Course.Description = CourseDescription

type CoursePrerequisitesProps = HTMLAttributes<HTMLDivElement> & {
  className?: string
  prerequisites?: Course[] | null
  children?: React.ReactNode
}

export const CoursePrerequisites: React.FC<CoursePrerequisitesProps> = ({
  className,
  prerequisites,
  children,
  ...rest
}) => {
  if (!prerequisites || prerequisites.length === 0) return null
  return (
    <section
      className={cn('flex flex-col gap-2', className)}
      {...rest}
    >
      <header>
        <h4>
          <span>Prerequisites</span>
        </h4>
      </header>

      <div
        className={cn(
          'w-full place-content-start place-items-start gap-2',
          'flex flex-row flex-wrap',
        )}
      >
        {(prerequisites ?? []).map((prerequisite, idx) => {
          // Validate prerequisite using CourseInfo.safeParse
          const validation = CourseInfo.safeParse(prerequisite)
          const course = HardcoverUtils.parseCourse(prerequisite)
          if (!validation.success) return null

          return (
            <Course
              key={`${idx}-${course.key}`}
              course={course}
            >
              <Course.Thumbnail
                className={cn(
                  'w-fit !rounded-none',
                  idx > 8 && 'hidden sm:block',
                )}
              />
            </Course>
          )
        })}
      </div>

      {children}
    </section>
  )
}
Course.Prerequisites = CoursePrerequisites

type BiggerCourseCard = HTMLAttributes<HTMLDivElement> & {
  username: string
  collection_key: string
  isSignedInUser: boolean
}
export const BiggerCourseCard = ({
  className,
  children,
  username,
  collection_key,
  isSignedInUser,
  ...rest
}: BiggerCourseCard) => {
  const { onNavigate, course } = useCourseContext()
  const [deleteCourseFromCollection] = useDeleteCourseFromCollectionMutation()
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDeleting(true)
    const deleteCoursePayload = {
      username,
      collection_key,
      course_key: course.key,
    }
    deleteCourseFromCollection(deleteCoursePayload)
  }

  return (
    <Card
      className={cn(
        'relative',
        'flex flex-col gap-2',
        'rounded-lg',
        'border-2 border-primary',
        'overflow-hidden',
        'h-50 w-30',
        className,
      )}
      onClick={onNavigate}
      {...rest}
    >
      <CardHeader>
        <h4 className="text-lg font-bold">{course.title}</h4>
        {isSignedInUser &&
          (!isDeleting ? (
            <Button
              className="absolute right-5 top-5 border-secondary"
              variant={'outline'}
              size={'icon'}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleDelete(e)
              }
            >
              <TrashIcon />
            </Button>
          ) : (
            <l-ring-2
              size="40"
              stroke="5"
              stroke-length="0.25"
              bg-opacity="0.1"
              speed="0.8"
              color="white"
            ></l-ring-2>
          ))}
        <CardDescription>
          <p className="line-clamp-3">{course.description}</p>
        </CardDescription>
      </CardHeader>
      <Course.Image className="h-full w-full" />

      {children}
    </Card>
  )
}
Course.BiggerCourseCard = BiggerCourseCard

type CourseMatrix = HTMLAttributes<HTMLDivElement> & {
  displayCategoryLists: Hardcover.List[]
  category: string
}
export const CourseMatrix = ({
  displayCategoryLists,
  category,
}: CourseMatrix) => {
  return (
    <section
      className={cn(
        'w-full',
        'flex flex-col gap-x-8 gap-y-8 lg:grid lg:grid-cols-2',
        'my-6',
        'snap-y snap-proximity overflow-y-auto',
        'grid',
        'lg:grid-cols-1',
        '2xl:grid-cols-2',
      )}
      style={{ columnGap: '190px' }}
    >
      {displayCategoryLists.map((hcList, idx) => {
        const list = HardcoverUtils.parseList(hcList)
        const courses = hcList.courses.map((hcCourse) =>
          HardcoverUtils.parseCourse(hcCourse),
        )

        const data = ListData.parse(list)
        return (
          <List
            key={`lists-${category}-${idx}-${list.key}`}
            data={data}
            overwriteCourses={courses}
          >
            <section
              className={cn(
                'flex flex-col place-content-start place-items-start gap-1',
              )}
              style={{ width: '600px' }}
            >
              <header className={cn('w-full', 'flex flex-col gap-0.5')}>
                <div className="flex w-full flex-row flex-wrap place-items-center gap-2">
                  <span style={{ color: 'var(--school-name)' }}>
                    {list.name}
                  </span>
                </div>
              </header>
              <div
                className={cn(
                  'w-fit place-content-start place-items-start gap-2',
                  'flex flex-row flex-wrap',
                )}
              >
                <List.Courses displayLimit={15}>
                  <Course.Thumbnail className="w-fit !rounded-none" />
                </List.Courses>
                <Link
                  style={{
                    width: '100%',
                    border: '1px solid var(--show-more)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '5px',
                    height: '28px',
                  }}
                  to={{
                    pathname: '/discover/:category/:slug',
                  }}
                  params={{
                    category,
                    slug: list?.slug ?? list?.key ?? '',
                  }}
                  unstable_viewTransition
                >
                  <AddCircleOutlineOutlinedIcon
                    fontSize="small"
                    style={{ color: 'var(--show-more)', marginRight: '4px' }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '300',
                      lineHeight: '4px',
                      color: 'var(--show-more)',
                    }}
                  >
                    Show More
                  </span>
                </Link>
              </div>
            </section>
          </List>
        )
      })}
    </section>
  )
}

Course.CourseMatrix = CourseMatrix

export const Stats = ({
  likes,
  watchlists,
}: {
  likes: number
  watchlists: number
}) => {
  return (
    <div className="stats flex w-full justify-between px-2">
      <div className="flex items-center gap-1">
        <ThumbUpOutlinedIcon fontSize="small" />
        <span style={{ marginTop: '2px' }}>{likes}</span>
      </div>
      <div className="flex items-center gap-0.5">
        <StarBorderOutlinedIcon fontSize="small" />
        <span style={{ marginTop: '2px' }}>{watchlists}</span>
      </div>
    </div>
  )
}
Course.Stats = Stats

export const ClickStats = ({
  likes,
  watchlists,
  course_code,
}: {
  likes: number
  watchlists: number
  course_code: string
}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [isFavorited, setIsFavorited] = useState(false)
  const [watchlistCount, setWatchlistCount] = useState(watchlists)

  const { openSignIn } = useClerk()
  const { user, isSignedIn } = useUser()
  const user_id = user?.id || ''

  const { mutate: likeMutate } = useLikeCourse()
  const { mutate: watchlistMutate } = useWatchListCourse()

  const { data: likeStatus } = useGetLikeCourse(user_id, course_code)
  const { data: watchlistStatus } = useGetWatchList(user_id, course_code)

  useEffect(() => {
    if (likeStatus?.liked) {
      setIsLiked(true)
    } else {
      setIsLiked(false)
    }
  }, [likeStatus])

  useEffect(() => {
    if (watchlistStatus?.exist) {
      setIsFavorited(true)
    } else {
      setIsFavorited(false)
    }
  }, [watchlistStatus])

  const handleLikeClick = () => {
    if (!isSignedIn) {
      openSignIn()
      return
    }

    if (isLiked) {
      likeMutate(
        { user_id, course_code, method: 'DELETE' },
        {
          onSuccess: () => {
            setIsLiked(false)
            setLikeCount((prev) => prev - 1)
          },
          onError: (error) => {
            console.error('Error unliking course:', error)
          },
        },
      )
    } else {
      likeMutate(
        { user_id, course_code, method: 'POST' },
        {
          onSuccess: () => {
            setIsLiked(true)
            setLikeCount((prev) => prev + 1)
          },
          onError: (error) => {
            console.error('Error liking course:', error)
          },
        },
      )
    }
  }

  const handleFavoriteClick = () => {
    if (!isSignedIn) {
      openSignIn()
      return
    }

    if (isFavorited) {
      watchlistMutate(
        { user_id, course_code, method: 'DELETE' },
        {
          onSuccess: () => {
            setIsFavorited(false)
            setWatchlistCount((prev) => prev - 1)
          },
          onError: (error) => {
            console.error('Error removing from watchlist:', error)
          },
        },
      )
    } else {
      watchlistMutate(
        { user_id, course_code, method: 'POST' },
        {
          onSuccess: () => {
            setIsFavorited(true)
            setWatchlistCount((prev) => prev + 1)
          },
          onError: (error) => {
            console.error('Error adding to watchlist:', error)
          },
        },
      )
    }
  }

  return (
    <div className="stats flex w-full justify-between px-1">
      <div
        className="flex cursor-pointer items-center gap-1"
        onClick={handleLikeClick}
      >
        {isLiked ? (
          <ThumbUpIcon fontSize="small" />
        ) : (
          <ThumbUpOutlinedIcon fontSize="small" />
        )}
        <span style={{ marginTop: '2px' }}>{likeCount}</span>
      </div>
      <div
        className="flex cursor-pointer items-center gap-0.5"
        onClick={handleFavoriteClick}
      >
        {isFavorited ? (
          <StarIcon fontSize="small" />
        ) : (
          <StarBorderOutlinedIcon fontSize="small" />
        )}
        <span style={{ marginTop: '2px' }}>{watchlistCount}</span>
      </div>
    </div>
  )
}

Course.ClickStats = ClickStats

type StandardCourseListProps = {
  results: Course[] // Define the type of `results` based on your data structure
  number?: boolean
}

export const StandardCourseList = ({
  results,
  number = false,
}: StandardCourseListProps) => {
  return (
    <section>
      {results.map((hcCourse, idx) => {
        const course: Course = HardcoverUtils.parseCourse(hcCourse)
        return (
          <Course
            course={course}
            key={course.key}
          >
            <article
              className={cn(
                'w-full flex-1',
                'flex flex-row gap-4 gap-y-2', // Set flex-row to position image and content side by side
                'lg:flex-row',
              )}
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
            >
              {/* Course Index */}
              {number && (
                <small className="whitespace-nowrap"># {idx + 1}</small>
              )}

              {/* Course Image */}
              <Course.Image />

              {/* Course Content (Title, Description, Tags) */}
              <div
                className={cn('w-full flex-1', 'flex flex-col flex-wrap gap-1')}
              >
                {/* Course Title */}
                <p
                  className={cn(
                    'inline-flex w-full max-w-prose flex-row flex-wrap place-items-center *:truncate *:text-pretty',
                  )}
                >
                  {(course?.title?.split(' ') ?? []).map(
                    (titleText: string, titleIdx: number) => (
                      <span key={`${course.key}-title-${titleIdx}`}>
                        {titleText}&nbsp;
                      </span>
                    ),
                  )}
                  &nbsp;
                </p>

                {/* Course Description */}
                {course?.description && course?.description.trim() !== '' ? (
                  <p
                    className={cn(
                      'small font-light normal-case text-muted-foreground',
                      'line-clamp-2 max-w-prose truncate text-pretty',
                      'max-sm:hidden',
                    )}
                  >
                    {course.description}
                  </p>
                ) : (
                  <p className="italic text-muted-foreground">
                    No description available
                  </p>
                )}

                {/* Course Tags */}
                <div
                  className={cn(
                    'flex flex-row flex-wrap gap-1',
                    'max-sm:hidden',
                  )}
                >
                  {getLimitedArray(hcCourse?.tags ?? [], 5).map(
                    (tag, tagIdx) => (
                      <Badge
                        key={`course-tag-${tagIdx}`}
                        variant="secondary"
                        className={cn('truncate text-xs capitalize', 'w-fit')}
                      >
                        {tag as string}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </article>
          </Course>
        )
      })}
    </section>
  )
}
Course.StandardCourseList = StandardCourseList

export default Course
