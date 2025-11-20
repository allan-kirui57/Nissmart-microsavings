import { Router, Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { formatResponse } from '../utils/helpers';

const router = Router();

// GET /api/users - list all users with wallets
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    res.json(formatResponse('success', users, 'Users fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// POST /api/users - create a user (and default wallet)
router.post('/', async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name } = req.body;
    
    const user = await userService.createUser(email, name);
    res.status(201).json(formatResponse('success', user, 'User created successfully'));
  } catch (error) {
    next(error);
  }
});

export default router;
