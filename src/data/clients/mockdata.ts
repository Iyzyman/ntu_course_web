// mockData.ts
import { Course} from '@/types/shelvd'


export const mockPrerequistie: Course[] = [
  {
    key: 'mock-book-key',
    code: 'SC3004',
    title: 'Multi-Disciplinary Project (MDP)',
    likes: 120,
    watchlists: 45,
    prerequisites: [],
    school: 'College of Computing & Data Science',
    slug: 'mock-book-slug', // Optional
    image: '/path/to/mock-book-image.jpg', // Optional
    description:
      'The Multidisciplinary Design Project (MDP) is a group-based design project undertaken by a mixedgroup of students comprising of undergraduates from the CE, CS, BCG and BCE programmes. Theproject is practical-oriented and multi-disciplinary in nature, requiring system level integration of sub-systems developed by different team members. MDP is to be done over one semester by students who have reached at least a year 3 standing.Eligible students will be automatically registered by the school and will be allocated to their respectiveproject group based on a composition of students from different programmes.', // Optional
  },
]

export const mockCourse: Course = {
  slug: 'mock-book-slug',
  code: 'SC3004',
  title: 'SC3004',
  prerequisites: mockPrerequistie,
  description:
    'TThe Multidisciplinary Design Project (MDP) is a group-based design project undertaken by a mixedgroup of students comprising of undergraduates from the CE, CS, BCG and BCE programmes. Theproject is practical-oriented and multi-disciplinary in nature, requiring system level integration of sub-systems developed by different team members. MDP is to be done over one semester by students who have reached at least a year 3 standing.Eligible students will be automatically registered by the school and will be allocated to their respectiveproject group based on a composition of students from different programmes.',
  school: 'College of Computing & Data Science',
  key: 'mock-book-slug',
  watchlists: 1,
  color: 'green',
  likes: 1,
  tags: [
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
}

export const mockCourseData: Array<Course> = [
  {
    key: 'pieces-of-the-action',
    slug: 'pieces-of-the-action',
    title: 'Pieces of the Action2',
    image: 'https://hardcover.imgix.net/edition/30396246/61162988._SY475_.jpg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'where-is-my-flying-car',
    slug: 'where-is-my-flying-car',
    title: 'Where Is My Flying Car?',
    image:
      'https://storage.googleapis.com/hardcover/external_data/59510350/a28dd690fc8282a281f96cd42b4d3d8c5a83186e.jpeg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'the-big-score',
    slug: 'the-big-score',
    title: 'The Big Score',
    image: 'https://hardcover.imgix.net/edition/30439351/58261325._SX318_.jpg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'scientific-freedom-the-elixir-of-civilization',
    slug: 'scientific-freedom-the-elixir-of-civilization',
    title: 'Scientific Freedom: The Elixir of Civilization',
    image: 'https://hardcover.imgix.net/edition/12452071/55520463._SX318_.jpg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'the-making-of-prince-of-persia',
    slug: 'the-making-of-prince-of-persia',
    title: 'The Making of Prince of Persia',
    image: 'https://hardcover.imgix.net/edition/30391276/content.jpeg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'get-together',
    slug: 'get-together',
    title: 'Get Together',
    image: 'https://hardcover.imgix.net/edition/30439414/content.jpeg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'the-revolt-of-the-public-and-the-crisis-of-authority-in-the-new-millennium',
    slug: 'the-revolt-of-the-public-and-the-crisis-of-authority-in-the-new-millennium',
    title:
      'The Revolt of The Public and the Crisis of Authority in the New Millennium',
    image: 'https://hardcover.imgix.net/edition/29745786/10082646-L.jpg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'stubborn-attachments',
    slug: 'stubborn-attachments',
    title: 'Stubborn Attachments',
    image: 'https://hardcover.imgix.net/edition/30437273/content.jpeg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'the-big-score',
    slug: 'the-big-score',
    title: 'The Big Score',
    image: 'https://hardcover.imgix.net/edition/30439351/58261325._SX318_.jpg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'scientific-freedom-the-elixir-of-civilization',
    slug: 'scientific-freedom-the-elixir-of-civilization',
    title: 'Scientific Freedom: The Elixir of Civilization',
    image: 'https://hardcover.imgix.net/edition/12452071/55520463._SX318_.jpg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'the-making-of-prince-of-persia',
    slug: 'the-making-of-prince-of-persia',
    title: 'The Making of Prince of Persia',
    image: 'https://hardcover.imgix.net/edition/30391276/content.jpeg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'get-together',
    slug: 'get-together',
    title: 'Get Together',
    image: 'https://hardcover.imgix.net/edition/30439414/content.jpeg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'the-revolt-of-the-public-and-the-crisis-of-authority-in-the-new-millennium',
    slug: 'the-revolt-of-the-public-and-the-crisis-of-authority-in-the-new-millennium',
    title:
      'The Revolt of The Public and the Crisis of Authority in the New Millennium',
    image: 'https://hardcover.imgix.net/edition/29745786/10082646-L.jpg',
    likes: 10,
    watchlists: 20,
  },
  {
    key: 'stubborn-attachments',
    slug: 'stubborn-attachments',
    title: 'Stubborn Attachments',
    image: 'https://hardcover.imgix.net/edition/30437273/content.jpeg',
    likes: 10,
    watchlists: 20,
  },
]
