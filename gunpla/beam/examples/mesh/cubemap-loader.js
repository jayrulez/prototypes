/* eslint-env browser */

const loadImage = src => new Promise(resolve => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.src = src
})

export const loadCubeMaps = basePath => new Promise(resolve => {
  const cubeMaps = [
    { type: 'diffuse', level: 0, urls: [], images: [] },
    { type: 'specular', level: 9, urls: [], images: [] }
  ]
  const dirs = ['right', 'left', 'top', 'bottom', 'front', 'back']

  cubeMaps.forEach(({ type, level }, i) => {
    dirs.forEach(dir => {
      for (let j = 0; j <= level; j++) {
        cubeMaps[i].urls.push(`${basePath}/${type}/${type}_${dir}_${j}.jpg`)
      }
    })
  })

  const lightPromises = cubeMaps
    .map(light => Promise.all(light.urls.map(loadImage)))

  Promise.all(lightPromises).then(lightImages => {
    lightImages.forEach((images, i) => { cubeMaps[i].images = images })
    resolve(cubeMaps)
  })
})
