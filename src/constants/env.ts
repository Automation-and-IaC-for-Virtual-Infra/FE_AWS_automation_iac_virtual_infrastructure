export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',

  FRONTEND_SERVER_URL: process.env.FRONTEND_SERVER_URL || '',
  BACKEND_SERVER_URL: process.env.BACKEND_SERVER_URL || '',
  WS_BACKEND_SERVER_URL: process.env.WS_BACKEND_SERVER_URL || '',
  BACKEND_API_KEY: process.env.BACKEND_API_KEY || '',
  BACKEND_SERVER_URL_2: process.env.BACKEND_SERVER_URL_2 || '',

  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-1',

  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || '',
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || '',
  COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET || '',

  METRIC_ACCESS_KEY: process.env.METRIC_ACCESS_KEY || '',
  METRIC_SECRET_KEY: process.env.METRIC_SECRET_KEY || '',
}
