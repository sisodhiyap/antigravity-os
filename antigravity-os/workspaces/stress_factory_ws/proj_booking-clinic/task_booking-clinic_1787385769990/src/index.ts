import { ClinicController } from './controllers/clinic.controller';
export const clinic = new ClinicController();
export function getClinicStatus() { return { online: true, slotsReady: true }; }