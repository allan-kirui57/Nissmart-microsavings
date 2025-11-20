import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import transactionService from '../services/transactionService';
import walletService from '../services/walletService';
import { formatResponse, generateId } from '../utils/helpers';

const router = Router();

// Admin dashboard: system summary
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, walletAgg, totalTransfers, totalWithdrawals] = await Promise.all([
      prisma.user.count(),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.transaction.count({ where: { transactionType: 'TRANSFER' } }),
      prisma.transaction.count({ where: { transactionType: 'WITHDRAWAL' } })
    ]);

    const data = {
      totalUsers,
      totalWalletBalance: walletAgg._sum.balance ?? 0,
      totalTransfers,
      totalWithdrawals,
    };

    res.json(formatResponse('success', data, 'Dashboard summary'));
  } catch (error) {
    next(error);
  }
});

// Admin dashboard: transactions table with basic filters + pagination
router.get('/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt((req.query.pageSize as string) || '20', 10), 1),
      100
    );
    const skip = (page - 1) * pageSize;

    const { type, status, userId, from, to } = req.query;

    const where: any = {};

    if (type) {
      where.transactionType = String(type).toUpperCase();
    }

    if (status) {
      where.status = String(status).toUpperCase();
    }

    const or: any[] = [];
    if (userId) {
      or.push({ fromUserId: userId }, { toUserId: userId });
    }
    if (or.length > 0) {
      where.OR = or;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(String(from));
      }
      if (to) {
        where.createdAt.lte = new Date(String(to));
      }
    }

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          fromUser: { select: { id: true, name: true, email: true } },
          toUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json(
      formatResponse('success', { items, page, pageSize, total }, 'Dashboard transactions')
    );
  } catch (error) {
    next(error);
  }
});

// Admin dashboard: recent activity feed from audit logs
router.get('/activity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(
      Math.max(parseInt((req.query.limit as string) || '20', 10), 1),
      100
    );

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json(formatResponse('success', logs, 'Recent activity'));
  } catch (error) {
    next(error);
  }
});

// --- Transaction flows (used by user/admin flows & demo video) ---

router.post('/deposit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, amount } = req.body;
    const idempotencyKey =
      (req.header('Idempotency-Key') as string) || generateId();

    if (!userId || !amount) {
      return res
        .status(400)
        .json(formatResponse('error', null, 'userId and amount are required'));
    }

    const txRecord = await transactionService.createDeposit(
      userId,
      amount,
      idempotencyKey,
    );

    res
      .status(201)
      .json(formatResponse('success', txRecord, 'Deposit completed'));
  } catch (error) {
    next(error);
  }
});

router.post('/transfer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromUserId, toUserId, amount } = req.body;
    const idempotencyKey =
      (req.header('Idempotency-Key') as string) || generateId();

    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json(
        formatResponse('error', null, 'fromUserId, toUserId and amount are required'),
      );
    }

    const txRecord = await transactionService.createTransfer(
      fromUserId,
      toUserId,
      amount,
      idempotencyKey,
    );

    res
      .status(201)
      .json(formatResponse('success', txRecord, 'Transfer completed'));
  } catch (error) {
    next(error);
  }
});

router.post('/withdraw', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, amount } = req.body;
    const idempotencyKey =
      (req.header('Idempotency-Key') as string) || generateId();

    if (!userId || !amount) {
      return res
        .status(400)
        .json(formatResponse('error', null, 'userId and amount are required'));
    }

    const txRecord = await transactionService.createWithdrawal(
      userId,
      amount,
      idempotencyKey,
    );

    res
      .status(201)
      .json(formatResponse('success', txRecord, 'Withdrawal initiated'));
  } catch (error) {
    next(error);
  }
});

// Per-user balance and history helpers for convenience in dashboard demos
router.get('/balance/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const balance = await walletService.getBalance(userId);
    res.json(formatResponse('success', { userId, balance }, 'User balance'));
  } catch (error) {
    next(error);
  }
});

router.get('/user-transactions/:userId', async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(
      Math.max(parseInt((req.query.limit as string) || '50', 10), 1),
      200,
    );
    const transactions = await transactionService.getUserTransactions(userId, limit);
    res.json(
      formatResponse(
        'success',
        { userId, items: transactions },
        'User transactions',
      ),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
