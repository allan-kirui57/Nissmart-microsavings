import { Router } from 'express';
import usersRouter from './users';
import transactionsRouter from './transactions';
import dashboardRouter from './dashboard';

const router = Router();

router.use('/users', usersRouter);
router.use('/transactions', transactionsRouter);
router.use('/dashboard', dashboardRouter);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
