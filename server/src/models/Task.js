import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      minlength: [2, 'Title must contain at least 2 characters.'],
      maxlength: [150, 'Title cannot exceed 150 characters.'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters.'],
      default: '',
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },

    dueDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },

    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An assigned user is required.'],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task owner is required.'],
    },
  },
  {
    timestamps: true,
  }
);

// Improves queries that list a user's tasks by creation date.
taskSchema.index({ owner: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;