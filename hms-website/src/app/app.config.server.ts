import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { SERVER_API_ORIGIN } from './core/server-api-origin.token';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: SERVER_API_ORIGIN, useValue: process.env['API_ORIGIN'] ?? 'http://localhost:8080' }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
