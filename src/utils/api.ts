export const toBackendUrl = (path: string) => {
  const backendUrl = process.env.FRONTEND_SERVER_URL || "http://localhost:3000"
  return `${backendUrl}${path}`
}
