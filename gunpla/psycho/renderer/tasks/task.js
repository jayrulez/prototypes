export const elementsToTasks = (elements) => {
  const lineTasks = elements.filter(element => element.type === 'RefGrid')
  const triangleTasks = elements.filter(element => element.type === 'Cube')

  return [lineTasks, triangleTasks]
}
