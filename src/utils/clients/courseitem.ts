import { CourseItem } from '@/types'
import {
  Course,
  CourseSource,
  Character,
  List,
  SearchCategories,
} from '@/types/cf'
export class CourseItemUtils {
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
      key: hcCourse.code,
      slug: hcCourse.code,
      title: hcCourse.title,
      description: hcCourse.description || '',
      likes: hcCourse.likes || 0,
      watchlists: hcCourse.watchlists || 0,
      prerequisites: hcCourse.prerequisites || [],
      code: hcCourse.code,
      school: hcCourse.school,
      tags: hcCourse.tags || [],
      color: hcCourse.color,
    }

    return course
  }

  static parseCharacter = (hcCharacter: CourseItem.Character): Character => {
    const character: Character = {
      key: hcCharacter.slug,
      slug: hcCharacter.slug,
      name: hcCharacter.name,
      coursesCount: hcCharacter.coursesCount,
      author: hcCharacter.author,
    }
    return character
  }
  static parseList = (hcList: CourseItem.List): List => {
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
    document: CourseItem.SearchCourse
  }): Course => {
    const hcCourse: Course = {
      key: document.code || '',
      title: document.title || '',
      likes: document.likes || 0,
      watchlists: document.watchlists || 0,
      prerequisites: document.prerequisites || [],
      slug: document.code,
      code: document.code,
      school: document.school,
      description: document.description,
      tags: document.tags,
      color: document.color,
    }
    return hcCourse
  }

  static parseListDocument = ({
    document,
  }: {
    document: CourseItem.SearchList
  }): CourseItem.List => {
    const titles: string[] = document?.courses ?? []
    const coursesCount: number = +(document?.courses_count ?? 0)

    const hcList: CourseItem.List = {
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
        const hcCourse = CourseItemUtils.parseCourseDocument({
          document: document as unknown as CourseItem.SearchCourse,
        })
        const course: Course = CourseItemUtils.parseCourse(hcCourse)
        return course
      }
      case 'lists': {
        const hcList = CourseItemUtils.parseListDocument({
          document: document as unknown as CourseItem.SearchList,
        })
        const list = CourseItemUtils.parseList(hcList)
        return list
      }
    }
  }
}
