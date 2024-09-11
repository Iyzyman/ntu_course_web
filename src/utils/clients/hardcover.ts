import { Hardcover } from '@/types'
import {
  Author,
  Course,
  CourseAuthor,
  CourseSource,
  Character,
  List,
  SearchCategories,
  Series,
} from '@/types/shelvd'
import { ShelvdUtils } from '@/utils/clients/shelvd'
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

  static parseCourse = (hcCourse: Hardcover.Course): Course => {
    const course: Course = {
      key: hcCourse.slug,
      slug: hcCourse.slug,
      title: hcCourse.title,
      author: {
        ...hcCourse.author,
        key:
          hcCourse.author?.slug ??
          ShelvdUtils.createSlug(hcCourse.author?.name),
      },
      image: HardcoverUtils.getCdnUrl(hcCourse?.image ?? ''),
      description: hcCourse.description,
      source: HardcoverUtils.source,
    }

    const hasSeries = +(hcCourse?.series?.count ?? 0) > 0
    if (hasSeries) {
      const series: Course['series'] = {
        key: hcCourse?.series?.slug,
        slug: hcCourse?.series?.slug,
        name: hcCourse?.series?.name,
      }
      course['series'] = series
    }

    // logger(
    //   { breakpoint: '[hardcover.ts:52]' },
    //   {
    //     success: Course.safeParse(course).success,
    //     safe: Course.safeParse(course),
    //     hcCourse,
    //     course,
    //   },
    // )
    return Course.parse(course)
  }
  static parseAuthor = (hcAuthor: Hardcover.Author): Author => {
    const author: Author = {
      key: hcAuthor.slug,
      slug: hcAuthor.slug,
      name: hcAuthor.name,
      image: hcAuthor.image,
      coursesCount: hcAuthor.coursesCount,
      source: HardcoverUtils.source,
    }

    // logger(
    //   { breakpoint: '[hardcover.ts:52]/parseAuthor' },
    //   {
    //     success: Author.safeParse(author).success,
    //     safe: Author.safeParse(author),
    //     hcAuthor,
    //     author,
    //   },
    // )
    return Author.parse(author)
  }
  static parseCharacter = (hcCharacter: Hardcover.Character): Character => {
    const character: Character = {
      key: hcCharacter.slug,
      slug: hcCharacter.slug,
      name: hcCharacter.name,
      coursesCount: hcCharacter.coursesCount,
      author: hcCharacter.author,
      source: HardcoverUtils.source,
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
      source: HardcoverUtils.source,
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

  static parseSeries = (hcSeries: Hardcover.Series): Series => {
    const series: Series = {
      key: hcSeries.slug,
      slug: hcSeries.slug,
      name: hcSeries.name,
      coursesCount: hcSeries.coursesCount,
      author: hcSeries.author,
      source: HardcoverUtils.source,
      titles: hcSeries.titles,
    }
    return series
  }

  static parseCourseDocument = ({
    document,
  }: {
    document: Hardcover.SearchCourse
  }): Hardcover.Course => {
    const image = HardcoverUtils.getCdnUrl(document?.image?.url ?? '')
    const pubYear = +document?.release_year
    const authorNameList = document?.author_names ?? []
    const mainAuthorName = authorNameList?.[0] ?? ''
    const mainAuthorSlug = ShelvdUtils.createSlug(mainAuthorName)

    let authorName = mainAuthorName
    if (authorNameList.length >= 2) {
      const authorNames = authorNameList.join(',')
      const displayAuthorNames = ShelvdUtils.printAuthorName(authorNames, {
        mandatoryNames: [mainAuthorName],
      })
      authorName = displayAuthorNames
    }

    let author: CourseAuthor = {
      key: mainAuthorSlug,
      slug: mainAuthorSlug,
      name: authorName.length ? authorName : '???',
    }

    const contributions = document?.contributions ?? []
    if (contributions?.[0]?.author) {
      const authorContribution = contributions?.[0]?.author
      author = {
        ...authorContribution,
        key: authorContribution?.slug ?? mainAuthorSlug,
        image: authorContribution.cachedImage?.url ?? '',
        name: author.name,
      }
    }

    const series = {
      position: +(document?.featured_series?.position ?? 0),
      count: +(document?.featured_series?.series_courses_count ?? 0),
      name: document?.featured_series?.series_name ?? '',
      slug: document?.featured_series?.series_slug ?? '',
    }

    const hcCourse: Hardcover.Course = {
      ...document,
      author,
      pubYear,
      image,
      series,
    }
    return hcCourse
  }

  static parseSeriesDocument = ({
    document,
  }: {
    document: Hardcover.SearchSeries
  }): Hardcover.Series => {
    const coursesCount: number = +(document?.courses_count ?? 0)
    const author = document?.author_name ?? '???'
    const titles = document?.courses ?? []

    const hcSeries: Hardcover.Series = {
      ...document,
      author,
      coursesCount,
      titles,
    }
    return hcSeries
  }

  static parseAuthorDocument = ({
    document,
  }: {
    document: Hardcover.SearchAuthor
  }): Hardcover.Author => {
    const name: string = document?.name ?? '???'
    const image = HardcoverUtils.getCdnUrl(document?.image?.url ?? '')
    const coursesCount: number = +(document?.courses_count ?? 0)

    const hcAuthor: Hardcover.Author = {
      ...document,
      name,
      image,
      coursesCount,
    }
    return hcAuthor
  }

  static parseCharacterDocument = ({
    document,
  }: {
    document: Hardcover.SearchCharacter
  }): Hardcover.Character => {
    const name: string = document?.name ?? '???'
    const author = document?.author_names?.[0] ?? '???'
    const coursesCount: number = +(document?.courses_count ?? 0)

    const hcCharacter: Hardcover.Character = {
      ...document,
      name,
      author,
      coursesCount,
    }
    return hcCharacter
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
      case 'authors': {
        const hcAuthor = HardcoverUtils.parseAuthorDocument({
          document: document as unknown as Hardcover.SearchAuthor,
        })
        const author = HardcoverUtils.parseAuthor(hcAuthor)
        return author
      }
      case 'characters': {
        const hcCharacter = HardcoverUtils.parseCharacterDocument({
          document: document as unknown as Hardcover.SearchCharacter,
        })
        const character = HardcoverUtils.parseCharacter(hcCharacter)
        return character
      }
      case 'lists': {
        const hcList = HardcoverUtils.parseListDocument({
          document: document as unknown as Hardcover.SearchList,
        })
        const list = HardcoverUtils.parseList(hcList)
        return list
      }
      case 'series': {
        const hcSeries = HardcoverUtils.parseSeriesDocument({
          document: document as unknown as Hardcover.SearchSeries,
        })
        const series = HardcoverUtils.parseSeries(hcSeries)
        return series
      }
    }
  }
}
