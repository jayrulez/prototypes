/* global describe it expect cy before */

describe('Demo Test', function () {
  before(() => {
    cy.visit('http://localhost:1234')
  })

  it('should pass', () => {
    expect(true).to.equal(true)
  })
})