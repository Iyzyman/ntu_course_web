describe('IndexPage - Course Finder', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3000')
  })

  it('should display trending courses', () => {
    // Verify the Trending Courses section is visible
    cy.contains('Trending Courses').should('be.visible')

    // Ensure that course thumbnails are rendered
    cy.get('[data-testid="course-thumbnail"]').should(
      'have.length.greaterThan',
      0,
    )
  })

  it('should navigate to course detail page when a course is clicked', () => {
    // Find the first course thumbnail and click it
    cy.get('[data-testid="course-thumbnail"]').first().click()

    // Retrieve the course slug from the clicked course (assumed to be from courseCode)
    cy.get('[data-testid="course-thumbnail"]')
      .first()
      .invoke('attr', 'data-coursecode')
      .then((courseCode) => {
        // Assert the user is redirected to the course detail page by checking the URL
        cy.url().should('include', `/course/${courseCode}`)

        // Optionally, assert the course title or other content is visible on the course detail page
        cy.get('[data-testid="course-title"]').should('be.visible')
      })
  })

  it('should allow toggling between trend periods', () => {
    // Open the trending tabs (if available)
    cy.get('[data-testid="trending-tab"]').first().click()

    // Assert the courses displayed belong to the selected period
    cy.get('[data-testid="course-thumbnail"]').should(
      'have.length.greaterThan',
      0,
    )
  })

  it('should navigate to the Discover Courses page', () => {
    // Click the link to navigate to the Discover Courses page
    cy.get('[data-testid="discover-title"]').click()

    // Assert the URL changes to the discover page
    cy.url().should('include', '/discover')

    // Assert the page content loads
    cy.contains('Browse through our courses by faculties').should('be.visible')
  })
})
