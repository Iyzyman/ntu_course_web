import { z } from 'zod'

//#region  //*=========== QUERY PARAMETERS ===========
/** @external https://developers.google.com/books/docs/v1/using#api_params */

export const BookFilterModes = [
  `partial`,
  `full`,
  `free-ebooks`,
  `paid-ebooks`,
  `ebooks`,
] as const
export const BookFilterMode = z.enum(BookFilterModes, {
  required_error: 'Please select an filter mode.',
})

export const BookOrderModes = [`relevance`, `newest`] as const
export const BookOrderMode = z.enum(BookOrderModes, {
  required_error: 'Please select an order mode.',
})

export const BookDownloadFormats = [`epub`] as const
export const BookDownloadFormat = z.enum(BookDownloadFormats, {
  required_error: 'Please select an download format.',
})

export const BookPrintFormats = [`all`, `books`, `magazines`] as const
export const BookPrintFormat = z.enum(BookPrintFormats, {
  required_error: 'Please select an print format.',
})

/** @external https://developers.google.com/books/docs/v1/using#PerformingSearch */
export const BookQueryModes = [
  `intitle:`,
  `inauthor:`,
  `inpublisher:`,
  `subject:`,
  `isbn:`,
  `lccn:`,
  `oclc:`,
] as const
export const BookQueryMode = z.enum(BookQueryModes, {
  required_error: 'Please select an query mode.',
})

export const BookProjectionModes = [`lite`, `full`] as const
export const BookProjectionMode = z.enum(BookProjectionModes, {
  required_error: 'Please select an projection mode.',
})

export const BookQueryPagination = z.object({
  startIndex: z.number().default(0).optional(),
  maxResults: z.number().default(40).optional(),
})
export type BookQueryPagination = z.infer<typeof BookQueryPagination>
export const DefaultBookQueryPagination: BookQueryPagination = {
  maxResults: 40,
}

//#endregion  //*======== QUERY PARAMETERS ===========

export const BookQueryParams = BookQueryPagination.extend({
  q: z
    .string({
      required_error: 'Please provide a search term',
    })
    .default(''),
  orderBy: BookOrderMode.optional(),
  printType: BookPrintFormat.optional(),
  filter: BookFilterMode.optional(),
  projection: BookProjectionMode.optional(),
  download: BookDownloadFormat.optional(),
})
export type BookQueryParams = z.infer<typeof BookQueryParams>
export const DefaultBookQueryParams: BookQueryParams = {
  ...DefaultBookQueryPagination,
  q: '',
}

export type IndustryIdentifiers = {
  type: string
  identifier: string
}

/** @external https://developers.google.com/books/docs/v1/reference/volumes */
export type Volume = {
  id: string
  selfLink: string
  imageLinks?: {
    smallThumbnail: string
    thumbnail: string
    small: string
    medium: string
    large: string
    extraLarge: string
    industryIdentifiers: IndustryIdentifiers[]
  }
  volumeInfo: {
    title: string
    authors: string[]
    publisher: string
    publishedDate: string
  }
}

export type BookQueryResponse<T = Volume> = {
  kind: string
  totalItems: number
  items: T[]
}
