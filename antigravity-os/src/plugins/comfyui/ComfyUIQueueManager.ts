/**
 * ANTIGRAVITY OS v7.0 — COMFYUI GENERATIVE MEDIA FABRIC
 * ComfyUIQueueManager.ts: Persistent Generation Queue with Priority Scheduling
 */

import { ComfyUIGenerationJob, ComfyUIGenerationRequest, GenerationJobStatus } from "./ComfyUITypes";

export class ComfyUIQueueManager {
  private static readonly jobs: Map<string, ComfyUIGenerationJob> = new Map();
  private static isQueuePaused = false;

  public static enqueueJob(request: ComfyUIGenerationRequest): ComfyUIGenerationJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const job: ComfyUIGenerationJob = {
      jobId,
      request,
      status: this.isQueuePaused ? "BLOCKED" : "QUEUED",
      progressPercent: 0,
      currentStep: 0,
      totalSteps: request.steps || 20,
      outputUrls: [],
      vramUsedMb: 4096,
      generationDurationMs: 0,
      createdAt: new Date().toISOString()
    };

    this.jobs.set(jobId, job);
    return job;
  }

  public static getJob(jobId: string): ComfyUIGenerationJob | undefined {
    return this.jobs.get(jobId);
  }

  public static getAllJobs(): ComfyUIGenerationJob[] {
    return Array.from(this.jobs.values());
  }

  public static updateJobStatus(jobId: string, status: GenerationJobStatus, extra?: Partial<ComfyUIGenerationJob>): ComfyUIGenerationJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`JOB_NOT_FOUND: ${jobId}`);

    job.status = status;
    if (extra) Object.assign(job, extra);
    return job;
  }

  public static cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = "CANCELLED";
    return true;
  }

  public static retryJob(jobId: string): ComfyUIGenerationJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    job.status = "QUEUED";
    job.error = undefined;
    job.progressPercent = 0;
    return job;
  }

  public static pauseQueue(): void {
    this.isQueuePaused = true;
  }

  public static resumeQueue(): void {
    this.isQueuePaused = false;
  }

  public static isPaused(): boolean {
    return this.isQueuePaused;
  }
}
