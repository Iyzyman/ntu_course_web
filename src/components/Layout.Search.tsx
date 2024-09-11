import Author from '@/components/Author'
import Course from '@/components/Course'
import Series from '@/components/Series'
import { RenderGuard } from '@/components/providers/render.provider'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/components/ui/Command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/Pagination'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { AppCommandKey } from '@/data/static/app'
import { AppActions, AppSelectors } from '@/data/stores/app.slice'
import { useRootDispatch, useRootSelector } from '@/data/stores/root'
import { SearchActions, SearchSelectors } from '@/data/stores/search.slice'
import { useNavigate } from '@/router'
import { Hardcover } from '@/types'
import {
  Character,
  DefaultSearchCategory,
  List,
  SearchCategories,
  SearchCategory,
} from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { getLimitedArray, isSimilarStrings } from '@/utils/helpers'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BookmarkIcon,
  MagnifyingGlassIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import {
  ComponentProps,
  Dispatch,
  Fragment,
  HTMLAttributes,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'

const DisplaySearchCategories = SearchCategory.extract(['courses', 'authors'])

const SearchFormSchema = Hardcover.QuerySearchParams.extend({
  category: SearchCategory.default(DefaultSearchCategory),
}).default({
  q: '',
  page: 1,
  category: DefaultSearchCategory,
})

const DefaultSearchQuery: z.infer<typeof SearchFormSchema> =
  SearchFormSchema.parse({})

//#endregion  //*======== CONTEXT ===========
export type SearchContext = {
  form: UseFormReturn<typeof DefaultSearchQuery>
  isNavigatable: boolean
  setIsNavigatable: Dispatch<SetStateAction<boolean>>

  searchQuery: typeof DefaultSearchQuery
  setSearchQuery: Dispatch<SetStateAction<typeof DefaultSearchQuery>>

  onSubmitSearch: () => void
  onResetSearch: () => void
  data?: Hardcover.SearchQueryResponse<
    Hardcover.SearchDocument<SearchCategories>
  >
  dataCount: number

  // isSamePrefix: boolean
  isEmptyQuery: boolean
  isSameQuery: boolean
  isSimilarQuery: boolean
  isLoadingSearch: boolean
}
const SearchContext = createContext<SearchContext | undefined>(undefined)
const useSearchContext = () => {
  let ctxValue = useContext(SearchContext)
  const defaultCtxValue = useDefaultSearchContext()
  if (ctxValue === undefined) {
    // const error = new Error(
    //   'Expected an Context Provider somewhere in the react tree to set context value',
    // )
    // throw error

    ctxValue = defaultCtxValue
  }

  return ctxValue
}

const useDefaultSearchContext = (): SearchContext => {
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()

  const dispatch = useRootDispatch()
  const [history, addHistory] = [
    useRootSelector(SearchSelectors.state).history,
    SearchActions.addHistory,
  ]

  //#endregion  //*======== STATES ===========
  const [searchQuery, setSearchQuery] =
    useState<typeof DefaultSearchQuery>(DefaultSearchQuery)
  const [prevSearchQuery, setPrevSearchQuery] =
    useState<typeof searchQuery>(searchQuery)
  const [isNavigatable, setIsNavigatable] = useState<boolean>(false)

  const form = useForm<typeof DefaultSearchQuery>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: DefaultSearchQuery,
  })

  //#endregion  //*======== STATES ===========

  const { search } = HardcoverEndpoints
  const { data, isLoading, isFetching } = search.useQuery(searchQuery)

  const dataCount: number = data?.results?.[0]?.found ?? 0

  const { q: query, category } = form.getValues()
  const isEmptyQuery = !searchQuery.q.length
  const isSameQuery = prevSearchQuery.q === query
  const isSameCategory = prevSearchQuery.category === category
  const isSimilarQuery =
    isSimilarStrings(query, searchQuery.q) && isSameCategory

  const isLoadingSearch = isLoading || isFetching

  const onSubmitForm = (values: typeof DefaultSearchQuery) => {
    const isPrevCategory = searchQuery.category === values.category
    values.page = isPrevCategory ? values?.page ?? 1 : 1

    logger(
      { breakpoint: '[Layout.Search.tsx:89]' },
      {
        prev: searchQuery,
        next: values,
        data,
      },
      {
        isPrevCategory,
        currPage: values.page,
        nextPage: (values?.page ?? 1) + +isPrevCategory,
      },
      history,
    )
    setPrevSearchQuery(searchQuery)
    setSearchQuery(values)

    dispatch(
      addHistory({
        category: values.category,
        query: values.q,
      }),
    )

    if (isNavigatable) {
      navigate(
        {
          pathname: '/search/:category',
          search: `?${new URLSearchParams({
            q: values.q,
            type: values.category,
            page: (values.page ?? 1).toString(),
          }).toString()}`,
        },
        {
          params: {
            category: values.category,
          },
          unstable_viewTransition: true,
        },
      )
    }
  }

  const onResetForm = () => {
    setSearchQuery(DefaultSearchQuery)
    setSearchParams(new URLSearchParams({}))
    form.reset()
  }

  const onSubmitSearch = () => form.handleSubmit(onSubmitForm)()

  const onResetSearch = () => onResetForm()

  return {
    form,
    isNavigatable,
    setIsNavigatable,
    searchQuery,
    setSearchQuery,

    data,
    dataCount,

    onSubmitSearch,
    onResetSearch,

    isEmptyQuery,
    isSameQuery,
    isSimilarQuery,
    isLoadingSearch,
  }
}
//#endregion  //*======== CONTEXT ===========

type SearchProvider = PropsWithChildren & {
  defaults?: Partial<typeof DefaultSearchQuery>
}
export const Search = ({ children }: SearchProvider) => {
  const ctx = useDefaultSearchContext()

  return (
    <SearchContext.Provider value={ctx}>
      <RenderGuard>
        <Form {...ctx.form}>{children}</Form>
      </RenderGuard>
    </SearchContext.Provider>
  )
}

type SearchForm = PropsWithChildren & {
  isNavigatable?: boolean
  defaults?: Partial<typeof DefaultSearchQuery>
}
export const SearchForm = ({
  isNavigatable = false,
  children,
  defaults,
}: SearchForm) => {
  const {
    form,
    onSubmitSearch,

    setIsNavigatable,
  } = useSearchContext()

  useEffect(() => {
    if (!defaults) return

    setIsNavigatable(isNavigatable)
    form.reset(SearchFormSchema.parse(defaults))
    onSubmitSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmitSearch()
      }}
      className="space-y-8"
    >
      <FormField
        control={form.control}
        name="q"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                {...field}
                placeholder="Search for a course, author or character ..."
                onKeyDown={(e) => {
                  const key = e.key.toLowerCase()
                  const isEnter = key === 'Enter'.toLowerCase()

                  if (isEnter) onSubmitSearch()
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {children}
    </form>
  )
}
Search.Form = SearchForm

type SearchCommand = PropsWithChildren
export const SearchCommand = ({ children }: SearchCommand) => {
  const {
    form,
    dataCount,
    onSubmitSearch,

    isEmptyQuery,
    isSimilarQuery,
    isLoadingSearch,
  } = useSearchContext()

  const dispatch = useRootDispatch()
  const [isVisible, setIsVisible, history] = [
    useRootSelector(AppSelectors.state).searchCommandVisibility,
    AppActions.setSearchCommandVisibility,
    useRootSelector(SearchSelectors.state).history,
  ]

  const { category, q } = form.getValues()
  const categoryHistory = history?.[category] ?? []
  const isEmptyCategoryHistory = !categoryHistory.length

  const [query, setQuery] = useState<typeof q>(q)
  const isDifferentEmptyQuery = !query.length && query !== q
  useEffect(() => {
    if (isDifferentEmptyQuery) {
      setQuery(q)
    }
  }, [isDifferentEmptyQuery, q])

  return (
    <>
      <SearchCommand.Trigger />

      <CommandDialog
        open={isVisible}
        onOpenChange={(visibility) => {
          dispatch(setIsVisible(visibility))
        }}
      >
        <CommandInput
          value={query}
          onValueChange={(value) => {
            setQuery(value)
            form.setValue('q', value)
          }}
          onKeyDown={(e) => {
            const key = e.key.toLowerCase()
            const isEnter = key === 'Enter'.toLowerCase()
            if (isEnter) return onSubmitSearch()
          }}
          placeholder={'Search for a course, author or character ...'}
        />

        <SearchCommand.Tabs />
        <CommandList>
          <SearchCommand.Loading />

          <SearchCommand.Results />

          <CommandEmpty
            className={cn(
              isEmptyQuery && 'hidden',
              'flex flex-col place-content-start place-items-center gap-2',
              'text-sm *:px-4 *:py-3',
            )}
          >
            {!dataCount && isSimilarQuery && !isLoadingSearch && (
              <div className="w-full text-center text-muted-foreground">
                No results found.
              </div>
            )}

            <CommandLoading
              className={cn(
                'text-muted-foreground [&>div]:flex [&>div]:w-full [&>div]:flex-row [&>div]:place-content-center [&>div]:place-items-center [&>div]:gap-2',
                (isLoadingSearch || isSimilarQuery) && 'hidden',
              )}
            >
              <span>
                Press&nbsp;
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">Enter</span>
                </kbd>
                &nbsp; to search
              </span>
            </CommandLoading>
          </CommandEmpty>

          <CommandGroup
            heading="Past Searches"
            className={cn(isEmptyCategoryHistory && 'hidden')}
          >
            {categoryHistory.map((pastQuery, idx) => (
              <CommandItem
                key={`history-${category}-${idx}`}
                value={pastQuery}
                onSelect={() => {
                  setQuery(pastQuery)
                  form.setValue('q', pastQuery)
                  onSubmitSearch()
                }}
                className="flex flex-row place-items-center gap-2"
              >
                <MagnifyingGlassIcon className="size-4" />
                <span className="italic text-muted-foreground">
                  {pastQuery}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          {children}
        </CommandList>
      </CommandDialog>
    </>
  )
}

Search.Command = SearchCommand

type SearchResultItem = HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean
}
export const SearchResultItem = ({
  asChild = false,
  children,
  className,
  ...rest
}: SearchResultItem) => {
  if (asChild) {
    return <Fragment {...rest}>{children}</Fragment>
  }
  return (
    <div
      className={cn(
        'flex w-full flex-row place-items-center gap-8',
        'shrink-0 snap-start',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

Search.ResultItem = SearchResultItem
SearchCommand.ResultItem = Search.ResultItem

type SearchResults = HTMLAttributes<HTMLDivElement>
export const SearchResults = ({ className, ...rest }: SearchResults) => {
  const navigate = useNavigate()

  const {
    form,
    searchQuery,

    data,

    isEmptyQuery,
    isSimilarQuery,
    isLoadingSearch,
  } = useSearchContext()

  const results = data?.results?.[0]
  const { category, q: query } = form.getValues()

  logger({ breakpoint: '[Layout.Search.tsx:471]' }, { results })

  return (
    <>
      {!isEmptyQuery && isSimilarQuery && (
        <h4 className="small my-2 font-medium text-muted-foreground">
          Results for <i>"{searchQuery.q}"</i> in{' '}
          <u className="capitalize">{category}</u>
        </h4>
      )}

      <aside
        className={cn(
          'w-full flex-row place-content-center place-items-center gap-2 text-muted-foreground',
          isLoadingSearch ? 'flex' : 'hidden',
        )}
      >
        <UpdateIcon className="size-4 animate-spin" />
        <span>Hang on…</span>
      </aside>

      <main
        className={cn(isLoadingSearch && 'hidden', className)}
        {...rest}
      >
        {(results?.hits ?? []).map((hit, idx) => {
          if (!hit) return
          if (category === 'courses') {
            const document = hit.document as Hardcover.SearchCourse
            const hcCourse = HardcoverUtils.parseCourseDocument({ document })
            const course = HardcoverUtils.parseCourse(hcCourse) as Course
            if (!course) return null
            return (
              <Search.ResultItem
                key={`${idx}-${course.key}`}
                onClick={() => {
                  navigate(
                    {
                      pathname: '/course/:slug',
                    },
                    {
                      params: {
                        slug: course?.slug ?? course.key,
                      },
                      unstable_viewTransition: true,
                    },
                  )
                }}
                className={cn(
                  'w-full gap-x-4 gap-y-2',
                  'place-items-start',
                  // 'grid grid-cols-5 gap-2'
                  // 'flex-wrap',
                  // 'flex-col sm:flex-row'
                )}
              >
                <Course course={course!}>
                  <Course.Image />

                  <article
                    className={cn(
                      'w-full flex-1',
                      'flex flex-col lg:flex-row',
                      'gap-2',
                    )}
                  >
                    <div
                      className={cn(
                        'w-full flex-1',
                        'flex flex-col flex-wrap gap-1',

                        '*:!mt-0',
                      )}
                    >
                      <p
                        className={cn(
                          'inline-flex w-full max-w-prose flex-row flex-wrap place-items-center *:truncate *:text-pretty',
                        )}
                      >
                        {(course?.title?.split(' ') ?? []).map(
                          (titleText: string, idx: number) => (
                            <span
                              key={`${course.key}-title-${idx}`}
                              className={cn(
                                query
                                  .toLowerCase()
                                  .includes(titleText.toLowerCase()) &&
                                  'text-yellow-500',
                              )}
                            >
                              {titleText}&nbsp;
                            </span>
                          ),
                        )}
                        &nbsp;
                        <small className="text-muted-foreground">
                          ({hcCourse?.pubYear ?? '???'})
                        </small>
                      </p>

                      <p className="last-child:text-pretty last-child:truncate inline-flex w-full max-w-prose flex-row place-items-baseline	 truncate text-pretty">
                        <small className="!whitespace-nowrap uppercase text-muted-foreground">
                          by
                        </small>
                        &nbsp;
                      </p>

                      {course?.description && (
                        <p
                          className={cn(
                            'small font-light normal-case text-muted-foreground',
                            'line-clamp-2 max-w-prose truncate text-pretty',
                            'max-sm:hidden',
                          )}
                        >
                          {course.description}
                        </p>
                      )}

                      <div
                        className={cn(
                          'flex flex-row flex-wrap gap-1',
                          'max-sm:hidden',
                        )}
                      >
                        {getLimitedArray(hcCourse?.genres ?? [], 5).map(
                          (tag, idx) => (
                            <Badge
                              key={`course-tag-${idx}`}
                              variant="secondary"
                              className={cn(
                                'truncate text-xs capitalize',
                                'w-fit',
                              )}
                            >
                              {tag}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>

                    <aside className="flex flex-row place-content-end max-md:place-content-start md:flex-col">
                      <Course.DropdownMenu />
                    </aside>
                  </article>
                </Course>
              </Search.ResultItem>
            )
          } else if (category === 'authors') {
            const author = HardcoverUtils.parseDocument({
              category,
              hit,
            }) as Author
            if (!author) return null
            return (
              <SearchCommand.ResultItem
                key={`${idx}-${author.key}`}
                onClick={() => {
                  navigate(
                    {
                      pathname: '/author/:slug',
                    },
                    {
                      params: {
                        slug: author?.slug ?? author.key,
                      },
                      unstable_viewTransition: true,
                    },
                  )
                }}
              >
                <Author author={author!}>
                  <Author.Image className="size-16" />
                  <p>
                    {(author?.name?.split(' ') ?? []).map(
                      (titleText: string, idx: number) => (
                        <span
                          key={`${author.key}-name-${idx}`}
                          className={cn(
                            query
                              .toLowerCase()
                              .includes(titleText.toLowerCase()) &&
                              'text-yellow-500',
                          )}
                        >
                          {titleText}&nbsp;
                        </span>
                      ),
                    )}
                  </p>
                </Author>
              </SearchCommand.ResultItem>
            )
          } else if (category === 'series') {
            const series = HardcoverUtils.parseDocument({
              category,
              hit,
            }) as Series
            const isEmptySeries = !(series?.coursesCount ?? 0)
            if (!series || isEmptySeries) return null
            return (
              <SearchCommand.ResultItem
                key={`${idx}-${series.key}`}
                // onClick={() => {
                //   navigate(
                //     {
                //       pathname: '/series/:slug?',
                //     },
                //     {
                //       state: {
                //         source: series.source,
                //       },
                //       params: {
                //         slug: series?.slug ?? series.key,
                //       },
                //       unstable_viewTransition: true,
                //     },
                //   )
                // }}
                className={cn(
                  'flex flex-col place-content-start place-items-start gap-4',
                  'w-full border-b py-2',
                )}
              >
                <Series series={series!}>
                  <header className="flex flex-row flex-wrap place-content-center place-items-center gap-2">
                    <p className="h4 capitalize">
                      {((series?.name ?? '')?.split(' ') ?? []).map(
                        (titleText: string, idx: number) => (
                          <span
                            key={`${series.key}-name-${idx}`}
                            className={cn(
                              query
                                .toLowerCase()
                                .includes(titleText.toLowerCase()) &&
                                'text-yellow-500',
                            )}
                          >
                            {titleText}&nbsp;
                          </span>
                        ),
                      )}
                    </p>
                    <Badge variant={'outline'}>
                      {series?.coursesCount ?? 0} courses
                    </Badge>
                  </header>

                  <aside
                    className={cn(
                      'w-fit place-content-start place-items-start gap-2',
                      'flex flex-row flex-wrap',
                      'sm:max-w-xl',
                    )}
                  >
                    <Series.Courses displayLimit={12}>
                      <Course.Thumbnail className="w-fit !rounded-none" />
                    </Series.Courses>
                  </aside>
                </Series>
              </SearchCommand.ResultItem>
            )
          }

          const artifact = HardcoverUtils.parseDocument({ category, hit }) as
            | Character
            | List
          return (
            <SearchCommand.ResultItem key={`${idx}-${artifact.key}`}>
              <p>
                {artifact?.name?.split(' ').map((titleText, idx) => (
                  <span
                    key={`${artifact.key}-title-${idx}`}
                    className={cn(
                      query.toLowerCase().includes(titleText.toLowerCase()) &&
                        'text-yellow-500',
                    )}
                  >
                    {titleText}&nbsp;
                  </span>
                ))}
              </p>
              <small>{+(artifact.coursesCount ?? 0)}</small>
            </SearchCommand.ResultItem>
          )
        })}
      </main>
    </>
  )
}
Search.Results = SearchResults

type SearchResultsPagination = {
  isNavigatable?: boolean
}
export const SearchResultsPagination = ({
  isNavigatable = false,
}: SearchResultsPagination) => {
  const {
    form,
    data,

    onSubmitSearch,
    setIsNavigatable,

    isSimilarQuery,
    isLoadingSearch,
  } = useSearchContext()

  const results = data?.results?.[0]

  const resultsThreshold = results?.request_params?.per_page ?? 1
  const resultsFound = results?.found ?? 0

  const currentPage = results?.page ?? 1
  const maxPage = Math.ceil(resultsFound / resultsThreshold)

  const isFirstPage = currentPage === 1
  const pageRange = {
    min: isFirstPage ? currentPage : currentPage - 1,
    mid: isFirstPage ? currentPage + 1 : currentPage,
    max: isFirstPage
      ? currentPage + 2
      : currentPage + 1 <= maxPage
        ? currentPage + 1
        : maxPage,
  }

  const onPageChange = (page: number) => {
    const isValidPage: boolean = page > 0 && page <= maxPage
    if (!isValidPage) return

    const isNextCurrentPage: boolean = page === currentPage
    if (isNextCurrentPage) return

    form.setValue('page', isSimilarQuery ? page ?? 1 : 1)
    setIsNavigatable(isNavigatable)
    onSubmitSearch()
  }

  const onPagePrevious = () => onPageChange(pageRange.min)
  const onPageNext = () => onPageChange(pageRange.max)

  if (isLoadingSearch || maxPage < 2) return null
  return (
    <Pagination>
      <PaginationContent className="m-0">
        <PaginationItem onClick={onPagePrevious}>
          <PaginationPrevious className="max-sm:!px-2 max-sm:[&>span]:hidden" />
        </PaginationItem>
        {Object.entries(pageRange).map(([key, page]) => (
          <PaginationItem key={`search-page-${key}`}>
            <PaginationLink
              isActive={page === currentPage}
              onClick={() => {
                onPageChange(page)
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem onClick={onPageNext}>
          <PaginationNext className="max-sm:!px-2 max-sm:[&>span]:hidden" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

SearchResults.Pagination = SearchResultsPagination
Search.Pagination = SearchResults.Pagination

export const SearchCommandResults = () => {
  const navigate = useNavigate()
  const dispatch = useRootDispatch()
  const [isVisible, setIsVisible] = [
    useRootSelector(AppSelectors.state).searchCommandVisibility,
    AppActions.setSearchCommandVisibility,
  ]

  const toggleVisibility = useCallback(() => {
    const visibility = !isVisible
    dispatch(setIsVisible(visibility))
  }, [dispatch, isVisible, setIsVisible])

  const {
    form,
    searchQuery,

    data,
    dataCount,
    onSubmitSearch,

    isEmptyQuery,
    isLoadingSearch,
  } = useSearchContext()

  const results = data?.results?.[0]
  const { category, q: query } = form.getValues()

  const displayLimit = 5
  const hits = results?.hits ?? []
  const displayHits = isEmptyQuery ? getLimitedArray(hits, displayLimit) : hits
  return (
    <CommandGroup
      className={cn(isLoadingSearch && 'hidden')}
      heading={
        isEmptyQuery ? (
          'Popular Searches'
        ) : (
          <>
            Results for <i>"{searchQuery.q}"</i> in{' '}
            <u className="capitalize">{category}</u>
          </>
        )
      }
    >
      {displayHits.map((hit, idx) => {
        if (!hit) return

        if (category === 'courses') {
          const course = HardcoverUtils.parseDocument({
            category,
            hit,
          }) as Course
          return (
            <SearchCommand.ResultItem
              key={`${idx}-${course.key}`}
              asChild
            >
              <Course course={course!}>
                <CommandItem
                  value={course.title}
                  className={cn(
                    'flex w-full flex-row place-items-center gap-2',
                  )}
                  onSelect={(query) => {
                    if (isEmptyQuery) {
                      form.setValue('q', query)
                      onSubmitSearch()
                    } else {
                      navigate(
                        {
                          pathname: '/course/:slug',
                        },
                        {
                          params: {
                            slug: course?.slug ?? course.key,
                          },
                          unstable_viewTransition: true,
                        },
                      )

                      toggleVisibility()
                    }
                  }}
                >
                  {isEmptyQuery ? (
                    <MagnifyingGlassIcon className="size-4" />
                  ) : (
                    <Course.Image />
                  )}

                  <p className="!m-0">
                    {course?.title
                      ?.split(' ')
                      .map((titleText: string, idx: number) => (
                        <span
                          key={`${course.key}-title-${idx}`}
                          className={cn(
                            query
                              .toLowerCase()
                              .includes(titleText.toLowerCase()) &&
                              'text-yellow-500',
                          )}
                        >
                          {titleText}&nbsp;
                        </span>
                      ))}
                  </p>
                </CommandItem>
              </Course>
            </SearchCommand.ResultItem>
          )
        } else if (category === 'authors') {
          const author = HardcoverUtils.parseDocument({
            category,
            hit,
          }) as Author
          if (!author) return null
          return (
            <SearchCommand.ResultItem
              key={`${idx}-${author.key}`}
              asChild
            >
              <Author author={author!}>
                <CommandItem
                  value={author.name}
                  className={cn(
                    'flex w-full flex-row place-items-center gap-2',
                  )}
                  onSelect={(query) => {
                    if (isEmptyQuery) {
                      form.setValue('q', query)
                      onSubmitSearch()
                    } else {
                      navigate(
                        {
                          pathname: '/author/:slug',
                        },
                        {
                          params: {
                            slug: author?.slug ?? author.key,
                          },
                          unstable_viewTransition: true,
                        },
                      )

                      toggleVisibility()
                    }
                  }}
                >
                  {isEmptyQuery ? (
                    <MagnifyingGlassIcon className="size-4" />
                  ) : (
                    <Author.Image className="size-16" />
                  )}

                  <p className="!m-0">
                    {author?.name?.split(' ').map((titleText, idx) => (
                      <span
                        key={`${author.key}-title-${idx}`}
                        className={cn(
                          query
                            .toLowerCase()
                            .includes(titleText.toLowerCase()) &&
                            'text-yellow-500',
                        )}
                      >
                        {titleText}&nbsp;
                      </span>
                    ))}
                  </p>
                </CommandItem>
              </Author>
            </SearchCommand.ResultItem>
          )
        } else if (category === 'series') {
          const series = HardcoverUtils.parseDocument({
            category,
            hit,
          }) as Series
          const isEmptySeries = !(series?.coursesCount ?? 0)
          if (!series || isEmptySeries) return null
          return (
            <SearchCommand.ResultItem
              key={`${idx}-${series.key}`}
              asChild
            >
              <Series series={series!}>
                <CommandItem
                  value={series.name}
                  className={cn(
                    'flex w-full flex-row place-content-start place-items-start gap-2',
                  )}
                  onSelect={(query) => {
                    if (isEmptyQuery) {
                      form.setValue('q', query)
                      onSubmitSearch()
                    } else {
                      // navigate(
                      //   {
                      //     pathname: '/series/:slug?/*',
                      //   },
                      //   {
                      //     state: {
                      //       source: series.source,
                      //     },
                      //     params: {
                      //       slug: series?.slug ?? series.key,
                      //       '*': '',
                      //     },
                      //     unstable_viewTransition: true,
                      //   },
                      // )

                      toggleVisibility()
                    }
                  }}
                >
                  {isEmptyQuery ? (
                    <MagnifyingGlassIcon className="size-4" />
                  ) : (
                    <BookmarkIcon className="size-16" />
                  )}

                  <p className="!m-0">
                    {series?.name?.split(' ').map((titleText, idx) => (
                      <span
                        key={`${series.key}-title-${idx}`}
                        className={cn(
                          query
                            .toLowerCase()
                            .includes(titleText.toLowerCase()) &&
                            'text-yellow-500',
                        )}
                      >
                        {titleText}&nbsp;
                      </span>
                    ))}
                  </p>

                  <Badge variant={'outline'}>
                    {series?.coursesCount ?? 0} courses
                  </Badge>
                </CommandItem>
              </Series>
            </SearchCommand.ResultItem>
          )
        }

        const artifact = HardcoverUtils.parseDocument({ category, hit }) as
          | Character
          | List
          | Series

        if (!artifact) return null
        return (
          <SearchCommand.ResultItem key={`${idx}-${artifact.key}`}>
            <CommandItem
              value={artifact?.name ?? ''}
              className={cn(
                'flex w-full flex-row flex-wrap place-items-center gap-8',
              )}
            >
              <p>
                {artifact?.name?.split(' ').map((titleText, idx) => (
                  <span
                    key={`${artifact.key}-title-${idx}`}
                    className={cn(
                      query.toLowerCase().includes(titleText.toLowerCase()) &&
                        'text-yellow-500',
                    )}
                  >
                    {titleText}&nbsp;
                  </span>
                ))}
              </p>
              <small>{+(artifact?.coursesCount ?? 0)}</small>
            </CommandItem>
          </SearchCommand.ResultItem>
        )
      })}

      <Button
        className={cn(
          'absolute bottom-4 right-4 z-40',
          (!dataCount || !query) && 'hidden',
        )}
        onClick={() => {
          toggleVisibility()

          navigate(
            {
              pathname: '/search/:category',
              search: `?q=${searchQuery.q}`,
            },
            {
              params: {
                category: searchQuery.category,
              },
              unstable_viewTransition: true,
            },
          )
        }}
      >
        View {dataCount} results
      </Button>
    </CommandGroup>
  )
}
SearchCommand.Results = SearchCommandResults

export const SearchCommandTrigger = () => {
  const dispatch = useRootDispatch()
  const [isVisible, setIsVisible] = [
    useRootSelector(AppSelectors.state).searchCommandVisibility,
    AppActions.setSearchCommandVisibility,
  ]

  const toggleVisibility = useCallback(() => {
    const visibility = !isVisible
    dispatch(setIsVisible(visibility))
  }, [dispatch, isVisible, setIsVisible])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === AppCommandKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleVisibility()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [dispatch, isVisible, setIsVisible, toggleVisibility])

  return (
    <div
      onClick={toggleVisibility}
      className={cn(
        'hidden flex-row place-content-between place-items-center gap-4 sm:flex',
        'h-9 w-64',
        'rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',

        'text-sm text-muted-foreground',
      )}
    >
      <aside className="inline-flex flex-row place-items-center gap-1">
        <MagnifyingGlassIcon className="size-4" />
        <span>Quick Search</span>
      </aside>

      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">Ctrl + {AppCommandKey.toUpperCase()}</span>
      </kbd>
    </div>
  )
}

SearchCommand.Trigger = SearchCommandTrigger

export const SearchCommandLoading = () => {
  const { isLoadingSearch } = useSearchContext()

  if (!isLoadingSearch) return
  return (
    <CommandLoading className="text-muted-foreground [&>div]:flex [&>div]:w-full [&>div]:flex-row [&>div]:place-content-center [&>div]:place-items-center [&>div]:gap-2">
      <UpdateIcon className="size-4 animate-spin" />
      <span>Hang on…</span>
    </CommandLoading>
  )
}
SearchCommand.Loading = SearchCommandLoading

//#endregion  //*======== UNIVERSAL ===========

type SearchTabs = HTMLAttributes<HTMLDivElement> & {
  isNavigatable?: boolean

  trigger?: Partial<ComponentProps<typeof TabsTrigger>>
}
export const SearchTabs = ({
  trigger,
  isNavigatable = false,
  children,
  className,
}: SearchTabs) => {
  const { form, onSubmitSearch, setIsNavigatable } = useSearchContext()
  const { category } = form.getValues()

  useEffect(() => {
    setIsNavigatable(isNavigatable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Tabs
      value={category}
      onValueChange={(c) => {
        const isValidCategory = SearchCategory.safeParse(c).success
        if (!isValidCategory) return

        form.setValue('category', c as typeof category)
        onSubmitSearch()
      }}
      className={cn('w-full py-4', className)}
    >
      <TabsList
        className={cn(
          '!h-auto !rounded-none border-b !bg-transparent pb-0',
          '*:rounded-b-none *:border-b *:!bg-transparent *:transition-all',
          'flex w-full flex-row !place-content-start place-items-center gap-x-4',

          'overflow-x-auto',
        )}
      >
        {DisplaySearchCategories.options.map((category) => (
          <TabsTrigger
            {...trigger}
            key={`search-tab-${category}`}
            value={category}
            className={cn(
              'capitalize',
              'data-[state=active]:border-primary',
              trigger?.className,
            )}
          >
            <span>{category}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
}
Search.Tabs = SearchTabs
SearchCommand.Tabs = Search.Tabs

//#endregion  //*======== UNIVERSAL ===========
export default Search
