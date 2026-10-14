import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
const router = Router(); router.use(protect);
router.route('/').get(listTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
export default router;
