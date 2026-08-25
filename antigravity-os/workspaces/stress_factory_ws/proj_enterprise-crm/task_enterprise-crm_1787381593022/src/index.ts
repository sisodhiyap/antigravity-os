import { CrmController } from './controllers/crm.controller';
export const crmApp = new CrmController();
export function getCrmStatus() { return { online: true, version: '1.0.0' }; }