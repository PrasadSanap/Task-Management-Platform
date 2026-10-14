import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const fields = [
  'title',
  'description',
  'priority',
  'dueDate',
  'status',
  'assignedUser',
];

const validStatuses = ['Pending', 'In Progress', 'Completed'];
const validPriorities = ['Low', 'Medium', 'High'];
const validSortOptions = ['newest', 'oldest', 'dueDate'];

function validationError(message) {
  return Object.assign(new Error(message), { status: 400 });
}

// Treat search input as plain text, not a regular expression.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Accept only supported fields and validate their values.
function taskPayload(body = {}) {
  const out = {};

  for (const key of fields) {
    if (body[key] !== undefined) {
      out[key] = body[key];
    }
  }

  if (out.title !== undefined) {
    if (typeof out.title !== 'string') {
      throw validationError('Title must be a string.');
    }

    out.title = out.title.trim();

    if (out.title.length < 2) {
      throw validationError(
        'Title must contain at least 2 characters.'
      );
    }

    if (out.title.length > 150) {
      throw validationError(
        'Title cannot exceed 150 characters.'
      );
    }
  }

  if (out.description !== undefined) {
    if (typeof out.description !== 'string') {
      throw validationError('Description must be a string.');
    }

    out.description = out.description.trim();

    if (out.description.length > 2000) {
      throw validationError(
        'Description cannot exceed 2000 characters.'
      );
    }
  }

  if (
    out.status !== undefined &&
    !validStatuses.includes(out.status)
  ) {
    throw validationError('Invalid task status.');
  }

  if (
    out.priority !== undefined &&
    !validPriorities.includes(out.priority)
  ) {
    throw validationError('Invalid task priority.');
  }

  if (out.assignedUser === '') {
    throw validationError('Assigned user cannot be empty.');
  }

  if (
    out.assignedUser !== undefined &&
    out.assignedUser !== null &&
    (
      typeof out.assignedUser !== 'string' ||
      !mongoose.isValidObjectId(out.assignedUser)
    )
  ) {
    throw validationError('Invalid assigned user.');
  }

  if (out.assignedUser === null) {
    throw validationError('Assigned user cannot be empty.');
  }

  if (out.dueDate === '') {
    out.dueDate = null;
  }

  if (
    out.dueDate !== undefined &&
    out.dueDate !== null &&
    (
      typeof out.dueDate !== 'string' &&
      typeof out.dueDate !== 'number' &&
      !(out.dueDate instanceof Date)
    )
  ) {
    throw validationError('Invalid due date.');
  }

  if (
    out.dueDate !== undefined &&
    out.dueDate !== null &&
    Number.isNaN(new Date(out.dueDate).getTime())
  ) {
    throw validationError('Invalid due date.');
  }

  return out;
}

// GET /api/tasks
export const listTasks = asyncHandler(async (req, res) => {
  const {
    search = '',
    status = '',
    priority = '',
    sort = 'newest',
  } = req.query;

  const page = Math.max(
    1,
    parseInt(req.query.page || '1', 10) || 1
  );

  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit || '8', 10) || 8)
  );

  if (!validSortOptions.includes(sort)) {
    throw validationError('Invalid sort option.');
  }

  if (typeof search !== 'string') {
    throw validationError('Search must be a string.');
  }

  const filter = {
    owner: req.user._id,
  };

  if (status) {
    if (!validStatuses.includes(status)) {
      throw validationError('Invalid task status filter.');
    }

    filter.status = status;
  }

  if (priority) {
    if (!validPriorities.includes(priority)) {
      throw validationError('Invalid task priority filter.');
    }

    filter.priority = priority;
  }

  if (search.trim()) {
    filter.title = {
      $regex: escapeRegex(search.trim()),
      $options: 'i',
    };
  }

  const sortSpec =
    sort === 'oldest'
      ? { createdAt: 1 }
      : sort === 'dueDate'
        ? { dueDate: 1, createdAt: -1 }
        : { createdAt: -1 };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedUser', 'name email')
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit),

    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// GET /api/tasks/:id
export const getTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      message: 'Invalid task ID.',
    });
  }

  const task = await Task.findOne({
    _id: id,
    owner: req.user._id,
  }).populate('assignedUser', 'name email');

  if (!task) {
    return res.status(404).json({
      message: 'Task not found.',
    });
  }

  return res.status(200).json({ task });
});

// POST /api/tasks
export const createTask = asyncHandler(async (req, res) => {
  const data = taskPayload(req.body);

  // Never accept task ownership from the request body.
  data.owner = req.user._id;

  // Assign the task to the logged-in user by default.
  if (!data.assignedUser) {
    data.assignedUser = req.user._id;
  }

  const assignedUserExists = await User.exists({
    _id: data.assignedUser,
  });

  if (!assignedUserExists) {
    return res.status(400).json({
      message: 'Assigned user does not exist.',
    });
  }

  const task = await Task.create(data);

  await task.populate('assignedUser', 'name email');

  return res.status(201).json({ task });
});

// PUT /api/tasks/:id
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      message: 'Invalid task ID.',
    });
  }

  const data = taskPayload(req.body);

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      message: 'Provide at least one field to update.',
    });
  }

  if (data.assignedUser) {
    const assignedUserExists = await User.exists({
      _id: data.assignedUser,
    });

    if (!assignedUserExists) {
      return res.status(400).json({
        message: 'Assigned user does not exist.',
      });
    }
  }

  // Only the owner can update the task.
  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      owner: req.user._id,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate('assignedUser', 'name email');

  if (!task) {
    return res.status(404).json({
      message: 'Task not found.',
    });
  }

  return res.status(200).json({ task });
});

// DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      message: 'Invalid task ID.',
    });
  }

  // Only the owner can delete the task.
  const task = await Task.findOneAndDelete({
    _id: id,
    owner: req.user._id,
  });

  if (!task) {
    return res.status(404).json({
      message: 'Task not found.',
    });
  }

  return res.status(200).json({
    message: 'Task deleted successfully.',
  });
});