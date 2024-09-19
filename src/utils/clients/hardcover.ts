import { Hardcover } from '@/types'
import {
  Course,
  CourseSource,
  Character,
  List,
  SearchCategories,
} from '@/types/shelvd'
export class HardcoverUtils {
  static source: CourseSource = 'hc'

  static getCdnUrl = (url: string) => {
    if (!url) return url
    return url
      .replace(
        'https://hardcover-staging.imgix.net',
        'https://storage.googleapis.com/hardcover-staging',
      )
      .replace(
        'https://hardcover.imgix.net',
        'https://storage.googleapis.com/hardcover',
      )
  }

  static parseCourse = (hcCourse: Course): Course => {
    const course: Course = {
      key: hcCourse.slug || '',
      slug: hcCourse.slug,
      title: hcCourse.title,
      image: HardcoverUtils.getCdnUrl(hcCourse.image || ''),
      description: hcCourse.description,
      likes: hcCourse.likes || 0,
      watchlists: hcCourse.watchlists || 0,
      prerequisites: hcCourse.prerequisites || [],
      code: hcCourse.code,
      school: hcCourse.school,
      tags: hcCourse.tags,
      color: hcCourse.color,
    }

    // If using zod or another validation library, you can use it here
    // return Course.safeParse(course).data;
    return course
  }

  static parseCharacter = (hcCharacter: Hardcover.Character): Character => {
    const character: Character = {
      key: hcCharacter.slug,
      slug: hcCharacter.slug,
      name: hcCharacter.name,
      coursesCount: hcCharacter.coursesCount,
      author: hcCharacter.author,
    }
    return character
  }
  static parseList = (hcList: Hardcover.List): List => {
    const list: List = {
      key: hcList.slug,
      slug: hcList.slug,
      name: hcList.name,
      coursesCount: hcList.coursesCount,
      description: hcList.description,
      courses: [],
    }

    // logger(
    //   { breakpoint: '[hardcover.ts:52]/parseList' },
    //   {
    //     success: List.safeParse(list).success,
    //     safe: List.safeParse(list),
    //     hcList,
    //     list,
    //   },
    // )
    return List.parse(list)
  }

  static parseCourseDocument = ({
    document,
  }: {
    document: Hardcover.SearchCourse
  }): Course => {
    const image = HardcoverUtils.getCdnUrl(document?.image?.url ?? '')

    const hcCourse: Course = {
      key: document.slug || '',
      title: document.title || '',
      likes: document.likes || 0,
      watchlists: document.watchlists || 0,
      prerequisites: document.prerequisites || [],
      slug: document.slug,
      code: document.code,
      school: document.school,
      image,
      description: document.description,
      tags: document.tags,
      color: document.color,
    }
    return hcCourse
  }

  static parseListDocument = ({
    document,
  }: {
    document: Hardcover.SearchList
  }): Hardcover.List => {
    const titles: string[] = document?.courses ?? []
    const coursesCount: number = +(document?.courses_count ?? 0)

    const hcList: Hardcover.List = {
      ...document,
      titles,
      coursesCount,
      courses: [],
    }
    return hcList
  }

  static parseDocument = <T>({
    category,
    hit,
  }: {
    category: SearchCategories
    hit: {
      document: T
    }
  }) => {
    const document = hit?.document
    if (!document) return

    switch (category) {
      case 'courses': {
        const hcCourse = HardcoverUtils.parseCourseDocument({
          document: document as unknown as Hardcover.SearchCourse,
        })
        const course: Course = HardcoverUtils.parseCourse(hcCourse)
        return course
      }
      case 'lists': {
        const hcList = HardcoverUtils.parseListDocument({
          document: document as unknown as Hardcover.SearchList,
        })
        const list = HardcoverUtils.parseList(hcList)
        return list
      }
    }
  }
}
