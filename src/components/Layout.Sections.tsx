import Book from '@/components/Book'
import { cn } from '@/utils/dom'
import { getLimitedArray } from '@/utils/helpers'
import { HTMLAttributes } from 'react'

type BookThumbnailSection = {
  books: Book[]
  displayLimit?: number
} & HTMLAttributes<HTMLDivElement>
export const BookThumbnailSection = ({
  books,
  displayLimit = 12,
  className,
  children,
  ...rest
}: BookThumbnailSection) => {
  const displayBooks = getLimitedArray(books, displayLimit)
  return (
    <section
      className={cn(
        'w-fit place-content-center place-items-start gap-2',
        'flex flex-row flex-wrap',

        'sm:max-w-xl',
        className,
      )}
      {...rest}
    >
      {displayBooks.map((book, idx) => {
        return (
          <Book
            key={`${book.source}-${idx}-${book.key}`}
            book={book!}
          >
            <Book.Thumbnail
              className={cn(
                'w-fit !rounded-none',
                idx > 8 && 'hidden sm:block',
              )}
            />
            {children}
          </Book>
        )
      })}
    </section>
  )
}
