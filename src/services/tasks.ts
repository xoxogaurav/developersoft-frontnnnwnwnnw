import api from './api';
import type { Task, TaskSubmission } from '../db/database';

export interface TaskResponse {
  success: boolean;
  data: Task[];
}

export interface TaskSubmissionResponse {
  success: boolean;
  data: {
    submission: TaskSubmission;
    transaction: {
      id: number;
      amount: number;
      type: string;
      status: string;
    };
  };
}

export interface ProofSubmission {
  type: 'screenshot' | 'text' | 'url';
  url?: string;
  content?: string;
}

class TaskService {
  private static instance: TaskService;

  private constructor() {}

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  public async getTasks(): Promise<Task[]> {
    try {
      const response = await api.get<TaskResponse>('/tasks');
      
      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        console.error('Invalid task response:', response.data);
        throw new Error('Invalid response format');
      }

      return response.data.parsed.data;
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      throw new Error(
        error.response?.data?.parsed?.message || 
        error.message || 
        'Failed to fetch tasks'
      );
    }
  }

  public async submitTask(taskId: number, screenshotUrl: string, proofs: Record<string, string>): Promise<TaskSubmissionResponse['data']> {
    try {
      console.log('Submitting task:', { taskId, screenshotUrl, proofs });
      
      // Format proofs according to API requirements
      const formattedProofs: ProofSubmission[] = [];

      if (screenshotUrl) {
        formattedProofs.push({
          type: 'screenshot',
          url: screenshotUrl
        });
      }

      if (proofs.text) {
        formattedProofs.push({
          type: 'text',
          content: proofs.text
        });
      }

      if (proofs.url) {
        formattedProofs.push({
          type: 'url',
          url: proofs.url
        });
      }

      const response = await api.post<TaskSubmissionResponse>(`/tasks/${taskId}/submit`, {
        proofs: formattedProofs
      });

      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        console.error('Invalid submission response:', response.data);
        throw new Error('Invalid response format');
      }

      return response.data.parsed.data;
    } catch (error: any) {
      console.error('Task submission error:', error);
      throw new Error(
        error.response?.data?.parsed?.message || 
        error.message || 
        'Failed to submit task'
      );
    }
  }

  public async checkTaskAvailability(taskId: number): Promise<{ canComplete: boolean; message?: string }> {
    try {
      const response = await api.get(`/tasks/${taskId}/availability`);
      return response.data.parsed?.data || { canComplete: true };
    } catch (error: any) {
      console.error('Task availability check error:', error);
      throw new Error(
        error.response?.data?.parsed?.message || 
        error.message || 
        'Failed to check task availability'
      );
    }
  }
}

export default TaskService.getInstance();