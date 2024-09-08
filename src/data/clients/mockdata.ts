// mockData.ts
import { Book, SearchArtifact } from '@/types/shelvd'
import { SourceOrigin } from '@/data/stores/search.slice'

export const mockBook: Book = {
  slug: 'mock-book-slug',
  code: 'SC3004',
  source: 'google',
  title: 'SC3004',
  description:
    'TThe Multidisciplinary Design Project (MDP) is a group-based design project undertaken by a mixedgroup of students comprising of undergraduates from the CE, CS, BCG and BCE programmes. Theproject is practical-oriented and multi-disciplinary in nature, requiring system level integration of sub-systems developed by different team members. MDP is to be done over one semester by students who have reached at least a year 3 standing.Eligible students will be automatically registered by the school and will be allocated to their respectiveproject group based on a composition of students from different programmes.',
  school: 'College of Computing & Data Science',
  key: 'mock-book-slug',
  watchlists: 1,
  likes: 1,
}

export const mockOrigin: SourceOrigin<'hc', 'books'> = {
  id: 'mock-book-id',
  slug: 'mock-book-slug',
  title: 'SC3004',
  isbns: ['1234567890', '0987654321'],
  description:
    'The Multidisciplinary Design Project (MDP) is a group-based design project undertaken by a mixedgroup of students comprising of undergraduates from the CE, CS, BCG and BCE programmes. Theproject is practical-oriented and multi-disciplinary in nature, requiring system level integration of sub-systems developed by different team members. MDP is to be done over one semester by students who have reached at least a year 3 standing.Eligible students will be automatically registered by the school and will be allocated to their respectiveproject group based on a composition of students from different programmes.',
  genres: [
    'Robot',
    'Algorithm',
    'STM',
    'Robot',
    'Algorithm',
    'STM',
    'Robot',
    'Algorithm',
    'STM',
    'Robot',
    'Algorithm',
    'STM',
    'Robot',
    'Algorithm',
    'STM',
  ],
  series: {
    position: 1,
    count: 5,
    name: 'Mock Series',
    slug: 'mock-series-slug',
  },
  image: {
    url: '/path/to/mock-image.jpg',
    color: '#AABAE1',
  },
  release_year: 2023,
  author_names: ['Mock Author'],
  contributions: [
    {
      author: {
        cachedImage: {
          small: '/path/to/author-image-small.jpg',
          large: '/path/to/author-image-large.jpg',
        },
        name: 'Mock Author',
        slug: 'mock-author-slug',
      },
    },
  ],
  featured_series: {
    position: 1,
    series_books_count: 5,
    series_name: 'Mock Series',
    series_slug: 'mock-series-slug',
  },
  moods: ['Inspiring', 'Mysterious'],
  content_warnings: ['Violence'],
}
export const mockSearchArtifact: SearchArtifact<'books'> = {
  key: 'mock-book-key',
  code: 'SC3004',
  title: 'Multi-Disciplinary Project (MDP)',
  source: 'hc', // Assuming 'hc' as the source
  likes: 120,
  watchlists: 45,
  school: 'College of Computing & Data Science',
  slug: 'mock-book-slug', // Optional
  image: '/path/to/mock-book-image.jpg', // Optional
  description:
    'The Multidisciplinary Design Project (MDP) is a group-based design project undertaken by a mixedgroup of students comprising of undergraduates from the CE, CS, BCG and BCE programmes. Theproject is practical-oriented and multi-disciplinary in nature, requiring system level integration of sub-systems developed by different team members. MDP is to be done over one semester by students who have reached at least a year 3 standing.Eligible students will be automatically registered by the school and will be allocated to their respectiveproject group based on a composition of students from different programmes.', // Optional
  series: {
    name: 'Mock Series',
    key: 'mock-series',
  }, // Optional
}
