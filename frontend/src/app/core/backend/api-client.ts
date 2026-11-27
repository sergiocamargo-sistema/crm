import { inject, Service } from '@angular/core';
import { AUTH_REPOSITORY } from '../repositories/auth.repository';
import { backendConfig } from '../config/backend.config';
import type { ApiResult, BackendApi, BackendOperation } from '../../domain/contracts/backend-api';
import { DataConnection } from './data-connection';
import { AppCheckTokenProvider } from './app-check-token';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
@Service()
export class ApiClient {
  private readonly auth = inject(AUTH_REPOSITORY);
  private readonly connection = inject(DataConnection);
  private readonly appCheck = inject(AppCheckTokenProvider);
  async call<K extends BackendOperation>(
    operation: K,
    ...args: Parameters<BackendApi[K]>
  ): Promise<Awaited<ReturnType<BackendApi[K]>>> {
    const requestId = crypto.randomUUID();
    const body = JSON.stringify({ operation, args: persistentReferences(args), requestId });
    const mutation = !/^(load|list|prepare|search|sync)/u.test(operation);
    // Repetições de rede usam a mesma chave; o servidor devolve o resultado já confirmado.
    let response: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await this.request(
          '/v1/actions',
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body },
          attempt > 0,
        );
        break;
      } catch (error) {
        if (error instanceof ApiError || attempt === 1) throw error;
      }
    }
    const payload = (await response!.json()) as ApiResult<Awaited<ReturnType<BackendApi[K]>>>;
    if (mutation) this.connection.refresh();
    return payload.result;
  }
  async upload(file: File): Promise<string> {
    const response = await this.request('/v1/files', {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'X-File-Name': encodeURIComponent(file.name),
      },
      body: file,
    });
    return ((await response.json()) as { reference: string }).reference;
  }
  private async request(path: string, init: RequestInit, forceRefresh = false): Promise<Response> {
    const [token, appToken] = await Promise.all([
      this.auth.getToken(forceRefresh),
      this.appCheck.token(),
    ]);
    const response = await fetch(`${backendConfig.url}${path}`, {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${token}`,
        'X-Firebase-AppCheck': appToken,
      },
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        code?: string;
        title?: string;
      } | null;
      throw new ApiError(
        response.status,
        error?.code ?? 'REQUEST_FAILED',
        error?.title ?? 'Não foi possível concluir a operação. Tente novamente.',
      );
    }
    return response;
  }
}

function persistentReferences(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(persistentReferences);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(record)
        .filter(([key]) => key !== 'fileReference')
        .map(([key, item]) => [
          key,
          ['src', 'url'].includes(key) && typeof record['fileReference'] === 'string'
            ? record['fileReference']
            : persistentReferences(item),
        ]),
    );
  }
  return value;
}
