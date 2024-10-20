import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react';
import { Course } from './Course';
import { useNavigate } from '@/router';
import { Course as CourseType } from '@/types/cf'; // Ensure this import points to the right type

// Mock dependencies
jest.mock('@/router', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('@clerk/clerk-react', () => ({
  useClerk: jest.fn(() => ({ openSignIn: jest.fn() })),
  useUser: jest.fn(() => ({ user: { id: 'user123' }, isSignedIn: true })),
}));
jest.mock('./hooks/useCourseFinderHooks', () => ({
  useLikeCourse: jest.fn(() => ({ mutate: jest.fn() })),
  useWatchListCourse: jest.fn(() => ({ mutate: jest.fn() })),
  useGetLikeCourse: jest.fn(() => ({ data: { liked: false } })),
  useGetWatchList: jest.fn(() => ({ data: { exist: false } })),
}));

// Helper function for rendering component with context
const renderWithCourseContext = (course: Partial<CourseType>) => {
  render(
    <Course course={course as CourseType}>
      <Course.Image />
      <Course.Description />
      <Course.ClickStats
        likes={course.likes || 0}
        watchlists={course.watchlists || 0}
        course_code={course.code || ''}
      />
    </Course>
  );
};

describe('Course Component', () => {
  const mockCourse: Partial<CourseType> = {
    key: "MH1811",
    slug: "MH1811",
    code: "MH1811",
    title: "MATHEMATICS 2",
    description: "Partial differentiation. Multiple integrals. Sequences and series. First order differential equations. Second order differential equations.",
    school: "SPMS",
    likes: 0,
    watchlists: 2,
    color: "#FFFF00",
    prerequisites: [],
    tags: ["partial differentiation", "multiple integrals", "series", "sequences"]
  };

  it('renders the Course component with correct data', () => {
    renderWithCourseContext(mockCourse);

    // Check if the course image renders the course code
    expect(screen.getByText(mockCourse.code!)).toBeInTheDocument();

    // Check if the course description is rendered
    expect(screen.getByText(mockCourse.description!)).toBeInTheDocument();

    // Check if the stats (likes and watchlists) are displayed correctly
    expect(screen.getByText(mockCourse.likes!.toString())).toBeInTheDocument();
    expect(screen.getByText(mockCourse.watchlists!.toString())).toBeInTheDocument();
  });

  it('handles like button click', () => {
    renderWithCourseContext(mockCourse);

    const likeButton = screen.getByRole('button', { name: /0/i });
    
    // Simulate clicking the like button
    fireEvent.click(likeButton);

    // Check if the like count updates optimistically
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('handles favorite button click', () => {
    renderWithCourseContext(mockCourse);

    const favoriteButton = screen.getByRole('button', { name: /2/i });
    
    // Simulate clicking the favorite button
    fireEvent.click(favoriteButton);

    // Check if the watchlist count updates optimistically
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('navigates to course detail page on thumbnail click', () => {
    const navigate = useNavigate();
    renderWithCourseContext(mockCourse);

    const courseThumbnail = screen.getByRole('button');

    // Simulate clicking on the course thumbnail
    fireEvent.click(courseThumbnail);

    // Check if the navigate function was called with the correct arguments
    expect(navigate).toHaveBeenCalledWith(
      { pathname: '/course/:slug' },
      { params: { slug: mockCourse.slug! } }
    );
  });
});
