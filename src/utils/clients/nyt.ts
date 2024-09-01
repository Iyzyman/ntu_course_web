import Book from '@/components/Book'
import { NYT } from '@/types'
import { BookAuthor } from '@/types/shelvd'
import { ShelvdUtils } from '@/utils/clients/shelvd'

export class NYTUtils {
  static parseBook = (nytBook: NYT.Book): Book => {
    const authorName = nytBook.author
    const authorSlug = ShelvdUtils.createSlug(authorName)
    const author: BookAuthor = {
      key: authorSlug,
      slug: authorSlug,
      name: authorName.length ? authorName : '???',
    }
    const book: Book = {
      key: nytBook.primary_isbn10 ?? nytBook.primary_isbn13,
      title: nytBook.title,
      author,
      image: nytBook.book_image,
      source: 'nyt',
    }
    return book
  }
}
