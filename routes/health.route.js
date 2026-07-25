import express from 'express';
import { checkHealth } from '../controllers/health.controller.js';
import { restrictTo, verifyJWT} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.get('/Status',verifyJWT , restrictTo('admin') , checkHealth);

export default router;
