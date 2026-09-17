/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

let coepCredentialless = false;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'coepCredentialless') {
    coepCredentialless = Boolean(event.data.value);
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  const coiRequest =
    coepCredentialless && request.mode === 'no-cors'
      ? new Request(request, { credentials: 'omit' })
      : request;

  event.respondWith(
    fetch(coiRequest)
      .then((response) => {
        if (response.status === 0) {
          return response;
        }
        const headers = new Headers(response.headers);
        headers.set(
          'Cross-Origin-Embedder-Policy',
          coepCredentialless ? 'credentialless' : 'require-corp',
        );
        if (!coepCredentialless) {
          headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
        }
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
      .catch((error) => {
        console.error('[sw] fetch failed', error);
        throw error;
      }),
  );
});

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();
