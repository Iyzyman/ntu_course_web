import { z } from 'zod'
import type { UserResource } from '@clerk/types'

export type User = Pick<
  UserResource,
  'id' | 'createdAt' | 'username' | 'profileImageUrl' | 'firstName' | 'lastName'
>

export const CourseSources = [`ol`, `nyt`, `google`, `hc`, `shelvd`] as const
export const CourseSource = z.enum(CourseSources)
export type CourseSource = z.infer<typeof CourseSource>
export const DefaultCourseSource = CourseSource.enum.hc

export const BaseInfo = z.object({
  key: z.string().min(1),
  slug: z.string().default('').optional(),
})
export type BaseInfo = z.infer<typeof BaseInfo>

export const Course = BaseInfo.extend({
  title: z.string().min(1).default(''),
  code: z.string().min(1).default('').optional(),
  school: z.string().min(1).default('').optional(),
  image: z.string().default('').optional(),
  description: z.string().default('').optional(),
  likes: z.number().default(0),
  watchlists: z.number().default(0),
  tags: z.array(z.string()).default([]).optional(),
  prerequisites: z.array(z.any()).default([]),
  color: z.string().min(1).default('').optional(),
})

export type Course = z.infer<typeof Course>

export const Character = BaseInfo.extend({
  name: z.string().min(1),
  author: z.string().min(1),
  coursesCount: z.number().default(0).optional(),
})
export type Character = z.infer<typeof Character>

export const List = BaseInfo.extend({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(1, { message: "Can't be an empty string" })
    .trim(),
  description: z.string().default('').optional(),
  coursesCount: z.number().default(0).optional(),
  courses: Course.array().default([]),
  creator: BaseInfo.pick({ key: true })
    .default({
      key: 'unknown',
    })
    .optional(),
})
export type List = z.infer<typeof List>

export const ListInfo = List.pick({
  key: true,
  slug: true,
  name: true,
  coursesCount: true,
}).extend({
  courseKeys: z.string().array().default([]),
})
export type ListInfo = z.infer<typeof ListInfo>

export const ListTypes = [`core`, `created`, `following`] as const
export const ListType = z.enum(ListTypes)
export type ListType = z.infer<typeof ListType>
export const DefaultListType = ListType.enum.core
export const EditableListTypes: ListType[] = [
  ListType.enum.core,
  ListType.enum.created,
]
export const ListTypeInfo = z.record(ListType, ListInfo.array().default([]))
export type ListTypeInfo = z.infer<typeof ListTypeInfo>
export const DefaultListTypeInfo: ListTypeInfo = Object.fromEntries(
  ListType.options.map((type) => [type, []]),
)

export const ListData = List.omit({ courses: true }).extend({
  courseKeys: z.string().array().default([]),
})
export type ListData = z.infer<typeof ListData>

export const CourseDetailCategories = [
  `information`,
  `reviews`,
  `editions`,
  `lists`,
] as const
export const CourseDetailCategory = z.enum(CourseDetailCategories)
export type CourseDetailCategory = z.infer<typeof CourseDetailCategory>
export const DefaultCourseDetailCategory: CourseDetailCategory =
  CourseDetailCategory.enum.information

export const SearchCategories = [
  `courses`,
  'characters',
  'lists',
  'users',
] as const
export type SearchCategories = (typeof SearchCategories)[number]
export const SearchCategory = z.enum(SearchCategories)
export const DefaultSearchCategory = SearchCategory.enum.courses

type SearchArtifactMap = {
  courses: Course
  characters: Character
  lists: List
  users: User
}
export type SearchArtifact<T extends SearchCategories> = SearchArtifactMap[T]

export const SearchCategoryHistory = z.record(
  SearchCategory,
  z.string().array().default([]),
)
export type SearchCategoryHistory = z.infer<typeof SearchCategoryHistory>

type SearchDocumentMap = {
  courses: Course
  characters: Character
  lists: ListData
  users: User
}
export type SearchDocument<T extends SearchCategories> = SearchDocumentMap[T]
