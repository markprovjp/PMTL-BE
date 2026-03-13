import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestActor =
  | {
      type: 'admin';
      id: number | null;
      displayName: string | null;
      email: string | null;
    }
  | {
      type: 'user';
      id: number | null;
      displayName: string | null;
      email: string | null;
    }
  | {
      type: 'guest';
      id: null;
      displayName: null;
      email: null;
    }
  | {
      type: 'system';
      id: null;
      displayName: 'system';
      email: null;
    };

export type RequestContextValue = {
  actor: RequestActor;
  method: string;
  path: string;
  ip: string;
  ipHash: string;
  userAgent: string | null;
  requestId: string | null;
};

const requestContextStorage = new AsyncLocalStorage<RequestContextValue>();

export function runWithRequestContext<T>(value: RequestContextValue, callback: () => T): T {
  return requestContextStorage.run(value, callback);
}

export function getRequestContext(): RequestContextValue | null {
  return requestContextStorage.getStore() ?? null;
}
