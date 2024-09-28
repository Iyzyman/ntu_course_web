import { useQuery } from '@tanstack/react-query'

const baseURL = 'http://localhost:3001/api'

const routes = {
  discover: '/discover',
  courseDetail: '/details?course_code=',
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
