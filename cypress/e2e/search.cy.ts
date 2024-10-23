describe('Search Functionality on Navigation', () => {
  // Generate a random search query
  const searchQuery = 't'
  beforeEach(() => {
    // Visit the homepage before running each test
    cy.visit('http://localhost:3000')
  })

  it('should open the search modal, perform a search, and navigate to the results page', () => {
    // Step 1: Open the search modal by clicking the search button in the nav
    cy.get('[data-testid="search-command-trigger"]').click()

    // Step 2: Type a search query in the search input field
    cy.get('input[placeholder="Search for a course"]').type(
      `${searchQuery}{enter}`,
    )

    // Step 4: Simulate pressing the Enter key after the query is typed
    cy.get('input[placeholder="Search for a course"]').type('{enter}')
    cy.wait(2000)

    // Step 3: Check if search results (thumbnails) appear
    cy.get('[data-testid="searchbar-result"]').should('exist')

    // Step 4: Click the "View Results" button
    cy.get('[data-testid="view-button"]').click()

    // Step 5: Assert the URL includes the search query
    cy.url().should(
      'include',
      `/search/courses?q=${encodeURIComponent(searchQuery)}`,
    )

    // Step 6: Ensure search results (thumbnails) exist on the results page
    cy.get('[data-testid="search-result"]').should('exist')
  })
})
