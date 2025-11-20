import { Router, Request, Response, NextFunction } from 'express';
import walletService from '../services/walletService';
import transactionService from '../services/transactionService';
import { formatResponse } from '../utils/helpers';

const router = Router();

// GET /api/transactions/:userId - per-user transaction history (alias for dashboard helper)
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(
      Math.max(parseInt((req.query.limit as string) || '50', 10), 1),
      200,
    );
    const items = await transactionService.getUserTransactions(userId, limit);
    res.json(
      formatResponse(
        'success',
        { userId, items },
        'User transactions',
      ),
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/balance/:userId - simple balance lookup
router.get('/balance/:userId', async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const balance = await walletService.getBalance(userId);
    res.json(formatResponse('success', { userId, balance }, 'User balance'));
  } catch (error) {
    next(error);
  }
});

export default router;
