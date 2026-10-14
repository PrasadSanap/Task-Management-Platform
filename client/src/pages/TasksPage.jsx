import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  RefreshCw,
} from 'lucide-react';

import { api, messageFromError } from '../services/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import TaskCard from '../components/TaskCard';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('newest');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const navigate = useNavigate();
  const { toast, showToast, dismiss } = useToast();

  // Reset pagination when filters change.
  useEffect(() => {
    setPage(1);
  }, [query, status, priority, sort]);

  // Load tasks from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/tasks', {
          params: {
            search: query,
            status,
            priority,
            sort,
            page,
            limit: 8,
          },
        });

        if (cancelled) return;

        setTasks(data.tasks || []);
        setPages(
          Math.max(1, data.pagination?.pages || 1)
        );
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        if (!cancelled) {
          setError(messageFromError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [query, status, priority, sort, page, reloadKey]);

  // Retry loading after a network or server error.
  const retryLoading = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  // Navigate to the edit page.
  const onEdit = useCallback(
    (task) => {
      navigate(`/tasks/${task._id}/edit`);
    },
    [navigate]
  );

  // Delete a task.
  const onDelete = useCallback(
    async (task) => {
      if (!window.confirm(`Delete "${task.title}"?`)) {
        return;
      }

      try {
        await api.delete(`/tasks/${task._id}`);

        const remainingTasks = tasks.length - 1;
        const newTotal = Math.max(0, total - 1);
        const newPages = Math.max(
          1,
          Math.ceil(newTotal / 8)
        );

        setTotal(newTotal);
        setPages(newPages);

        if (remainingTasks === 0 && page > 1) {
          // Move back if the current page becomes empty.
          setPage((currentPage) => currentPage - 1);
        } else {
          setTasks((oldTasks) =>
            oldTasks.filter(
              (item) => item._id !== task._id
            )
          );
        }

        showToast('Task deleted successfully.');
      } catch (err) {
        showToast(messageFromError(err), 'error');
      }
    },
    [tasks.length, total, page, showToast]
  );

  // Update the task status.
  const onStatus = useCallback(
    async (task, value) => {
      try {
        await api.put(`/tasks/${task._id}`, {
          status: value,
        });

        showToast('Task status updated successfully.');

        // Reload to keep active filters and sorting accurate.
        setReloadKey((key) => key + 1);
      } catch (err) {
        showToast(messageFromError(err), 'error');
      }
    },
    [showToast]
  );

  const resultText = useMemo(
    () => `${total} ${total === 1 ? 'task' : 'tasks'} found`,
    [total]
  );

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            YOUR WORKSPACE
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            All tasks
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Search, prioritize, and keep every task moving.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/tasks/new')}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus size={17} aria-hidden="true" />
          Create task
        </button>
      </div>

      {/* Search and filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_1fr_1fr_1fr]">
          <div className="relative">
            <Search
              size={17}
              aria-hidden="true"
              className="absolute left-3.5 top-3.5 text-slate-400"
            />

            <input
              type="search"
              aria-label="Search tasks by title"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search by task title..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="relative">
            <Filter
              size={15}
              aria-hidden="true"
              className="absolute left-3.5 top-3.5 text-slate-400"
            />

            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            aria-label="Sort tasks"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="dueDate">Due date</option>
          </select>
        </div>
      </section>

      {/* Results information */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{resultText}</span>
        <span>
          Page {page} of {pages}
        </span>
      </div>

      {/* Error and retry */}
      {error && !loading && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={retryLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 font-semibold hover:bg-rose-100"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div
          aria-label="Loading tasks"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : error ? null : tasks.length === 0 ? (
        // Empty state
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <ListTodo
            className="mx-auto text-slate-300"
            size={36}
            aria-hidden="true"
          />

          <h2 className="mt-3 font-bold">
            No tasks found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Try another filter or create a new task.
          </p>

          <button
            type="button"
            onClick={() => navigate('/tasks/new')}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Create your first task
          </button>
        </div>
      ) : (
        // Task cards
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatus={onStatus}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <p className="text-xs text-slate-500">
          Showing {tasks.length} of {total} tasks
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() =>
              setPage((currentPage) => currentPage - 1)
            }
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Previous
          </button>

          <button
            type="button"
            disabled={page >= pages || loading}
            onClick={() =>
              setPage((currentPage) => currentPage + 1)
            }
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
          >
            Next
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Toast toast={toast} onClose={dismiss} />
    </div>
  );
}
