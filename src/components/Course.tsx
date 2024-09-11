import { RenderGuard } from '@/components/providers/render.provider'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, BadgeProps } from '@/components/ui/Badge'
import { Button, ButtonProps } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { List } from '@/components/List'
import { Hardcover } from '@/types'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown-Menu'
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/Hover.Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDeleteCourseFromCollectionMutation } from '@/data/clients/collections.api'

import {
  UpdateListMembershipParams,
  useUpdateListMembershipMutation,
} from '@/data/clients/shelvd.api'
import { useRootSelector } from '@/data/stores/root'
import { UserSelectors } from '@/data/stores/user.slice'
import { Link, useNavigate } from '@/router'
import { Course as CourseInfo, ListData } from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { ShelvdUtils } from '@/utils/clients/shelvd'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { getUniqueArray } from '@/utils/helpers'
import { useClerk, useUser } from '@clerk/clerk-react'
import {
  BookmarkFilledIcon,
  BookmarkIcon,
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
      onNavigate: () => {},
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
          slug: value.course?.slug ?? value.course.key,
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
  //TODO: change to course code
  return (
    <Avatar
      className={cn(
        'flex place-content-center place-items-center overflow-clip p-0.5',
        'aspect-square', // Ensures aspect ratio of 1:1
        'h-[113px] w-[113px]', // Set the size to 113px by 113px
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
            SCXXXX
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

type CourseThumbnail = Card
export const CourseThumbnail = ({
  className,
  children,
  ...rest
}: CourseThumbnail) => {
  const { course, isSkeleton, onNavigate } = useCourseContext()

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
      <HoverCardContent
        side="top"
        sideOffset={5}
        className={cn(
          'flex flex-col gap-2',
          'w-[113]',
          'h-[113]',
          'p-4', // Increase padding for more space inside
          'py-4', // Optional: Increase padding-top and padding-bottom
          'rounded-md',
        )}
      >
        <HoverCardArrow className="fill-secondary" />
        {isSkeleton ? (
          <Skeleton className="h-4 w-[100px]" />
        ) : (
          <small className="text-sm leading-none">
            <small className="capitalize">{course.title.toLowerCase()}</small>
          </small>
        )}

        {isSkeleton ? (
          <Skeleton className="h-4 w-[100px]" />
        ) : (
          <small className="capitalize text-muted-foreground"></small>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
Course.Thumbnail = CourseThumbnail

type CourseDropdown = PropsWithChildren & {
  button?: ButtonProps
}
export const CourseDropdownMenu = ({ button, children }: CourseDropdown) => {
  const { course } = useCourseContext()

  //#endregion  //*======== STORE ===========
  const { openSignIn } = useClerk()
  const { user, isSignedIn } = useUser()
  const lists = useRootSelector(UserSelectors.state).lists

  const coreLists = lists?.core ?? []
  const memberCoreKeys = coreLists
    .filter((list) => list.courseKeys.includes(course.key))
    .map(({ key }) => key)
  const createdLists = lists?.created ?? []
  const memberCreatedKeys = createdLists
    .filter((list) => list.courseKeys.includes(course.key))
    .map(({ key }) => key)
  //#endregion  //*======== STORE ===========

  //#endregion  //*======== STATES ===========
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [coreKeys, setCoreKeys] = useState<string[]>(memberCoreKeys)
  const [createdKeys, setCreatedKeys] = useState<string[]>(memberCreatedKeys)

  const reset = () => {
    setIsOpen(false)
    setCoreKeys(getUniqueArray(memberCoreKeys))
    setCreatedKeys(getUniqueArray(memberCreatedKeys))
  }

  // reset states on mount
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.key])
  //#endregion  //*======== STATES ===========

  const onSelectCoreKey = (key: string) => {
    const isRemove = !key.length

    const keys = new Set(isRemove ? [] : [key])
    const updatedCoreKeys = Array.from(keys)
    setCoreKeys(updatedCoreKeys)

    logger(
      { breakpoint: '[Course.tsx:309]/CourseDropdown/onSelectCoreKey' },
      {
        created: {
          prev: memberCoreKeys,
          curr: updatedCoreKeys,
        },
      },
    )
  }

  const onSelectCreatedKey = (key: string) => {
    const keys = new Set(createdKeys)
    const isAdded = keys.has(key)

    if (!isAdded) {
      keys.add(key)
    } else {
      keys.delete(key)
    }

    const updatedCreatedKeys = Array.from(keys)
    setCreatedKeys(updatedCreatedKeys)

    logger(
      { breakpoint: '[Course.tsx:309]/CourseDropdown/onSelectCreatedKey' },
      {
        created: {
          prev: memberCreatedKeys,
          curr: updatedCreatedKeys,
        },
      },
    )
  }

  logger(
    { breakpoint: '[Course.tsx:309]/CourseDropdown' },
    // { memberCoreKeys, memberCreatedKeys },
    // { coreKeys, createdKeys },
    {
      coreLists,
    },
    {
      core: {
        prev: memberCoreKeys,
        curr: coreKeys,
      },
      created: {
        prev: memberCreatedKeys,
        curr: createdKeys,
      },
    },
  )

  //#endregion  //*======== MUTATIONS ===========
  const [upateListMembership] = useUpdateListMembershipMutation()
  const onSubmit = () => {
    if (!isSignedIn) return
    const params = UpdateListMembershipParams.parse({
      userId: user?.id,
      courseKey: course.key,
      core: {
        prev: memberCoreKeys,
        curr: coreKeys,
      },
      created: {
        prev: memberCreatedKeys,
        curr: createdKeys,
      },
    })
    upateListMembership(params)

    logger({ breakpoint: '[Course.tsx:309]/CourseDropdown/onSubmit' }, params)
  }
  //#endregion  //*======== MUTATIONS ===========

  const MarkIcon = !coreKeys.length ? BookmarkIcon : BookmarkFilledIcon
  const MenuChevron = isOpen ? ChevronUpIcon : ChevronDownIcon
  // if (!isSignedIn) return null
  return (
    <DropdownMenu
      open={isSignedIn ? isOpen : false}
      onOpenChange={(open) => {
        if (!isSignedIn) {
          openSignIn()
          return
        }
        setIsOpen(open)
        if (open) return
        onSubmit()
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          className="flex w-1/5 min-w-fit flex-row !place-content-start place-items-center gap-1 px-1.5 py-0.5"
          {...button}
        >
          <MarkIcon className="size-4" />
          <span>
            {!coreKeys.length
              ? 'Want to Read'
              : ShelvdUtils.coreListNames?.[coreKeys?.[0]]}
          </span>
          <MenuChevron className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="small py-0 text-xs capitalize text-muted-foreground">
          {course.title}
        </DropdownMenuLabel>

        {!!coreLists.length && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={coreKeys?.[0]}
              onValueChange={onSelectCoreKey}
            >
              {coreLists.map((list) => (
                <DropdownMenuRadioItem
                  key={`course-${course.key}-collection-core-${list.key}`}
                  value={list.key}
                >
                  {list.name}
                </DropdownMenuRadioItem>
              ))}

              {!!coreKeys.length && (
                <DropdownMenuRadioItem
                  value={''}
                  disabled={!coreKeys.length}
                  className={cn('text-destructive', 'disabled:hidden')}
                >
                  Remove
                </DropdownMenuRadioItem>
              )}
            </DropdownMenuRadioGroup>
          </>
        )}

        {!!createdLists.length && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Add to list</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-0">
                <Command>
                  <CommandInput
                    placeholder="Search lists..."
                    autoFocus={true}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No lists found.</CommandEmpty>
                    <CommandGroup>
                      {createdLists.map((list) => (
                        <CommandItem
                          key={`course-${course.key}-collection-user-${list.key}`}
                          value={list.key}
                          onSelect={onSelectCreatedKey}
                          className="flex flex-row place-items-center gap-2"
                        >
                          <Checkbox
                            id={list.key}
                            checked={createdKeys.includes(list.key)}
                          />
                          {list.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

Course.DropdownMenu = CourseDropdownMenu

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
  prerequisites?: Course[]
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
          <span>Prerequisites </span>
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
          if (!validation.success) return null

          return (
            <Course
              key={`${idx}-${prerequisite.key}`}
              course={prerequisite}
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
    console.log('Delete Course')
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
}: {
  likes: number
  watchlists: number
}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  //TODO call likes and watchlist api when click

  const handleLikeClick = () => {
    setIsLiked((prev) => !prev)
  }

  const handleFavoriteClick = () => {
    setIsFavorited((prev) => !prev)
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
        <span style={{ marginTop: '2px' }}>{likes}</span>
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
        <span style={{ marginTop: '2px' }}>{watchlists}</span>
      </div>
    </div>
  )
}

Course.ClickStats = ClickStats
// type CourseEditions = HTMLAttributes<HTMLDivElement>
// const CourseEditions = ({
//   children,
//   className,
//   ...rest
// }: CourseEditions) => {
//   const { course } = useCourseContext()

//   //#endregion  //*======== SOURCE/HC ===========
//   const { getEditionsById } = HardcoverEndpoints
//   const hcEditionsQuery = getEditionsById.useQuery({
//     id: +(course.key) ?? 0,
//   }, {
//     skip: (course.source !== 'hc'),
//   })

//   const hcEditions = useMemo(() => {
//     const { data } = hcEditionsQuery

//     const editions = data?.data?.editions ?? []
//     return editions
//   }, [hcEditionsQuery])

//   //#endregion  //*======== SOURCE/HC ===========

//   const editions = useMemo(() => {
//     let editions = []
//     switch (course.source) {
//       case 'hc': {
//         editions = hcEditions
//       }
//     }

//     if (editions.length) {
//       logger({ breakpoint: '[Course.tsx:616]/CourseEditions' }, { editions })
//     }

//     return editions
//   }, [course.source, hcEditions])
//   if (!editions.length) return null

//   return (
//     <section className={cn("flex flex-col gap-2", className)} {...rest}>

//       <pre>
//         {JSON.stringify({
//           course,
//           editions,
//         }, null, 2)}
//       </pre>
//       {/* <div
//         className={cn(
//           'w-full place-content-start place-items-start gap-2',
//           'flex flex-row flex-wrap',
//         )}
//       >
//         {(hcSearchSeriesTitles.data?.results ?? []).map((result, idx) => {
//           const hit = (result?.hits ?? [])?.[0]
//           if (!hit) return null

//           const seriesCourse = HardcoverUtils.parseDocument({ category: 'courses', hit }) as Course
//           if (!seriesCourse) return

//           const isCurrentCourse = seriesCourse.key == course.key
//           return (
//             <Course
//               key={`${seriesCourse.source}-${idx}-${seriesCourse.key}`}
//               course={seriesCourse!}
//             >
//               <Course.Thumbnail
//                 className={cn(
//                   'w-fit !rounded-none',
//                   idx > 8 && 'hidden sm:block',
//                   isCurrentCourse && 'border-primary'
//                 )}
//               />
//             </Course>
//           )
//         })}
//       </div> */}

//       {children}
//     </section>
//   )
// }
// Course.Editions = CourseEditions

export default Course
