import { StudentService } from '../services/student.service';
import { CourseService } from '../services/course.service';
import { LessonService } from '../services/lesson.service';
import { GradingService } from '../services/grading.service';
export class LmsController { constructor(public students = new StudentService(), public courses = new CourseService(), public lessons = new LessonService(), public grading = new GradingService()) {} }