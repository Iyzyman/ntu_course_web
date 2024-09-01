export type Book = {
  amazon_product_url: string
  author: string
  book_image: string
  description: string
  price: string
  primary_isbn10: string
  primary_isbn13: string
  book_uri: string
  publisher: string
  rank: number
  rank_last_week: number
  sunday_review_link: string
  title: string
  updated_date: string
  weeks_on_list: number
  buy_links: { name: string; url: string }[]
}

export type BookList = {
  list_id: number
  list_name: string
  list_name_encoded: string
  display_name: string
  updated: string
  list_image: string
  books: Book[]
}

export type BookQueryResponse<T = BookList> = {
  status: string
  num_results: number
  results: {
    lists: T[]
  }
}
