import express from "express";
import * as authController from "../controllers/auth.controllers.js";
import { upload } from "../config/config.js";

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

// GET /api/auth/get-dashboard
//Protected Route

authRouter.get('/auth/get-me', authController.getMe)

// POST /api/auth/verify-email

authRouter.post('/auth/verify-email', authController.verifyEmail)

// POST /api/auth/create-category

authRouter.post('/auth/create-category', upload.single("image"), authController.createCategory)

// GET /api/auth/get-category

authRouter.get('/auth/get-category', authController.getCategory)

// GET /api/auth/get-category/slug

authRouter.get('/auth/get-category/:slug', authController.getCategoryBySlug)

// PUT /api/auth/update-category/slug

authRouter.put('/auth/update-category/:slug', upload.single("image"), authController.updateCategory)

// DELETE /api/auth/delete-category/slug

authRouter.delete('/auth/delete-category/:slug', authController.deleteCategory)

// POST /api/auth/create-product

authRouter.post('/auth/create-product', upload.single("image"), authController.createProduct)

// GET /api/auth/get-products

authRouter.get('/auth/get-products', authController.getProducts)

// DELETE /api/auth/delete-product/slug

authRouter.delete('/auth/delete-product/:slug', authController.deleteProduct)

// GET /api/auth/get-product/slug

authRouter.get('/auth/get-product/:slug', authController.getProductBySlug)

// PUT /api/auth/update-product/slug

authRouter.put('/auth/update-product/:slug', upload.single("image"), authController.updateProductBySlug)

export default authRouter;