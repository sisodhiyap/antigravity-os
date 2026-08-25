import { AuthService } from '../services/auth.service';
import { ProjectService } from '../services/project.service';
import { TaskService } from '../services/task.service';
export class AppController { constructor(public auth = new AuthService(), public projects = new ProjectService(), public tasks = new TaskService()) {} }