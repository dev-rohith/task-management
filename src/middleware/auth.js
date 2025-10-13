import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

 

    const jwtSecret = process.env.JWT_SECRET;


    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);


    req.user = user;
    next();
  } catch (error) {

  }
};
