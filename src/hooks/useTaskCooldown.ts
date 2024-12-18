import { useState, useEffect } from 'react';
import { TaskService } from '../services';
import { useAuth } from '../contexts/AuthContext';

interface TaskLimits {
  canComplete: boolean;
  limitMessage: string | null;
}

export function useTaskCooldown(taskId: number): TaskLimits {
  const { user } = useAuth();
  const [limits, setLimits] = useState<TaskLimits>({
    canComplete: true,
    limitMessage: null
  });

  useEffect(() => {
    const checkLimits = async () => {
      if (!user?.id || !taskId) return;

      try {
        // Check task availability from backend
        const response = await TaskService.checkTaskAvailability(taskId);
        
        setLimits({
          canComplete: response.canComplete,
          limitMessage: response.message || null
        });
      } catch (error) {
        console.error('Error checking task limits:', error);
        setLimits({
          canComplete: false,
          limitMessage: 'Failed to check task availability'
        });
      }
    };

    checkLimits();
  }, [taskId, user?.id]);

  return limits;
}