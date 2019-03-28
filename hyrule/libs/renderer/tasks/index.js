export const elementsToTasks = (elements, camera) => {
  const lineTask = {
    elements: elements.filter(element => element.type === 'RefGrid'),
    camera
  }
  const triangleTask = {
    elements: elements.filter(element => element.type === 'Cube'),
    camera
  }

  return [lineTask, triangleTask]
}
