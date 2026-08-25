// LMS Course Curriculum Module - Autonomously Patched
export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  scorePercent: number;
}

export function isEligibleForCertificate(lessons: LessonProgress[], passingScore = 80): boolean {
  if (!lessons || lessons.length === 0) return false;
  const allCompleted = lessons.every(l => l.completed);
  const avgScore = lessons.reduce((sum, l) => sum + l.scorePercent, 0) / lessons.length;
  return allCompleted && avgScore >= passingScore;
}
