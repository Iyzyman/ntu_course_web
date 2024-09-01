import Book from '@/components/Book'
import User from '@/components/Layout.User'
import { useMediaQuery } from '@/components/hooks/use-media-query'
import { RenderGuard } from '@/components/providers/render.provider'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/Drawer'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import {
  DeleteListParams,
  ShelvdEndpoints,
  UpdateListDetailsParams,
  useCreateListMutation,
  useDeleteListMutation,
  useUpdateListDetailsMutation,
} from '@/data/clients/shelvd.api'
import { useRootSelector } from '@/data/stores/root'
import { SearchSelectors } from '@/data/stores/search.slice'
import { useNavigate } from '@/router'
import {
  BookSource,
  ListData,
  List as ListInfo,
  ListType,
  Book as zBook,
} from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { ShelvdUtils } from '@/utils/clients/shelvd'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { getLimitedArray } from '@/utils/helpers'
import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircledIcon,
  CrossCircledIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import {
  ComponentProps,
  Dispatch,
  Fragment,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate as useNavigateNative } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

export type List = ListInfo

//#endregion  //*======== CONTEXT ===========
type ListContext = {
  data: ListData
  list: List
  // overwriteList?: List
  overwriteBooks?: Book[]
  isSkeleton?: boolean
  onNavigate: () => void
}
const ListContext = createContext<ListContext | undefined>(undefined)
const useListContext = () => {
  let ctxValue = useContext(ListContext)
  if (ctxValue === undefined) {
    ctxValue = {
      data: {} as ListData,
      list: {} as List,
      isSkeleton: true,
      onNavigate: () => {},
    }
  }
  return ctxValue
}
//#endregion  //*======== CONTEXT ===========

//#endregion  //*======== PROVIDER ===========
type ListProvider = PropsWithChildren & Omit<ListContext, 'onNavigate' | 'list'>
export const List = ({ children, overwriteBooks, ...value }: ListProvider) => {
  // const navigate = useNavigate()

  const bookKeys: string[] = overwriteBooks ? [] : value?.data?.bookKeys ?? []
  const { searchExactBulk: hcSearchBulk } = HardcoverEndpoints
  const hcSearchBookKeys = hcSearchBulk.useQuery(
    bookKeys.map((key) => ({
      category: 'books',
      q: key,
    })),
    {
      skip: !bookKeys.length,
    },
  )

  const books: Book[] = useMemo(() => {
    const { data, isSuccess } = hcSearchBookKeys

    const results = data?.results ?? []
    const isLoading = hcSearchBookKeys.isLoading || hcSearchBookKeys.isFetching
    const isNotFound = !isLoading && !isSuccess && results.length < 1
    if (isNotFound) return []

    const books: Book[] = results.map((result) => {
      // exact search expects top hit accuracy
      const hit = (result?.hits ?? [])?.[0]
      const book = HardcoverUtils.parseDocument({
        category: 'books',
        hit,
      }) as Book
      return book
    })
    return books
  }, [hcSearchBookKeys])

  const onNavigate = () => {
    if (!value?.data) return
    // navigate(
    //   {
    //     pathname: '/list/:slug?',
    //   },
    //   {
    //     state: {
    //       source: value.list.source,
    //     },
    //     params: {
    //       slug: value.list?.slug ?? value.list.key,
    //     },
    //     unstable_viewTransition: true,
    //   },
    // )
  }

  const list: List = ListInfo.parse({
    ...value.data,
    books: overwriteBooks ?? books,
  })

  const isValid = ListInfo.safeParse(list).success
  // logger(
  //   { breakpoint: '[List.tsx:89]/ListProvider' },
  //   { value, overwriteBooks, list, bookKeys },
  // )
  return (
    <ListContext.Provider
      value={{
        isSkeleton: !isValid,
        onNavigate,
        ...value,
        list,
      }}
    >
      <RenderGuard renderIf={isValid}>{children}</RenderGuard>
    </ListContext.Provider>
  )
}
//#endregion  //*======== PROVIDER ===========

//#endregion  //*======== COMPONENTS ===========

//#endregion  //*======== LIST/CREATE ===========

const CreateListFormSchema = ListData.pick({
  slug: true,
  name: true,
  description: true,
})
type CreateListFormSchema = z.infer<typeof CreateListFormSchema>

export const CreateListFormSchemaKeys = CreateListFormSchema.keyof()
export type CreateListFormSchemaKeys = z.infer<typeof CreateListFormSchemaKeys>

export const ListFormTypes = [`create`, `edit`, `delete`] as const
export const ListFormType = z.enum(ListFormTypes)
export type ListFormType = z.infer<typeof ListFormType>

const FormTypeContentMap: Record<
  ListFormType,
  {
    icon: typeof PlusIcon
    title: string
    description: string
  }
> = {
  [ListFormType.enum.create]: {
    icon: PlusIcon,
    title: 'Create List',
    description:
      'This information will be displayed publicly if this is a public list, so be careful what you share.',
  },
  [ListFormType.enum.edit]: {
    icon: Pencil1Icon,
    title: 'Edit List',
    description:
      'This information will be displayed publicly if this is a public list, so be careful what you share.',
  },
  [ListFormType.enum.delete]: {
    icon: TrashIcon,
    title: 'Delete List',
    description: 'Are you absolutely sure? This action cannot be undone.',
  },
}

export type ListFormDialog = {
  formType: ListFormType
}
export const ListFormDialog = ({ formType }: ListFormDialog) => {
  const [open, setOpen] = useState<boolean>(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const [type, setType] = useState<typeof formType>(formType)
  const defaultContent = FormTypeContentMap[formType]
  const content = FormTypeContentMap[type]

  const ListForm = () => {
    switch (type) {
      case 'create': {
        return <List.CreateForm onClose={() => setOpen(false)} />
      }
      case 'edit':
      case 'delete': {
        return (
          <List.EditForm
            onClose={() => setOpen(false)}
            type={type}
            setType={setType}
          />
        )
      }
      default: {
        return <Fragment />
      }
    }
  }
  const Trigger = () => (
    <DialogTrigger asChild>
      <Button
        variant="outline"
        className="space-x-2"
      >
        <defaultContent.icon className="size-4" />
        <span>{defaultContent.title}</span>
      </Button>
    </DialogTrigger>
  )

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <Trigger />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{content.title}</DialogTitle>
            <DialogDescription>{content.description}</DialogDescription>
          </DialogHeader>
          <ListForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
      <Trigger />
      <DrawerContent className="*:px-4">
        <DrawerHeader className="text-left">
          <DrawerTitle>{content.title}</DrawerTitle>
          <DrawerDescription>{content.description}</DrawerDescription>
        </DrawerHeader>
        <ListForm />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
List.FormDialog = ListFormDialog

type ListCreateForm = ComponentProps<'form'> & {
  onClose: () => void
}
export const ListCreateForm = ({ className, onClose }: ListCreateForm) => {
  //#endregion  //*======== STORE ===========
  const current = useRootSelector(SearchSelectors.state).current
  const user = current.origin as User

  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const userId = user?.id ?? ''
  const username = user?.username ?? ''

  const isValidUser =
    !current.isNotFound && !!userId.length && !!username.length

  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== STATES ===========
  const form = useForm<CreateListFormSchema>({
    resolver: zodResolver(CreateListFormSchema),
    defaultValues: {
      slug: '',
      name: '',
      description: '',
    },
  })

  const [keyToCheck, setKeyToCheck] = useState<string>('')

  //#endregion  //*======== STATES ===========

  //#endregion  //*======== QUERIES ===========
  const { getListKeyAvailability } = ShelvdEndpoints

  const { data: isKeyAvailable = true, ...queryListKeyAvailability } =
    getListKeyAvailability.useQuery(
      {
        username,
        type: ListType.enum.created,
        key: keyToCheck,
      },
      {
        skip: !isValidUser || !keyToCheck.length,
      },
    )

  const isCheckingKeyAvailbility =
    queryListKeyAvailability.isLoading || queryListKeyAvailability.isFetching

  //#endregion  //*======== QUERIES ===========

  //#endregion  //*======== MUTATIONS ===========
  const [createList] = useCreateListMutation()

  //#endregion  //*======== MUTATIONS ===========

  const isFormSubmittable = isValidUser && isKeyAvailable

  const onSubmitForm = (values: CreateListFormSchema) => {
    if (!isFormSubmittable) return

    const isValid = CreateListFormSchema.safeParse(values).success
    if (!isValid) return

    const creatorKey = userId
    const payload = ListData.parse({
      key: values.slug,
      source: BookSource.enum.shelvd,
      ...values,
      creator: {
        key: creatorKey,
      },
      booksCount: 0,
      bookKeys: [],
    })
    logger(
      { breakpoint: '[index.tsx:283]' },
      {
        values,
        payload,
      },
    )

    createList(payload)
    toast.success('Successfully created list')
    onClose()
  }

  const onSubmitCreate = () => form.handleSubmit(onSubmitForm)()

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmitCreate()
        }}
        className={cn('grid items-start gap-4', className)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>List Name (required)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onBlur={() => {
                    const slug = ShelvdUtils.createSlug(field.value)
                    form.setValue('slug', slug)

                    setKeyToCheck(slug)
                    logger(
                      { breakpoint: '[index.tsx:371]/avail-trigger' },
                      { isCheckingKeyAvailbility, slug },
                    )
                  }}
                />
              </FormControl>

              {!!keyToCheck && (
                <div
                  className={cn(
                    'inline-flex w-full flex-row place-items-center gap-x-2',
                    'text-muted-foreground',
                  )}
                >
                  {isKeyAvailable ? (
                    <CheckCircledIcon className="size-4" />
                  ) : (
                    <CrossCircledIcon className="size-4 text-destructive" />
                  )}
                  <p className="!m-0">
                    Name is {!isKeyAvailable && 'not '}available
                  </p>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>

              <FormControl>
                <Textarea
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write a few sentences about your list.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={!isFormSubmittable}
        >
          Save
        </Button>
      </form>
    </Form>
  )
}
List.CreateForm = ListCreateForm

const ListCreateDialog = () => (
  <List.FormDialog formType={ListFormType.enum.create} />
)

List.CreateDialog = ListCreateDialog

type ListEditForm = ComponentProps<'form'> & {
  onClose: () => void
  type: ListFormType
  setType: Dispatch<SetStateAction<ListFormType>>
}
export const ListEditForm = ({
  className,
  onClose,
  type,
  setType,
}: ListEditForm) => {
  const { list } = useListContext()

  const navigate = useNavigateNative()
  const { pathname } = useLocation()
  const { user, isSignedIn } = useUser()
  //#endregion  //*======== STORE ===========
  // const current = useRootSelector(SearchSelectors.state).current
  // const user = current.origin as User

  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const userId = user?.id ?? ''
  const username = user?.username ?? ''
  const listKey = list?.key ?? ''

  const isValidUser = isSignedIn && (list?.creator?.key ?? '') === userId
  const isValidList = ListInfo.safeParse(list).success && !!listKey.length
  const isValidParams = isValidUser && isValidList
  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== STATES ===========
  const form = useForm<CreateListFormSchema>({
    resolver: zodResolver(CreateListFormSchema),
    defaultValues: {
      slug: list?.slug ?? '',
      name: list?.name ?? '',
      description: list?.description ?? '',
    },
  })

  const [keyToCheck, setKeyToCheck] = useState<string>('')
  const [editedFields, setEditedFields] = useState<
    Set<CreateListFormSchemaKeys>
  >(new Set<CreateListFormSchemaKeys>())
  //#endregion  //*======== STATES ===========

  //#endregion  //*======== QUERIES ===========
  const { getListKeyAvailability } = ShelvdEndpoints

  const { data: isKeyAvailable = true, ...queryListKeyAvailability } =
    getListKeyAvailability.useQuery(
      {
        username,
        type: ListType.enum.created,
        key: keyToCheck,
      },
      {
        skip: !isValidParams || !keyToCheck.length,
      },
    )

  const isCheckingKeyAvailbility =
    queryListKeyAvailability.isLoading || queryListKeyAvailability.isFetching

  //#endregion  //*======== QUERIES ===========

  //#endregion  //*======== MUTATIONS ===========
  const [updateList] = useUpdateListDetailsMutation()
  const [deleteList] = useDeleteListMutation()

  //#endregion  //*======== MUTATIONS ===========

  const isEditMode = type === 'edit'
  const isFormEdited = !!editedFields.size
  const isKeyAcceptable = editedFields.has('slug') ? isKeyAvailable : true
  const isFormSubmittable =
    isValidParams && isFormEdited && isKeyAcceptable && isEditMode

  const onSubmitForm = async (values: CreateListFormSchema) => {
    if (!isFormSubmittable) return

    const isValid = CreateListFormSchema.safeParse(values).success
    if (!isValid) return

    const payload = UpdateListDetailsParams.parse({
      userId,
      key: listKey,
      type: ListType.enum.created,
      data: {
        ...values,
        key: values.slug,
      },
    })
    logger(
      { breakpoint: '[index.tsx:283]/onSubmitForm' },
      {
        values,
        payload,
      },
      {
        pathname,
      },
    )

    await updateList(payload)
    toast.success('Successfully updated list')

    onClose()

    const isKeyChanged = listKey !== values.slug
    if (isKeyChanged) {
      const updatedPathname =
        pathname.split(`/${listKey}`)[0] + `/${values.slug}`
      navigate(updatedPathname)
      return
    }
  }

  const onSubmitCreate = () => form.handleSubmit(onSubmitForm)()

  const onSubmitDelete = async () => {
    if (!isValidParams) return

    const payload = DeleteListParams.parse({
      userId,
      key: listKey,
      type: ListType.enum.created,
    })

    logger({ breakpoint: '[List.tsx:515]/onSubmitDelete' }, { payload })
    await deleteList(payload)
    toast.success('Successfully deleted list')
    onClose()
  }

  // if (isValidParams) return null
  return isEditMode ? (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmitCreate()
        }}
        className={cn('grid items-start gap-4', className)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>List Name (required)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onBlur={() => {
                    const slug = ShelvdUtils.createSlug(field.value)
                    const isSame = (list?.slug ?? '') === slug

                    form.setValue('slug', slug)

                    setKeyToCheck(isSame ? '' : slug)

                    let edits: typeof editedFields = new Set(
                      editedFields.values(),
                    )
                    if (isSame) {
                      edits.delete(field.name)
                    } else {
                      edits = edits.add(field.name)
                    }
                    setEditedFields(edits)
                    logger(
                      { breakpoint: '[index.tsx:371]/avail-trigger' },
                      { isCheckingKeyAvailbility, slug },
                    )
                  }}
                />
              </FormControl>

              {!!keyToCheck && (
                <FormDescription
                  className={cn(
                    'inline-flex w-full flex-row place-items-center gap-x-2',
                    'text-muted-foreground',
                  )}
                >
                  {isKeyAvailable ? (
                    <CheckCircledIcon className="size-4" />
                  ) : (
                    <CrossCircledIcon className="size-4 text-destructive" />
                  )}
                  <span className="!m-0">
                    Name is {!isKeyAvailable && 'not '}available
                  </span>
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>

              <FormControl>
                <Textarea
                  className="resize-none"
                  {...field}
                  onBlur={() => {
                    const isSame = (list?.[field.name] ?? '') === field.value

                    let edits: typeof editedFields = new Set(
                      editedFields.values(),
                    )
                    if (isSame) {
                      edits.delete(field.name)
                    } else {
                      edits = edits.add(field.name)
                    }
                    setEditedFields(edits)
                    logger(
                      { breakpoint: '[index.tsx:371]/avail-trigger' },
                      { isSame, edits, description: field.value },
                    )
                  }}
                />
              </FormControl>
              <FormDescription>
                Write a few sentences about your list.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <aside
          className={cn(
            'flex flex-row flex-wrap place-content-between place-items-center gap-2 *:flex-1',
          )}
        >
          <Button
            type="submit"
            disabled={!isFormSubmittable}
          >
            Save
          </Button>
          <Button
            variant={'destructive'}
            disabled={!isValidParams}
            onClick={(e) => {
              e.preventDefault()

              // onSubmitDelete()

              setType('delete')
            }}
          >
            Delete
          </Button>
        </aside>
      </form>
    </Form>
  ) : (
    <Button
      disabled={!isValidParams && isEditMode}
      onClick={(e) => {
        e.preventDefault()

        onSubmitDelete()
      }}
    >
      Continue
    </Button>
  )
}
List.EditForm = ListEditForm

const ListEditDialog = () => {
  const { list } = useListContext()
  const formType = ListFormType.enum.edit

  const { user, isSignedIn } = useUser()

  //#endregion  //*======== PARAMS ===========
  const userId = user?.id ?? ''
  const username = user?.username ?? ''

  const isValidUser = !!userId.length && !!username.length && isSignedIn
  const isCreatorUser = isValidUser && (list?.creator?.key ?? '') === userId
  //#endregion  //*======== PARAMS ===========

  // if (!isCreatorUser || !isSignedIn) return null
  if (!isCreatorUser) return
  return <List.FormDialog formType={formType} />
}

List.EditDialog = ListEditDialog

//#endregion  //*======== LIST/CREATE ===========

//#endregion  //*======== LIST/UPDATE ===========

//#endregion  //*======== LIST/UPDATE ===========

type ListBooks = PropsWithChildren & {
  displayLimit?: number
  isThumbnail?: boolean
  isNumbered?: boolean
}
const ListBooks = ({
  displayLimit,
  isThumbnail = false,
  isNumbered = false,
  children,
}: ListBooks) => {
  const {
    list: { books, key, source },
  } = useListContext()

  const navigate = useNavigate()

  const displayBooks = displayLimit
    ? getLimitedArray(books, displayLimit)
    : books

  if (!displayBooks.length) return null
  return displayBooks.map((book, idx) => (
    <RenderGuard
      key={`${key}-${source}-${idx}-${book.key}`}
      renderIf={zBook.safeParse(book).success}
    >
      <Book
        key={`${key}-${source}-${idx}-${book.key}`}
        book={zBook.parse(book)!}
      >
        {children ?? isThumbnail ? (
          <Book.Thumbnail className="w-fit !rounded-none" />
        ) : (
          <div
            onClick={() => {
              navigate(
                {
                  pathname: '/book/:slug',
                },
                {
                  state: {
                    source: book.source,
                  },
                  params: {
                    slug: book.slug ?? book.key,
                  },
                  unstable_viewTransition: true,
                },
              )
            }}
            className={cn(
              'flex flex-row place-content-start place-items-start gap-4',
              'w-full border-b py-2',
            )}
          >
            {isNumbered && (
              <small className="whitespace-nowrap	"># {idx + 1}</small>
            )}
            <Book.Thumbnail className="w-fit !rounded-none" />

            <aside>
              <p className="h4 line-clamp-3 truncate text-pretty capitalize">
                {book.title}
              </p>
              <p className="!m-0 capitalize text-muted-foreground">
                <small className="font-semibold uppercase">by</small>&nbsp;
                {ShelvdUtils.printAuthorName(book.author.name, {
                  mandatoryNames: [book.author.name],
                })}
              </p>
            </aside>
          </div>
        )}
      </Book>
    </RenderGuard>
  ))
}
List.Books = ListBooks

//#endregion  //*======== COMPONENTS ===========

export default List
