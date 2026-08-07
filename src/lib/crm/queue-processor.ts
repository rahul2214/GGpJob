import { syncBatchCandidatesToBrevo, runAIRecommendationForCandidate, getCRMCandidates } from './candidate-crm';
import type { QueueJobTask, CRMCandidate } from './types';

// In-Memory Task Queue for Asynchronous Queue Processing
const TASK_QUEUE: QueueJobTask[] = [];

/**
 * Enqueues an Asynchronous Queue Task
 */
export function enqueueTask(
  taskType: 'BATCH_CONTACT_SYNC' | 'AI_RECOMMENDATION_DISPATCH' | 'ANALYTICS_RECALCULATION',
  payload: any
): QueueJobTask {
  const task: QueueJobTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    taskType,
    payload,
    status: 'PENDING',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date().toISOString(),
  };

  TASK_QUEUE.push(task);

  // Trigger non-blocking async execution
  setTimeout(() => {
    processQueueTask(task.id).catch(err =>
      console.error(`[QUEUE_PROCESSOR] Task ${task.id} exception:`, err)
    );
  }, 50);

  return task;
}

/**
 * Processes a single Queue Task with Exponential Backoff Retries
 */
export async function processQueueTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  const task = TASK_QUEUE.find(t => t.id === taskId);
  if (!task || task.status === 'COMPLETED' || task.status === 'PROCESSING') {
    return { success: true };
  }

  task.status = 'PROCESSING';
  task.processedAt = new Date().toISOString();

  try {
    if (task.taskType === 'BATCH_CONTACT_SYNC') {
      const candidates: CRMCandidate[] = task.payload?.candidates || (await getCRMCandidates());
      
      // Chunk processing (100 candidates per batch chunk)
      const chunkSize = 100;
      for (let i = 0; i < candidates.length; i += chunkSize) {
        const chunk = candidates.slice(i, i + chunkSize);
        await syncBatchCandidatesToBrevo(chunk);
      }
    } else if (task.taskType === 'AI_RECOMMENDATION_DISPATCH') {
      const candidates: CRMCandidate[] = task.payload?.candidates || (await getCRMCandidates());
      const forceSend = task.payload?.forceSend ?? false;

      // Chunk dispatches (50 candidates per batch chunk)
      const chunkSize = 50;
      for (let i = 0; i < candidates.length; i += chunkSize) {
        const chunk = candidates.slice(i, i + chunkSize);
        for (const candidate of chunk) {
          await runAIRecommendationForCandidate(candidate, { forceSend });
        }
      }
    }

    task.status = 'COMPLETED';
    return { success: true };
  } catch (err: any) {
    task.retryCount++;
    console.error(`[QUEUE_ERROR] Task ${taskId} failed (Attempt ${task.retryCount}/${task.maxRetries}):`, err);

    if (task.retryCount < task.maxRetries) {
      // Exponential Backoff Retry (2^attempt * 1000ms)
      const delayMs = Math.pow(2, task.retryCount) * 1000;
      setTimeout(() => {
        task.status = 'PENDING';
        processQueueTask(taskId).catch(() => {});
      }, delayMs);
    } else {
      task.status = 'FAILED';
      task.error = err.message || 'Task failed after max retries';
    }

    return { success: false, error: err.message };
  }
}

/**
 * Returns current status of all queued background tasks
 */
export function getQueueStatus(): {
  totalTasks: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  tasks: QueueJobTask[];
} {
  return {
    totalTasks: TASK_QUEUE.length,
    pendingCount: TASK_QUEUE.filter(t => t.status === 'PENDING').length,
    processingCount: TASK_QUEUE.filter(t => t.status === 'PROCESSING').length,
    completedCount: TASK_QUEUE.filter(t => t.status === 'COMPLETED').length,
    failedCount: TASK_QUEUE.filter(t => t.status === 'FAILED').length,
    tasks: TASK_QUEUE.slice(-50).reverse(),
  };
}
