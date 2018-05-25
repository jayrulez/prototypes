/**
 * This script converts Illustrator generated SVG into grouped format.
 */
import $ from 'jquery'

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 575 250">
  <title>Asset 8</title>
  <g id="Layer_2" data-name="Layer 2">
    <g id="container" fill="red">
      <path id="se keepColor" d="M527.5,249.49a47.21,47.21,0,0,0,47-47h-47Z" fill="#ff0" stroke="#000" stroke-miterlimit="10" />
      <path id="s" d="M47.5,202.5v47h480v-47Z" fill="#ff0" stroke="#000" stroke-miterlimit="10" />
      <path id="sw" d="M.51,202.5a47.21,47.21,0,0,0,47,47v-47Z" fill="#ff0" stroke="#000" stroke-miterlimit="10" />
      <path id="e" d="M527.5,47.5v155h47c0-.08,0-.16,0-.23V47.73c0-.07,0-.15,0-.23Z" fill="#ff0" stroke="#000" stroke-miterlimit="10"
      />
      <rect id="c" x="47.5" y="47.5" width="480" height="155" fill="#ff0" stroke="#000" stroke-miterlimit="10" />
      <path id="w" d="M47.5,47.5H.51c0,.08,0,.16,0,.23V202.27c0,.07,0,.15,0,.23h47Z" fill="#ff0" stroke="#000" stroke-miterlimit="10"
      />
      <path id="ne" d="M574.49,47.5a47.21,47.21,0,0,0-47-47v47Z" fill="#ff0" stroke="#000" stroke-miterlimit="10" />
      <path id="n" d="M527.5,47.5V.51H47.5v47Z" fill="#ff0" stroke="#000" stroke-miterlimit="10" />
      <path id="nw" d="M47.5.51a47.21,47.21,0,0,0-47,47h47Z" fill="#ff0" stroke="#000" stroke-miterlimit="10" />
    </g>
  </g>
</svg>
`

class SVGConverter {
  constructor () {
    this.grids = [
      'nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se', 'container'
    ]
    this.getNodeMeta = this.getNodeMeta.bind(this)
    this.getHTML = this.getHTML.bind(this)
  }

  getNodeMeta (id) {
    const { grids } = this
    const meta = { grid: null, color: true }

    // ['se-x', 'keepColor'] => ['se', '-', 'x', 'keepColor']
    const inputs = id
      .split(' ').map(str => str.split('-')).reduce((a, b) => [...a, ...b])

    for (let i = 0; i < grids.length; i++) {
      if (inputs.indexOf(grids[i]) > -1) {
        meta.grid = grids[i]
      }
      if (inputs.indexOf('keepColor') > -1) {
        meta.color = false
      }
    }
    return meta
  }

  getHTML (node) {
    return node.get()[0].parentNode.outerHTML
  }

  convert (svg) {
    const { getHTML, getNodeMeta } = this
    const colorMap = {}

    $(svg).find('*[fill], *[stroke]').each((i, node) => {
      const { fill, stroke } = node.attributes
      if (fill) {
        if (!colorMap[node.id]) {
          colorMap[node.id] = { fill: fill.value, stroke: null }
        } else {
          colorMap[node.id].fill = fill.value
        }
      }
      if (stroke) {
        if (!colorMap[node.id]) {
          colorMap[node.id] = { stroke: stroke.value, fill: null }
        } else {
          colorMap[node.id].stroke = stroke.value
        }
      }
    })

    svg = getHTML($(svg).find('title').html('Gaoding TextContainer'))

    let colors = []

    $(svg).find('*[id]').each((i, node) => {
      const meta = getNodeMeta(node.id)
      if (colorMap[node.id] && meta.color) {
        const { fill, stroke } = colorMap[node.id]
        colors.push(fill, stroke)
      }
    })

    colors = Array.from(new Set(colors)).filter(color => !!color)

    const $content = $(svg).find('*[id]').each((i, node) => {
      const { id } = node
      const meta = this.getNodeMeta(id)

      if (meta.color) {
        const { fill, stroke } = node.attributes
        if (fill) {
          const index = colors.indexOf(fill.value)
          node.setAttribute('fill', `{{colors[${index}]}}`)
        }
        if (stroke) {
          const index = colors.indexOf(stroke.value)
          node.setAttribute('stroke', `{{colors[${index}]}}`)
        }
      }

      if (meta.grid) {
        if (node.tagName !== 'g') {
          $(node)
            .wrap(`<g class="editor-svg-${meta.grid}"></g>`)
        } else {
          $(node)
            .addClass(`editor-svg-${meta.grid}`)
        }
      }

      node.removeAttribute('data-name')
      node.removeAttribute('id')
    })

    return {
      colors,
      content: getHTML($content)
    }
  }
}

const converter = new SVGConverter()
const result = converter.convert(svg)
console.log(result.content)
