import React, { useState, useEffect } from 'react';
import { Candidate, CollaborativeNote, User } from '../types';
import { authenticatedFetch } from '../lib/api';
import { useToast } from './common/ToastSystem';
import { 
  MessageSquare, 
  Send, 
  Lock, 
  Tag, 
  Trash2, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  FileCode, 
  DollarSign,
  Users
} from 'lucide-react';

interface CollaborativeNotesPanelProps {
  candidate: Candidate;
  currentUser: User | null;
}

export const CollaborativeNotesPanel: React.FC<CollaborativeNotesPanelProps> = ({
  candidate,
  currentUser,
}) => {
  const toast = useToast();
  const [notes, setNotes] = useState<CollaborativeNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<CollaborativeNote['category']>('General');
  const [isConfidential, setIsConfidential] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to load candidate notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidate) {
      fetchNotes();
    }
  }, [candidate.id]);

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setSelectedTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          category,
          isConfidential,
          tags,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to post collaborative note');
      }

      const newNote = await res.json();
      setNotes([newNote, ...notes]);
      setContent('');
      setTags([]);
      setIsConfidential(false);
      toast.success('Note Published', 'Internal assessment note added to candidate dossier.');
    } catch (err: any) {
      console.error('Note creation error:', err);
      toast.error('Failed to Post Note', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: CollaborativeNote['category']) => {
    switch (cat) {
      case 'Technical Review':
        return <FileCode className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Interview Feedback':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Compensation':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Integrity Flag':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'Hiring Committee':
        return <Users className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Hiring Team Collaboration & Evaluation Notes</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700">
                {notes.length} Notes
              </span>
            </h3>
            <p className="text-xs text-slate-400">Secure internal assessment thread with role attribution and confidentiality controls.</p>
          </div>
        </div>
      </div>

      {/* New Note Form */}
      <form onSubmit={handleSubmit} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Category Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            >
              <option value="General">General Note</option>
              <option value="Technical Review">Technical Review</option>
              <option value="Interview Feedback">Interview Feedback</option>
              <option value="Compensation">Compensation & Leveling</option>
              <option value="Integrity Flag">Integrity Flag</option>
              <option value="Hiring Committee">Hiring Committee</option>
            </select>
          </div>

          {/* Confidentiality Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
            />
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Lock className="w-3 h-3" /> Confidential (Admin/HR Only)
            </span>
          </label>
        </div>

        {/* Text Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Add internal assessment note for ${candidate.name}...`}
          rows={3}
          required
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
        />

        {/* Tags input */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(selectedTag.trim());
                }
              }}
              placeholder="Add tag and press Enter..."
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-600 w-44 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            />
            {tags.map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/60 text-[10px] flex items-center gap-1"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-400 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : 'Add Note'}</span>
          </button>
        </div>
      </form>

      {/* Notes Stream */}
      {loading ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          Loading team collaboration notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          No team evaluation notes recorded yet. Be the first to add notes for this candidate.
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const formattedDate = new Date(note.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={note.id}
                className={`bg-slate-950/60 border rounded-2xl p-4 space-y-3 transition-colors ${
                  note.isConfidential 
                    ? 'border-amber-800/40 bg-amber-950/10' 
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Author Info & Category */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={note.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={note.authorName}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{note.authorName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {note.authorRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1">
                      {getCategoryIcon(note.category)}
                      <span>{note.category}</span>
                    </span>

                    {note.isConfidential && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-950/80 border border-amber-800 text-amber-300 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Confidential
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {note.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px] font-mono border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
