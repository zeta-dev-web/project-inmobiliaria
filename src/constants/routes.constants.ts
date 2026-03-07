export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN] as const;
