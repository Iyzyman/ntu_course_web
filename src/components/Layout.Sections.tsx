import Course from '@/components/Course'
import { cn } from '@/utils/dom'
import { getLimitedArray } from '@/utils/helpers'
import { HTMLAttributes } from 'react'

type CourseThumbnailSection = {
  books: Course[]
  displayLimit?: number
} & HTMLAttributes<HTMLDivElement>
export const CourseThumbnailSection = ({
  books,
  displayLimit = 12,
  className,
  children,
  ...rest
}: CourseThumbnailSection) => {
  const displayCourses = getLimitedArray(books, displayLimit)
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
      {displayCourses.map((book, idx) => {
        return (
          <Course
            key={`${book.source}-${idx}-${book.key}`}
            book={book!}
          >
            <Course.Thumbnail
              className={cn(
                'w-fit !rounded-none',
                idx > 8 && 'hidden sm:block',
              )}
            />
            {children}
          </Course>
        )
      })}
    </section>
  )
}
