import { env } from '@/env'
import { SubmitReviewProps } from '@/types/courseitem'
import { useMutation, useQuery } from '@tanstack/react-query'

const baseURL = `${env.VITE_APP_API_BASE_URL}/api`

const routes = {
  discover: '/discover',
  courseDetail: '/details?course_code=',
  trending: '/trending',
  search: '/search?query=',
  page: '&page=',
  like: '/like',
  watchlist: '/watchlist',
  review: '/review',
  allCourses: '/course/all',
}

export const useDiscoveryData = () => {
  return useQuery({
    queryKey: ['discoverData'],
    queryFn: () =>
      fetch(`${baseURL}${routes.discover}`).then((res) => res.json()),
  })
}

export const useCourseDetailData = (courseCode: string) => {
  return useQuery({
    queryKey: ['courseDetailData', courseCode],
    queryFn: () =>
      fetch(`${baseURL}${routes.courseDetail}${courseCode}`).then((res) =>
        res.json(),
      ),
  })
}

export const useTrendingData = () => {
  return useQuery({
    queryKey: ['trendingData'],
    queryFn: () =>
      fetch(`${baseURL}${routes.trending}`).then((res) => res.json()),
  })
}

export const useSearchData = (q: string, page: number) => {
  return useQuery({
    queryKey: ['searchData', q, page], // Include page in queryKey
    queryFn: () =>
      fetch(`${baseURL}${routes.search}${q}${routes.page}${page}`).then((res) =>
        res.json(),
      ),
  })
}

export const useLikeCourse = () => {
  return useMutation({
    mutationFn: async ({
      user_id,
      course_code,
      method,
    }: {
      user_id: string
      course_code: string
      method: 'POST' | 'DELETE'
    }) => {
      const response = await fetch(`${baseURL}${routes.like}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, course_code }),
      })

      if (!response.ok) {
        throw new Error('Failed to like/unlike the course')
      }

      return response.json()
    },
  })
}
export const useGetLikeCourse = (user_id: string, course_code: string) => {
  return useQuery({
    queryKey: ['getLikeStatus', user_id, course_code], // Cache based on user and course
    queryFn: async () => {
      const response = await fetch(
        `${baseURL}${routes.like}?user_id=${user_id}&course_code=${course_code}`,
      )

      if (!response.ok) {
        throw new Error('Failed to fetch like status')
      }

      return response.json()
    },
    enabled: !!user_id && !!course_code, // Only run if both user_id and course_code are present
  })
}

export const useWatchListCourse = () => {
  return useMutation({
    mutationFn: async ({
      user_id,
      course_code,
      method,
    }: {
      user_id: string
      course_code: string
      method: 'POST' | 'DELETE'
    }) => {
      const response = await fetch(`${baseURL}${routes.watchlist}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, course_code }),
      })

      if (!response.ok) {
        throw new Error('Failed to watch/unwatch the course')
      }

      return response.json()
    },
  })
}

export const useGetWatchList = (user_id: string, course_code: string) => {
  return useQuery({
    queryKey: ['getWatchListStatus', user_id, course_code], // Cache based on user and course
    queryFn: async () => {
      const response = await fetch(
        `${baseURL}${routes.watchlist}/exists?user_id=${user_id}&course_code=${course_code}`,
      )

      if (!response.ok) {
        throw new Error('Failed to fetch like status')
      }

      return response.json()
    },
    enabled: !!user_id && !!course_code, // Only run if both user_id and course_code are present
  })
}

export const useWatchListData = (user_id: string) => {
  return useQuery({
    queryKey: ['getWatchList', user_id],
    queryFn: () =>
      fetch(`${baseURL}${routes.watchlist}?user_id=${user_id}`).then((res) => {
        if (!res.ok) throw new Error('No watchlist found')
        return res.json()
      }),
  })
}

export const usePutReview = () => {
  return useMutation({
    mutationFn: (reviewData: SubmitReviewProps) =>
      fetch(`${baseURL}${routes.review}/putReview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to submit review')
        return res.json()
      }),
  })
}

export const useGetReviews = (course_id: string) => {
  return useQuery({
    queryKey: ['useReviewData', course_id],
    queryFn: () =>
      fetch(`${baseURL}${routes.review}/${course_id}`).then((res) => {
        if (!res.ok) throw new Error('No reviews found')
        return res.json()
      }),
  })
}

export const useAllCoursesData = () => {
  return useQuery({
    queryKey: ['allCoursesData'],
    queryFn: () =>
      fetch(`${baseURL}${routes.allCourses}`).then((res) => res.json()),
  })
}
