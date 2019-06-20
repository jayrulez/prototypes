const input = '/home/a/../b/c/d'

const sanitize = (str, stack = []) => {
  const lName = str.substr(0, str.indexOf('/') + 1)
  if (!lName) return str ? [...stack, str].join('/') : stack.join('/')
  if (lName === './') return sanitize(str.replace('./', ''), stack)
  lName === '../' ? stack.pop() : stack.push(lName.replace('/', ''))
  return sanitize(str.replace(lName, ''), stack)
}

console.log(sanitize(input))
