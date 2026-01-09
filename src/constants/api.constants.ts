export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PROPERTIES: '/api/properties',
  CLIENTS: '/api/clients',
  OFFERS: '/api/offers',
  RENTALS: '/api/rentals',
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;