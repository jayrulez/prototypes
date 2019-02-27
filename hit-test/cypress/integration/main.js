/* global describe it expect cy before */

describe('Layer Picker', function () {
  before(() => {
    cy.visit('http://localhost:1234')
  })

  it('should pick correct layer', () => {
    cy.wait(1000).window().then(({ picker }) => {
      // init
      expect(picker.pick(0, 0)).to.equal(null)

      // basic rect
      expect(picker.pick(100, 20).name).to.equal('rect-a')

      // rect with transform
      expect(picker.pick(80, 50).name).to.equal('rect-b')

      // transparent image pixel
      expect(picker.pick(40, 100)).to.equal(null)

      // white image pixel
      expect(picker.pick(150, 120).name).to.equal('image-1')

      // black image pixel
      expect(picker.pick(150, 150).name).to.equal('image-1')

      // black image pixel
      expect(picker.pick(150, 150).name).to.equal('image-1')

      // image overlay
      expect(picker.pick(180, 200).name).to.equal('image-2')

      // svg
      expect(picker.pick(220, 70).name).to.equal('vector')
    })
  })
})
