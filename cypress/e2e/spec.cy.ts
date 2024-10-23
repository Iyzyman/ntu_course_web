describe('Course Page Text Validation', () => {
  it('should display the correct course-related information', () => {
    // Visit the local development server
    cy.visit('http://localhost:3000')

    // Assert that the page contains the first phrase
    cy.contains('Don’t know which courses to take?').should('be.visible')

    // Assert that the page contains the second phrase
    cy.contains('Find courses that suits you.').should('be.visible')

    // Assert that the page contains the third phrase
    cy.contains('Save those interesting ones.').should('be.visible')

    // Assert that the page contains the fourth phrase
    cy.contains('Tell us why the course is good (or bad).').should('be.visible')
  })
})
