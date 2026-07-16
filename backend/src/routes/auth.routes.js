import express from "express";
import * as authController from "../controllers/auth.controllers.js";

const authRouter = express.Router();

// POST /api/auth/register
authRouter.post('/auth/register', authController.register);

// POST /api/auth/login
authRouter.post('/auth/login', authController.login);

// POST /api/auth/logout
authRouter.post('/auth/logout', authController.logout);

export default authRouter;