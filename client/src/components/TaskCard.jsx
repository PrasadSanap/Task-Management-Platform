import React from 'react';
import {
  CalendarDays,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';

const statusStyles = {
  Pending:
    'bg-amber-50 text-amber-700 ring-amber-200',
  'In Progress':
    'bg-sky-50 text-sky-700 ring-sky-200',
  Completed:
    'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const priorityStyles = {
  Low: 'text-slate-500',
  Medium: 'text-orange-600',
  High: 'text-rose-600',
};

function TaskCard({ task, onEdit, onDelete, onStatus }) {
  if (!task) return null;

  const status = task.status || 'Pending';
  const priority = task.priority || 'Medium';

  const dueDate = task.dueDate
    ? new Date(task.dueDate)
    : null;

  const formattedDate =
    dueDate && !Number.isNaN(dueDate.getTime())
      ? dueDate.toLocaleDateString()
      : 'No due date';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
      {/* Task title, status, and actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
              statusStyles[status] || statusStyles.Pending
            }`}
          >
            {status}
          </span>

          <h3 className="mt-3 break-words text-base font-bold">
            {task.title || 'Untitled task'}
          </h3>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            aria-label={`Edit ${task.title || 'task'}`}
            onClick={() => onEdit?.(task)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-800"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={`Delete ${task.title || 'task'}`}
            onClick={() => onDelete?.(task)}
            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:hover:bg-rose-950"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Task description */}
      <p className="mt-2 min-h-10 whitespace-pre-wrap break-words text-sm leading-5 text-slate-500">
        {task.description || 'No description added.'}
      </p>

      {/* Priority, due date, and assigned user */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
        <span
          className={`font-bold ${
            priorityStyles[priority] || priorityStyles.Medium
          }`}
        >
          {priority} priority
        </span>

        <span className="flex items-center gap-1 text-slate-500">
          <CalendarDays size={14} aria-hidden="true" />
          {formattedDate}
        </span>

        <span className="flex items-center gap-1 text-slate-500">
          <UserRound size={14} aria-hidden="true" />
          {task.assignedUser?.name || 'You'}
        </span>
      </div>

      {/* Update task status */}
      <label className="mt-4 block text-xs font-semibold text-slate-500">
        Update status

        <select
          value={status}
          onChange={(event) =>
            onStatus?.(task, event.target.value)
          }
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </label>
    </article>
  );
}

export default React.memo(TaskCard);