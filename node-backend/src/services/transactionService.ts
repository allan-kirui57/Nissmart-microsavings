import prisma from '../config/prisma';
import { generateId } from '../utils/helpers';
import logger from '../config/logger';
import walletService from './walletService';

class TransactionService {
  async createDeposit(userId: string, amount: any, idempotencyKey: string) {
    try {
      logger.info(`Processing deposit for user ${userId}, amount: ${amount}`);

      // Check idempotency
      const existingTx = await prisma.transaction.findUnique({
        where: { idempotencyKey }
      });

      if (existingTx) {
        logger.warn(`Duplicate deposit request detected: ${idempotencyKey}`);
        return existingTx;
      }

      const wallet: any = await walletService.getWalletByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');

      const transaction = await prisma.$transaction(async (tx) => {
        // Create transaction record
        const txRecord = await tx.transaction.create({
          data: {
            id: generateId(),
            transactionType: 'DEPOSIT',
            status: 'COMPLETED',
            amount: parseFloat(amount),
            toUserId: userId,
            toWalletId: wallet.id,
            idempotencyKey
          }
        });

        // Update wallet balance
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: parseFloat(amount)
            },
            version: {
              increment: 1
            }
          }
        });

        // Log audit
        await tx.auditLog.create({
          data: {
            id: generateId(),
            transactionId: txRecord.id,
            action: 'DEPOSIT_COMPLETED',
            newBalance: wallet.balance + parseFloat(amount),
            userId
          }
        });

        return txRecord;
      });

      logger.info(`Deposit completed: ${transaction.id}`);
      return transaction;
    } catch (error: any) {
      logger.error(`Deposit failed: ${error.message}`);
      throw error;
    }
  }

  async createTransfer(fromUserId: string, toUserId: string, amount: any, idempotencyKey: string) {
    try {
      logger.info(`Processing transfer: ${fromUserId} → ${toUserId}, amount: ${amount}`);

      // Check idempotency
      const existingTx = await prisma.transaction.findUnique({
        where: { idempotencyKey }
      });

      if (existingTx) {
        logger.warn(`Duplicate transfer detected: ${idempotencyKey}`);
        return existingTx;
      }

      const fromWallet: any = await walletService.getWalletByUserId(fromUserId);
      const toWallet: any = await walletService.getWalletByUserId(toUserId);

      if (!fromWallet || !toWallet) throw new Error('Wallet not found');
      if (fromWallet.balance < parseFloat(amount)) throw new Error('Insufficient balance');

      const transaction = await prisma.$transaction(async (tx) => {
        // Create transaction record
        const txRecord = await tx.transaction.create({
          data: {
            id: generateId(),
            transactionType: 'TRANSFER',
            status: 'PENDING',
            amount: parseFloat(amount),
            fromUserId,
            toUserId,
            fromWalletId: fromWallet.id,
            toWalletId: toWallet.id,
            idempotencyKey
          }
        });

        // Deduct from sender
        await tx.wallet.update({
          where: { id: fromWallet.id },
          data: {
            balance: {
              decrement: parseFloat(amount)
            },
            version: {
              increment: 1
            }
          }
        });

        // Add to receiver
        await tx.wallet.update({
          where: { id: toWallet.id },
          data: {
            balance: {
              increment: parseFloat(amount)
            },
            version: {
              increment: 1
            }
          }
        });

        // Mark as completed
        await tx.transaction.update({
          where: { id: txRecord.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });

        // Log audits
        await tx.auditLog.create({
          data: {
            id: generateId(),
            transactionId: txRecord.id,
            action: 'TRANSFER_FROM',
            oldBalance: fromWallet.balance,
            newBalance: fromWallet.balance - parseFloat(amount),
            userId: fromUserId
          }
        });

        await tx.auditLog.create({
          data: {
            id: generateId(),
            transactionId: txRecord.id,
            action: 'TRANSFER_TO',
            oldBalance: toWallet.balance,
            newBalance: toWallet.balance + parseFloat(amount),
            userId: toUserId
          }
        });

        return txRecord;
      });

      logger.info(`Transfer completed: ${transaction.id}`);
      return transaction;
    } catch (error: any) {
      logger.error(`Transfer failed: ${error.message}`);
      throw error;
    }
  }

  async createWithdrawal(userId: string, amount: any, idempotencyKey: string) {
    try {
      logger.info(`Processing withdrawal for user ${userId}, amount: ${amount}`);

      const existingTx = await prisma.transaction.findUnique({
        where: { idempotencyKey }
      });

      if (existingTx) return existingTx;

      const wallet: any = await walletService.getWalletByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.balance < parseFloat(amount)) throw new Error('Insufficient balance');

      const transaction = await prisma.$transaction(async (tx) => {
        // Simulate external API call
        const externalRef = `EXT-${Date.now()}`;

        const txRecord = await tx.transaction.create({
          data: {
            id: generateId(),
            transactionType: 'WITHDRAWAL',
            status: 'PENDING',
            amount: parseFloat(amount),
            fromUserId: userId,
            fromWalletId: wallet.id,
            idempotencyKey,
            referenceId: externalRef
          }
        });

        // Create withdrawal record
        await tx.withdrawal.create({
          data: {
            id: generateId(),
            userId,
            amount: parseFloat(amount),
            status: 'PENDING',
            externalReference: externalRef,
            transactionId: txRecord.id
          }
        });

        // Deduct from wallet immediately
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              decrement: parseFloat(amount)
            },
            version: {
              increment: 1
            }
          }
        });

        return txRecord;
      });

      logger.info(`Withdrawal initiated: ${transaction.id}`);
      return transaction;
    } catch (error: any) {
      logger.error(`Withdrawal failed: ${error.message}`);
      throw error;
    }
  }

  async getUserTransactions(userId: string, limit = 50) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [{ fromUserId: userId }, { toUserId: userId }]
        },
        include: {
          fromUser: { select: { id: true, name: true, email: true } },
          toUser: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return transactions;
    } catch (error: any) {
      logger.error(`Error fetching transactions: ${error.message}`);
      throw error;
    }
  }

  async getAllTransactions(limit = 100) {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          fromUser: { select: { id: true, name: true, email: true } },
          toUser: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return transactions;
    } catch (error: any) {
      logger.error(`Error fetching all transactions: ${error.message}`);
      throw error;
    }
  }
}

export default new TransactionService();
