import { ContactService } from '../services/contact.service';
import { DealService } from '../services/deal.service';
export class CrmController { constructor(public contacts = new ContactService(), public deals = new DealService()) {} }