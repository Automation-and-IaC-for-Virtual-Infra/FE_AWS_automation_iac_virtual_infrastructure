export const formatCamelCase = (str: string) => {
  return str.replace(/([A-Z])/g, ' $1').trim()
}
