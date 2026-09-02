import React, { useState, useEffect } from 'react';
import { Candidate, CandidateReviewAssignment, User } from '../types';
import { authenticatedFetch } from '../lib/api';
import { useToast } from './common/ToastSystem';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Send
} from 'lucide-react';

interface ReviewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  onAssignmentCreated?: () => void;
}

export const ReviewAssignmentModal: React.FC<ReviewAssignmentModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onAssignmentCreated,
}) => {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [taskType, setTaskType] = useState<CandidateReviewAssignment['taskType']>('TECHNICAL_REVIEW');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 3600000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const res = await authenticatedFetch('/api/admin/users');
        if (res.ok) {
          const userList = await res.json();
          setUsers(userList);
          if (userList.length > 0) {
            setSelectedUserId(userList[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load reviewers list:', err);
      } finally {
        setLoadingUsers(false);
      }
    }

    loadUsers();
  }, [isOpen]);

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.warning('Reviewer Required', 'Please choose a team member to assign this review task.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authenticatedFetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          assignedToUserId: selectedUserId,
          taskType,
          dueDate: new Date(dueDate).toISOString(),
          notes,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create review task assignment');
      }

      toast.success(
        'Review Task Assigned',
        `Dispatched '${taskType}' review assignment for ${candidate.name}.`
      );
      if (onAssignmentCreated) onAssignmentCreated();
      onClose();
    } catch (err: any) {
      console.error('Assignment submission error:', err);
      toast.error('Assignment Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dispatch Review Assignment</h2>
              <p className="text-xs text-slate-400">Delegate evaluation or verification for {candidate.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Reviewer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Assign Reviewer</label>
            {loadingUsers ? (
              <div className="text-xs text-slate-500">Loading enterprise reviewers...</div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) • {u.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Task Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            >
              <option value="TECHNICAL_REVIEW">Technical Skill & Repo Code Review</option>
              <option value="EVIDENCE_AUDIT">Evidence & Claims Verification Audit</option>
              <option value="BACKGROUND_CHECK">Background & Integrity Check</option>
              <option value="COMPENSATION_BENCHMARK">Compensation & Leveling Assessment</option>
              <option value="HIRING_DECISION">Hiring Committee Final Decision</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Instructions Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Task Instructions & Focus Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please verify claimed open source contributions and test on distributed architecture scenarios..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Assigning...' : 'Dispatch Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
