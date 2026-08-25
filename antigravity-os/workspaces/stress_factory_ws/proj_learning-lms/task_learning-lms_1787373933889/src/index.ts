import { LmsController } from './controllers/lms.controller';
export const lmsApp = new LmsController();
export function getLmsStatus() { return { online: true, platformReady: true }; }