import type { FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebase.config';

let runtime: Promise<FirebaseApp> | undefined;
export function firebaseApplication(): Promise<FirebaseApp> {
  runtime ??= import('firebase/app')
    .then(
      (sdk) =>
        sdk.getApps().find((app) => app.name === 'gabinete-crm') ??
        sdk.initializeApp(firebaseConfig, 'gabinete-crm'),
    )
    .catch((error: unknown) => {
      runtime = undefined;
      throw error;
    });
  return runtime;
}
