import express from "express";
import * as authController from "../controllers/auth.controllers.js";

const authRouter = express.Router();

// POST /api/auth/register
authRouter.post('/auth/register', authController.register);

// POST /api/auth/login
authRouter.post('/auth/login', authController.login);

// POST /api/auth/logout
authRouter.post('/auth/logout', authController.logout);

// POST /api/auth/logout-all-devices
authRouter.post('/auth/logout-all-devices', authController.logoutAll);

// GET /api/auth/update-refresh-token
authRouter.get('/auth/update-refresh-token', authController.UpdateRefreshToken);

// GET /api/get-dashboard
//Protected Route

authRouter.get('/auth/get-me', authController.getMe)

// GET /api/verify-email

authRouter.post('/auth/verify-email', authController.verifyEmail)

export default authRouter;