import { StoreController } from './controllers/store.controller';
export const store = new StoreController();
export function getStoreStatus() { return { active: true, currency: 'USD' }; }