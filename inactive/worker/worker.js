/* eslint-env worker */

onmessage = (e) => {
  console.log('msg recieved')
  self.postMessage('Done')
}
