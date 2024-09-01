import Book from '@/components/Book'

//#region  //*=========== QUERY PARAMETERS ===========
export type CollectionsQueryResponse = {
  total: number
  results: {
    lists: {
      core: SingleCollection[]
      user: SingleCollection[]
    }
  }
}

export type CollectionQueryResponse = {
  total: number
  results: SingleCollection[]
}

export type SingleCollection = {
  key: string
  name: string
  source: string
  books: Book[]
}

export type UpdateCollectionNameBodyParams = {
  collection_key: string
  updated_name: string
  username: string
}

export type CreateCollectionBodyParams = {
  collection_key: string
  collection_name: string
  username: string
}

export type addBookToMultipleCollectionsBodyParams = {
  collection_keys: string[]
  username: string
  book_key: string
}

export type deleteSingleCollectionParams = {
  collection_key: string
  username: string
}

export type deleteMultipleCollectionsBodyParams = {
  collection_keys: string[]
  username: string
}
