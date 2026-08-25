import { AppController } from './controllers/api.controller';
export const app = new AppController();
export function initializePlatform() { return { ready: true, version: '4.0.0' }; }