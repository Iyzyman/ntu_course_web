import { useQuery } from '@tanstack/react-query'

const baseURL = 'http://localhost:3001/api'

const routes = {
  discover: '/discover',
  courseDetail: '/details?course_code=',
  trending: '/trending',
  search: '/search?query=',
  page: '&page=',
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
