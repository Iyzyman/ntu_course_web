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
import { useDeleteBookFromCollectionMutation } from '@/data/clients/collections.api'

import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import {
  UpdateListMembershipParams,
  useUpdateListMembershipMutation,
} from '@/data/clients/shelvd.api'
import { useRootSelector } from '@/data/stores/root'
import { UserSelectors } from '@/data/stores/user.slice'
import { Link, useNavigate } from '@/router'
import { Book as BookInfo, Series, ListData } from '@/types/shelvd'
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
export type Book = BookInfo
//#endregion  //*======== CONTEXT ===========
export type BookContext = {
  book: Book
  isSkeleton?: boolean
  onNavigate: () => void
}
const BookContext = createContext<BookContext | undefined>(undefined)
const useBookContext = () => {
  let ctxValue = useContext(BookContext)
  if (ctxValue === undefined) {
    // throw new Error(
    //   'Expected an Context Provider somewhere in the react tree to set context value',
    // )

    ctxValue = {
      book: {} as Book,
      isSkeleton: true,
      onNavigate: () => {},
    }
  }
  return ctxValue
}
//#endregion  //*======== CONTEXT ===========

//#endregion  //*======== PROVIDER ===========
type BookProvider = PropsWithChildren & Omit<BookContext, 'onNavigate'>
export const Book = ({ children, ...value }: BookProvider) => {
  const navigate = useNavigate()

  const onNavigate = () => {
    if (!value.book) return
    navigate(
      {
        pathname: '/book/:slug',
      },
      {
        params: {
          slug: value.book?.slug ?? value.book.key,
        },
        // unstable_viewTransition: true,
      },
    )
  }

  const isValid = BookInfo.safeParse(value?.book ?? {}).success
  if (!isValid) {
    logger(
      { breakpoint: '[Book.tsx:112]/BookProvider' },
      BookInfo.safeParse(value?.book),
      value,
    )
  }
  return (
    <BookContext.Provider
      value={{
        isSkeleton: !isValid,
        onNavigate,
        ...value,
      }}
    >
      <RenderGuard renderIf={isValid}>{children}</RenderGuard>
    </BookContext.Provider>
  )
}

//#endregion  //*======== PROVIDER ===========

//#endregion  //*======== COMPONENTS ===========

type BookImage = Avatar
export const BookImage = ({ className, children, ...rest }: BookImage) => {
  const { book } = useBookContext()
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
            {/* {book.title} */}
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
              likes={book.likes}
              watchlists={book.watchlists}
            ></Stats>
          </div>
        </>
      )}
    </Avatar>
  )
}

Book.Image = BookImage

type BookThumbnail = Card
export const BookThumbnail = ({
  className,
  children,
  ...rest
}: BookThumbnail) => {
  const { book, isSkeleton, onNavigate } = useBookContext()

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
          <Book.Image />
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
            <small className="capitalize">{book.title.toLowerCase()}</small>
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
Book.Thumbnail = BookThumbnail

type BookDropdown = PropsWithChildren & {
  button?: ButtonProps
}
export const BookDropdownMenu = ({ button, children }: BookDropdown) => {
  const { book } = useBookContext()

  //#endregion  //*======== STORE ===========
  const { openSignIn } = useClerk()
  const { user, isSignedIn } = useUser()
  const lists = useRootSelector(UserSelectors.state).lists

  const coreLists = lists?.core ?? []
  const memberCoreKeys = coreLists
    .filter((list) => list.bookKeys.includes(book.key))
    .map(({ key }) => key)
  const createdLists = lists?.created ?? []
  const memberCreatedKeys = createdLists
    .filter((list) => list.bookKeys.includes(book.key))
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
  }, [book.key])
  //#endregion  //*======== STATES ===========

  const onSelectCoreKey = (key: string) => {
    const isRemove = !key.length

    const keys = new Set(isRemove ? [] : [key])
    const updatedCoreKeys = Array.from(keys)
    setCoreKeys(updatedCoreKeys)

    logger(
      { breakpoint: '[Book.tsx:309]/BookDropdown/onSelectCoreKey' },
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
      { breakpoint: '[Book.tsx:309]/BookDropdown/onSelectCreatedKey' },
      {
        created: {
          prev: memberCreatedKeys,
          curr: updatedCreatedKeys,
        },
      },
    )
  }

  logger(
    { breakpoint: '[Book.tsx:309]/BookDropdown' },
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
      bookKey: book.key,
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

    logger({ breakpoint: '[Book.tsx:309]/BookDropdown/onSubmit' }, params)
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
          {book.title}
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
                  key={`book-${book.key}-collection-core-${list.key}`}
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
                          key={`book-${book.key}-collection-user-${list.key}`}
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

Book.DropdownMenu = BookDropdownMenu

type BookTags = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  tags: string[]

  tag?: BadgeProps

  header?: HTMLAttributes<HTMLDivElement>
}

export const BookTags = ({
  title,
  tags,
  children,
  className,
  tag: { className: tagClsx, ...tagProps } = { className: '' },
  ...rest
}: BookTags) => {
  const { isSkeleton = !tags.length } = useBookContext()
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
      <header className="flex flex-row place-content-between place-items-center gap-2">
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
Book.Tags = BookTags

type BookDescription = HTMLAttributes<HTMLDivElement>
export const BookDescription = ({
  className,
  children,
  ...rest
}: BookDescription) => {
  const { book } = useBookContext()

  const description = book.description ?? ''
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
          color: 'var(----book-description)',
        }}
      >
        {isEmptyDescription
          ? "We don't have a description for this book yet."
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
Book.Description = BookDescription

type BookSeries = HTMLAttributes<HTMLDivElement>
export const BookSeries = ({ className, children, ...rest }: BookSeries) => {
  const { book } = useBookContext()

  //#endregion  //*======== PARAMS ===========
  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========
  const { searchExact, searchExactBulk } = HardcoverEndpoints

  //#endregion  //*======== SERIES/INFO ===========
  //TODO remove series
  const querySeries = searchExact.useQuery(
    {
      category: 'series',
      q: book?.school ?? '', // hc uses slug
    },
    {
      skip: false,
    },
  )

  const infoResults = querySeries.data?.results?.[0]
  const infoIsLoading = querySeries.isLoading || querySeries.isFetching
  let infoIsNotFound =
    !infoIsLoading && !querySeries.isSuccess && (infoResults?.found ?? 0) < 1

  let info: Series = {} as Series
  const hit = (infoResults?.hits ?? [])?.[0]
  if (hit) {
    info = HardcoverUtils.parseDocument({ category: 'series', hit }) as Series
    infoIsNotFound = !Series.safeParse(info).success
  }
  //#endregion  //*======== SERIES/INFO ===========

  //#endregion  //*======== SERIES/BOOKS ===========
  const titles = info?.titles ?? []
  const querySeriesBooks = searchExactBulk.useQuery(
    titles.map((title) => ({
      category: 'books',
      q: title,
    })),
    {
      skip: !titles.length || infoIsNotFound,
    },
  )

  const booksResults = querySeriesBooks.data?.results?.[0]
  const booksIsLoading =
    querySeriesBooks.isLoading || querySeriesBooks.isFetching
  const booksIsNotFound =
    !booksIsLoading &&
    !querySeriesBooks.isSuccess &&
    (booksResults?.found ?? 0) < 1

  //#endregion  //*======== SERIES/BOOKS ===========
  //#endregion  //*======== QUERIES ===========

  if (infoIsNotFound || booksIsNotFound) return null
  return (
    <section
      className={cn('flex flex-col gap-2', className)}
      {...rest}
    >
      <header>
        <h4>
          <span className="capitalize">Series: </span>
          <span
            className={cn(' leading-none tracking-tight text-muted-foreground')}
          >
            {info.name}
          </span>
        </h4>
      </header>

      <div
        className={cn(
          'w-full place-content-start place-items-start gap-2',
          'flex flex-row flex-wrap',
        )}
      >
        {(querySeriesBooks.data?.results ?? []).map((result, idx) => {
          const hit = (result?.hits ?? [])?.[0]
          if (!hit) return null

          const seriesBook = HardcoverUtils.parseDocument({
            category: 'books',
            hit,
          }) as Book
          if (!BookInfo.safeParse(seriesBook).success) return null

          const isCurrentBook = seriesBook.key == book.key
          return (
            <Book
              key={`${idx}-${seriesBook.key}`}
              book={seriesBook!}
            >
              <Book.Thumbnail
                className={cn(
                  'w-fit !rounded-none',
                  idx > 8 && 'hidden sm:block',
                  isCurrentBook && 'border-primary',
                )}
              />
            </Book>
          )
        })}
      </div>

      {children}
    </section>
  )
}
Book.Series = BookSeries

type BiggerBookCard = HTMLAttributes<HTMLDivElement> & {
  username: string
  collection_key: string
  isSignedInUser: boolean
}
export const BiggerBookCard = ({
  className,
  children,
  username,
  collection_key,
  isSignedInUser,
  ...rest
}: BiggerBookCard) => {
  const { onNavigate, book } = useBookContext()
  const [deleteBookFromCollection] = useDeleteBookFromCollectionMutation()
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDeleting(true)
    console.log('Delete Book')
    const deleteBookPayload = {
      username,
      collection_key,
      book_key: book.key,
    }
    deleteBookFromCollection(deleteBookPayload)
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
        <h4 className="text-lg font-bold">{book.title}</h4>
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
          <p className="line-clamp-3">{book.description}</p>
        </CardDescription>
      </CardHeader>
      <Book.Image className="h-full w-full" />

      {children}
    </Card>
  )
}
Book.BiggerBookCard = BiggerBookCard

type BookMatrix = HTMLAttributes<HTMLDivElement> & {
  displayCategoryLists: Hardcover.List[]
  category: string
}
export const BookMatrix = ({ displayCategoryLists, category }: BookMatrix) => {
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
        const books = hcList.books.map((hcBook) =>
          HardcoverUtils.parseBook(hcBook),
        )
        const data = ListData.parse(list)
        return (
          <List
            key={`lists-${category}-${idx}-${list.key}`}
            data={data}
            overwriteBooks={books}
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
                <List.Books displayLimit={15}>
                  <Book.Thumbnail className="w-fit !rounded-none" />
                </List.Books>
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

Book.BookMatrix = BookMatrix

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
Book.Stats = Stats

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

Book.ClickStats = ClickStats
// type BookEditions = HTMLAttributes<HTMLDivElement>
// const BookEditions = ({
//   children,
//   className,
//   ...rest
// }: BookEditions) => {
//   const { book } = useBookContext()

//   //#endregion  //*======== SOURCE/HC ===========
//   const { getEditionsById } = HardcoverEndpoints
//   const hcEditionsQuery = getEditionsById.useQuery({
//     id: +(book.key) ?? 0,
//   }, {
//     skip: (book.source !== 'hc'),
//   })

//   const hcEditions = useMemo(() => {
//     const { data } = hcEditionsQuery

//     const editions = data?.data?.editions ?? []
//     return editions
//   }, [hcEditionsQuery])

//   //#endregion  //*======== SOURCE/HC ===========

//   const editions = useMemo(() => {
//     let editions = []
//     switch (book.source) {
//       case 'hc': {
//         editions = hcEditions
//       }
//     }

//     if (editions.length) {
//       logger({ breakpoint: '[Book.tsx:616]/BookEditions' }, { editions })
//     }

//     return editions
//   }, [book.source, hcEditions])
//   if (!editions.length) return null

//   return (
//     <section className={cn("flex flex-col gap-2", className)} {...rest}>

//       <pre>
//         {JSON.stringify({
//           book,
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

//           const seriesBook = HardcoverUtils.parseDocument({ category: 'books', hit }) as Book
//           if (!seriesBook) return

//           const isCurrentBook = seriesBook.key == book.key
//           return (
//             <Book
//               key={`${seriesBook.source}-${idx}-${seriesBook.key}`}
//               book={seriesBook!}
//             >
//               <Book.Thumbnail
//                 className={cn(
//                   'w-fit !rounded-none',
//                   idx > 8 && 'hidden sm:block',
//                   isCurrentBook && 'border-primary'
//                 )}
//               />
//             </Book>
//           )
//         })}
//       </div> */}

//       {children}
//     </section>
//   )
// }
// Book.Editions = BookEditions

export default Book
