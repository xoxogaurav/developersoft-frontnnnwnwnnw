import React, { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  Check,
  Zap,
  UserCheck,
  Camera,
  FileText,
  Link,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TaskService, UploadService } from '../services';
import toast from 'react-hot-toast';
import TaskTimer from './TaskTimer';
import TaskSteps from './TaskSteps';
import { formatCurrency } from '../utils/currency';

interface ProofRequirement {
  type: 'screenshot' | 'text' | 'url';
  description: string;
}

interface TaskDetailsProps {
  task: {
    id: number;
    title: string;
    description: string;
    reward: string | number;
    time_estimate?: string;
    timeEstimate?: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    approval_type?: string;
    approvalType?: 'automatic' | 'manual';
    steps: string[];
    proof_requirements?: ProofRequirement[];
    time_in_seconds?: string | number;
    timeInSeconds?: string | number;
  };
  onBack: () => void;
}

export default function TaskDetails({ task, onBack }: TaskDetailsProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'preview' | 'in-progress' | 'completed'>(
    'preview'
  );
  const [proofs, setProofs] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [setDebugInfo] = useState<any>(null);

  // Normalize task data to handle both API and local format
  const normalizedTask = {
    ...task,
    timeEstimate: task.time_estimate || task.timeEstimate,
    approvalType: task.approval_type || task.approvalType,
    timeInSeconds: task.time_in_seconds || task.timeInSeconds,
    proofRequirements: task.proof_requirements || [],
  };

  // Parse time in seconds
  const timeInSeconds =
    typeof normalizedTask.timeInSeconds === 'string'
      ? parseInt(normalizedTask.timeInSeconds, 10)
      : typeof normalizedTask.timeInSeconds === 'number'
      ? normalizedTask.timeInSeconds
      : 0;

  // Parse reward
  const reward =
    typeof task.reward === 'string' ? parseFloat(task.reward) : task.reward;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleProofChange = (type: string, value: string) => {
    setProofs((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleTimerComplete = () => {
    setCurrentStepIndex(task.steps.length - 1);
  };

  const handleSubmit = async () => {
    if (!user?.id || !task.id) return;

    // Validate all required proofs
    const missingProofs = normalizedTask.proofRequirements.filter((req) => {
      if (req.type === 'screenshot') {
        return !selectedFile;
      }
      return !proofs[req.type];
    });

    if (missingProofs.length > 0) {
      toast.error('Please provide all required proofs');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let screenshotUrl = '';
      if (selectedFile) {
        screenshotUrl = await UploadService.uploadImage(selectedFile);
        setUploadProgress(50);
      }

      // Update debug info with request details

      const response = await TaskService.submitTask(
        task.id,
        screenshotUrl,
        proofs
      );
      setUploadProgress(100);

      setStatus('completed');
      toast.success(
        normalizedTask.approvalType === 'automatic'
          ? 'Task completed! Reward added to your balance.'
          : 'Task submitted for review!'
      );
    } catch (error: any) {
      console.error('Task submission error:', error);

      toast.error('Failed to submit task');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const getProofTypeIcon = (type: string) => {
    switch (type) {
      case 'screenshot':
        return <Camera className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'url':
        return <Link className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to tasks
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Task header section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {task.title}
                </h1>
                <span
                  className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    normalizedTask.approvalType === 'automatic'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {normalizedTask.approvalType === 'automatic' ? (
                    <>
                      <Zap className="h-3 w-3 mr-1" /> Instant Approval
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3 w-3 mr-1" /> Manual Review
                    </>
                  )}
                </span>
              </div>
              <p className="text-gray-600">{task.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                {formatCurrency(reward.toFixed(2))}
              </div>
              <div className="text-sm text-gray-500">
                {normalizedTask.timeEstimate}
              </div>
            </div>
          </div>

          {/* Task content based on status */}
          {status === 'preview' && (
            <div className="space-y-6">
              <TaskSteps
                steps={task.steps}
                currentStepIndex={0}
                mode="preview"
              />

              {/* Proof Requirements Section */}
              {normalizedTask.proofRequirements.length > 0 && (
                <div className="border-t border-b border-gray-200 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Required Proof:
                  </h2>
                  <div className="space-y-3">
                    {normalizedTask.proofRequirements.map((req, index) => (
                      <div key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          {getProofTypeIcon(req.type)}
                        </span>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {req.type.charAt(0).toUpperCase() +
                              req.type.slice(1)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {req.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStatus('in-progress')}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Task
              </button>
            </div>
          )}

          {status === 'in-progress' && (
            <div className="space-y-6">
              <TaskTimer
                initialSeconds={timeInSeconds}
                onComplete={handleTimerComplete}
                isRunning={true}
              />

              <TaskSteps
                steps={task.steps}
                currentStepIndex={currentStepIndex}
                mode="progress"
              />

              {currentStepIndex === task.steps.length - 1 && (
                <div className="space-y-4">
                  {normalizedTask.proofRequirements.map((req, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {req.description}
                      </label>
                      {req.type === 'screenshot' ? (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">
                                Upload screenshot
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                      ) : (
                        <input
                          type={req.type === 'url' ? 'url' : 'text'}
                          value={proofs[req.type] || ''}
                          onChange={(e) =>
                            handleProofChange(req.type, e.target.value)
                          }
                          placeholder={`Enter ${req.type}`}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      )}
                    </div>
                  ))}

                  {previewUrl && (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Screenshot preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Task'}
                  </button>
                </div>
              )}
            </div>
          )}

          {status === 'completed' && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Task Completed!
              </h2>
              <p className="text-gray-600">
                {normalizedTask.approvalType === 'automatic'
                  ? 'Your reward has been added to your balance.'
                  : 'Your submission is being reviewed.'}
              </p>
              <button
                onClick={onBack}
                className="mt-6 text-indigo-600 hover:text-indigo-500"
              >
                Return to tasks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
