// mockData.ts
import { SearchQueryResponse } from '@/types/hardcover'
import { Course, ListData, User } from '@/types/shelvd'

export const mockPrerequisite: Course[] = [
  {
    key: 'mock-course-key-1',
    code: 'CS101',
    title: 'Introduction to Programming',
    likes: 300,
    watchlists: 100,
    prerequisites: [],
    school: 'School of Computing',
    slug: 'introduction-to-programming',
    description:
      'This course provides an introduction to programming and computer science. Topics include algorithms, data structures, software development, and more.',
  },
  {
    key: 'mock-course-key-2',
    code: 'CS102',
    title: 'Data Structures and Algorithms',
    likes: 250,
    watchlists: 80,
    prerequisites: [],
    school: 'School of Computing',
    slug: 'data-structures-and-algorithms',
    description:
      'This course covers the fundamental data structures and algorithms used in computer science, including arrays, linked lists, trees, and sorting algorithms.',
  },
]

export const mockCourse: Course = {
  slug: 'mock-course-slug',
  code: 'SC3005',
  title: 'SC3005',
  prerequisites: mockPrerequisite,
  description:
    'TThe Multidisciplinary Design Project (MDP) is a group-based design project undertaken by a mixedgroup of students comprising of undergraduates from the CE, CS, BCG and BCE programmes. Theproject is practical-oriented and multi-disciplinary in nature, requiring system level integration of sub-systems developed by different team members. MDP is to be done over one semester by students who have reached at least a year 3 standing.Eligible students will be automatically registered by the school and will be allocated to their respectiveproject group based on a composition of students from different programmes.',
  school: 'College of Computing & Data Science',
  key: 'mock-course-slug',
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

export const mockSearchResponse: SearchQueryResponse<Course> = {
  results: [
    {
      found: 1,
      page: 1,
      out_of: 1,
      hits: [
        {
          document: mockCourse,
        },
      ],
      request_params: {
        per_page: 10,
      },
    },
  ],
}

export const mockCourses: Course[] = [
  {
    key: 'mock-course-key-3',
    code: 'CS201',
    title: 'Advanced Programming',
    likes: 150,
    watchlists: 50,
    prerequisites: [mockPrerequisite[0]],
    school: 'School of Computing',
    slug: 'advanced-programming',
    description:
      'This course builds on the fundamentals of programming and covers advanced topics such as object-oriented programming, design patterns, and software engineering principles.',
    tags: ['Programming', 'OOP', 'Design Patterns'],
    color: 'blue',
  },
  {
    key: 'mock-course-key-4',
    code: 'CS202',
    title: 'Machine Learning',
    likes: 400,
    watchlists: 150,
    prerequisites: [mockPrerequisite[1]],
    school: 'School of Computing',
    slug: 'machine-learning',
    description:
      'An introduction to machine learning, covering supervised and unsupervised learning techniques, neural networks, and more.',
    tags: ['AI', 'Machine Learning', 'Neural Networks'],
    color: 'red',
  },
  {
    key: 'mock-course-key-5',
    code: 'CS203',
    title: 'Databases',
    likes: 200,
    watchlists: 90,
    prerequisites: [mockPrerequisite[0]],
    school: 'School of Computing',
    slug: 'databases',
    description:
      'This course covers database design, relational databases, SQL, and database management systems.',
    tags: ['SQL', 'Database Design', 'DBMS'],
    color: 'green',
  },
  {
    key: 'mock-course-key-6',
    code: 'CS204',
    title: 'Operating Systems',
    likes: 180,
    watchlists: 70,
    prerequisites: [mockPrerequisite[1]],
    school: 'School of Computing',
    slug: 'operating-systems',
    description:
      'This course covers the design and implementation of operating systems, including process management, memory management, file systems, and more.',
    tags: ['OS', 'Memory Management', 'File Systems'],
    color: 'purple',
  },
  {
    key: 'mock-course-key-7',
    code: 'CS205',
    title: 'Computer Networks',
    likes: 220,
    watchlists: 95,
    prerequisites: [mockPrerequisite[1]],
    school: 'School of Computing',
    slug: 'computer-networks',
    description:
      'This course covers the principles and practices of computer networking, including network protocols, architecture, and security.',
    tags: ['Networking', 'Protocols', 'Security'],
    color: 'orange',
  },
  {
    key: 'mock-course-key-8',
    code: 'CS206',
    title: 'Software Engineering',
    likes: 250,
    watchlists: 105,
    prerequisites: [mockPrerequisite[0], mockPrerequisite[1]],
    school: 'School of Computing',
    slug: 'software-engineering',
    description:
      'This course covers the software development lifecycle, including requirements analysis, design, implementation, testing, and maintenance.',
    tags: ['SDLC', 'Agile', 'Testing'],
    color: 'yellow',
  },
  {
    key: 'mock-course-key-9',
    code: 'CS207',
    title: 'Artificial Intelligence',
    likes: 300,
    watchlists: 120,
    prerequisites: [mockPrerequisite[1]],
    school: 'School of Computing',
    slug: 'artificial-intelligence',
    description:
      'This course provides an introduction to artificial intelligence, covering topics such as search algorithms, knowledge representation, and machine learning.',
    tags: ['AI', 'Search Algorithms', 'Knowledge Representation'],
    color: 'teal',
  },
  {
    key: 'mock-course-key-10',
    code: 'CS208',
    title: 'Cybersecurity',
    likes: 270,
    watchlists: 110,
    prerequisites: [mockPrerequisite[0]],
    school: 'School of Computing',
    slug: 'cybersecurity',
    description:
      'This course covers the fundamentals of cybersecurity, including cryptography, network security, and ethical hacking.',
    tags: ['Security', 'Cryptography', 'Ethical Hacking'],
    color: 'black',
  },
]

export const mockUser: User = {
  id: 'david',
  createdAt: new Date(),
  username: 'david',
  firstName: 'David',
  lastName: 'David Yeo',
  profileImageUrl: '',
}

export const mockList: ListData[] = [
  {
    key: 'mocklist',
    name: 'Collections',
    courseKeys: mockCourses.map((course) => {
      return course.key
    }),
    // slug: 'listslug',
    description: 'A collection of courses created by David Yeo',
    coursesCount: mockCourses.length,
    creator: {
      key: 'David Yeo',
    },
  },
]
