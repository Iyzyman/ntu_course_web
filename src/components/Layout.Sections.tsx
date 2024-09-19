import Course from '@/components/Course'
import { cn } from '@/utils/dom'
import { getLimitedArray } from '@/utils/helpers'
import { HTMLAttributes } from 'react'

type CourseThumbnailSection = {
  courses: Course[]
  displayLimit?: number
} & HTMLAttributes<HTMLDivElement>
export const CourseThumbnailSection = ({
  courses,
  displayLimit = 12,
  className,
  children,
  ...rest
}: CourseThumbnailSection) => {
  const displayCourses = getLimitedArray(courses, displayLimit)
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
      {displayCourses.map((course, idx) => {
        return (
          <Course
            key={`${idx}-${course.key}`}
            course={course!}
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
