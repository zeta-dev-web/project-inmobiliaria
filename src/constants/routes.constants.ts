export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.AUTH,
] as const;