import {
  Scene,
  PerspectiveCamera,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  WebGLRenderer
} from 'three'

export const main = () => {
  const scene = new Scene()

  const { innerWidth, innerHeight } = window
  const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)

  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new Mesh(geometry, material)
  scene.add(cube)
  camera.position.z = 5

  const renderer = new WebGLRenderer()
  renderer.setSize(innerWidth, innerHeight)
  document.body.appendChild(renderer.domElement)

  const animate = () => {
    window.requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.z += 0.01

    renderer.render(scene, camera)
  }

  animate()
}
