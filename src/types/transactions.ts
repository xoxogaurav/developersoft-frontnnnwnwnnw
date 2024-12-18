export interface Task {
  id: number;
  title: string;
  description: string;
  reward: string | number;
  time_estimate: string;
  time_in_seconds: number;
  category: string;
  difficulty: string;
  steps: string[];
  proof_requirements: Array<{
    type: string;
    description: string;
  }>;
  approval_hours: number;
  is_active: boolean;
  admin_status?: string;
  admin_feedback?: string | null;
}

export interface Transaction {
  id: number;
  user_id: number;
  task_id?: number;
  amount: string | number;
  type: 'earning' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  payment_method?: string | null;
  payment_details?: any;
  created_at: string;
  updated_at: string;
  task?: Task;
  canDispute: boolean;
}