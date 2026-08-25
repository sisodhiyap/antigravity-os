import { DoctorService } from '../services/doctor.service';
import { PatientService } from '../services/patient.service';
import { AppointmentService } from '../services/appointment.service';
import { NotificationService } from '../services/notification.service';
export class ClinicController { constructor(public doctors = new DoctorService(), public patients = new PatientService(), public appointments = new AppointmentService(), public notifications = new NotificationService()) {} }