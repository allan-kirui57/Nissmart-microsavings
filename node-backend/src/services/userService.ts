import prisma from '../config/prisma';
import { generateId } from '../utils/helpers';
import { info, error as logError } from '../config/logger';

interface UserData {
  id: string;
  email: string;
  name: string;
  userType: string;
  wallets?: any[];
  sentTransactions?: any[];
}

class UserService {
  async createUser(email: string, name: string, userType: string = 'user'): Promise<UserData> {
    try {
      info(`Creating user: ${email}`);

      const user = await (prisma.user as any).create({
        data: {
          id: generateId(),
          email,
          name,
          userType
        },
        include: {
          wallets: true
        }
      });

      // Create default wallet for user
      await (prisma.wallet as any).create({
        data: {
          id: generateId(),
          userId: user.id,
          balance: 0.00,
          currency: 'USD',
          version: 0
        }
      });

      info(`User created successfully: ${user.id}`);
      return user;
    } catch (error: any) {
      logError(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<UserData | null> {
    try {
      const user = await (prisma.user as any).findUnique({
        where: { id: userId },
        include: {
          wallets: true,
          sentTransactions: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return user;
    } catch (error: any) {
      logError(`Error fetching user: ${error.message}`);
      throw error;
    }
  }

  async getAllUsers(): Promise<UserData[]> {
    try {
      const users = await (prisma.user as any).findMany({
        include: {
          wallets: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return users;
    } catch (error: any) {
      logError(`Error fetching users: ${error.message}`);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    try {
      return await (prisma.user as any).findUnique({
        where: { email }
      });
    } catch (error: any) {
      logError(`Error fetching user by email: ${error.message}`);
      throw error;
    }
  }
}

export default new UserService();
