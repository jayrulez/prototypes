import { XMLBumpover } from 'bumpover'

const rules = [
  {
    match: node => node.attributes && node.attributes.id,
    update: node => new Promise((resolve, reject) => {
      resolve({
        node: {
          name: node.name,
          type: node.type,
          attributes: node.attributes,
          elements: node.elements
        }
      })
    })
  }
]

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 575 250">
  <title>Asset 8</title>
  <g id="Layer_2" data-name="Layer 2">
    <g id="container">
      <path id="se" d="M527.5,249.49a47.21,47.21,0,0,0,47-47h-47Z" fill="#ff0" stroke="#000" stroke-miterlimit="10" />
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

const bumper = new XMLBumpover(rules)
bumper.bump(svg).then(console.log)
