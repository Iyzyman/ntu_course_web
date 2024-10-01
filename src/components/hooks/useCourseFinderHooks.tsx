import { useQuery } from '@tanstack/react-query'

const baseURL = 'http://localhost:3001/api'

const routes = {
  discover: '/discover',
  courseDetail: '/details?course_code=',
  trending: '/trending',
  allCourses: '/course/all'
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

export const useAllCoursesData = () => {
  return useQuery({
    queryKey: ['allCoursesData'],
    queryFn: () =>
      fetch(`${baseURL}${routes.allCourses}`).then((res) => res.json())
  })
}