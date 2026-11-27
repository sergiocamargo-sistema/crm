import { Service } from '@angular/core';
import type { AppCheck } from 'firebase/app-check';
import { firebaseApplication } from './firebase-app';

// Chave pública limitada aos domínios cadastrados; não é credencial administrativa.
const SITE_KEY = '6LeO3jQuAAAAAPYpKvDV2S-zWF5ErrbMm0RgTpmG';
@Service()
export class AppCheckTokenProvider {
  private runtime:
    Promise<{ appCheck: AppCheck; sdk: typeof import('firebase/app-check') }> | undefined;

  async token(): Promise<string> {
    this.runtime ??= Promise.all([firebaseApplication(), import('firebase/app-check')])
      .then(([app, sdk]) => ({
        sdk,
        appCheck: sdk.initializeAppCheck(app, {
          provider: new sdk.ReCaptchaEnterpriseProvider(SITE_KEY),
          isTokenAutoRefreshEnabled: true,
        }),
      }))
      .catch((error: unknown) => {
        this.runtime = undefined;
        throw error;
      });
    const { appCheck, sdk } = await this.runtime;
    return (await sdk.getToken(appCheck)).token;
  }
}
