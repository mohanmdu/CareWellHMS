import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { SERVER_API_ORIGIN } from './server-api-origin.token';

/** Rewrites relative /api and /uploads URLs to an absolute origin during SSR only. */
export const ssrApiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const origin = inject(SERVER_API_ORIGIN);
  if (isPlatformServer(platformId) && origin && req.url.startsWith('/')) {
    return next(req.clone({ url: `${origin}${req.url}` }));
  }
  return next(req);
};
