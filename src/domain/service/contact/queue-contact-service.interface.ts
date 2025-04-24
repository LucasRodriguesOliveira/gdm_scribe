import { IntegrationProgressPayload } from './integration-progress.payload';

export interface IQueueContactService {
  integrationProgress(payload: IntegrationProgressPayload): void;
}
