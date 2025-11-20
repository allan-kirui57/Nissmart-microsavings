import prisma from '../config/prisma';
import { generateId } from '../utils/helpers';
import logger from '../config/logger';

class WalletService {
  async getWalletByUserId(userId: string, currency: string = 'USD') {
    try {
      const wallet = await prisma.wallet.findFirst({
        where: {
          userId,
          currency
        }
      });

      return wallet;
    } catch (error: any) {
      logger.error(`Error fetching wallet: ${error.message}`);
      throw error;
    }
  }

  async updateBalance(walletId: string, amount: number, operation: 'add' | 'subtract' = 'add') {
    try {
      const wallet = await prisma.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            [operation === 'add' ? 'increment' : 'decrement']: amount
          },
          version: {
            increment: 1
          }
        }
      });

      return wallet;
    } catch (error: any) {
      logger.error(`Error updating wallet balance: ${error.message}`);
      throw error;
    }
  }

  async getBalance(userId: string) {
    try {
      const wallet = await this.getWalletByUserId(userId);
      return wallet ? wallet.balance : 0;
    } catch (error: any) {
      logger.error(`Error getting balance: ${error.message}`);
      throw error;
    }
  }
}

export default new WalletService();
