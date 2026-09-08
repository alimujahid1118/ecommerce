import express from "express";
import * as authController from "../controllers/auth.controllers.js";
import { upload } from "../config/config.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

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

// GET /api/auth/get-me

authRouter.get('/auth/get-me', authController.getMe)

// GET /api/auth/get-users

authRouter.get('/auth/get-users', requireAuth, requireAdmin, authController.getUsers)

// DELETE /api/auth/delete-user/:userId

authRouter.delete('/auth/delete-user/:userId', requireAuth, requireAdmin, authController.deleteUser)

authRouter.put('/auth/profile', requireAuth, authController.updateProfile)

authRouter.put('/auth/password', requireAuth, authController.changePassword)

// POST /api/auth/verify-email

authRouter.post('/auth/verify-email', authController.verifyEmail)

// POST /api/auth/create-category

authRouter.post('/auth/create-category', requireAuth, requireAdmin, upload.single("image"), authController.createCategory)

// GET /api/auth/get-category

authRouter.get('/auth/get-category', authController.getCategory)

// GET /api/auth/get-category/slug

authRouter.get('/auth/get-category/:slug', authController.getCategoryBySlug)

// PUT /api/auth/update-category/slug

authRouter.put('/auth/update-category/:slug', requireAuth, requireAdmin, upload.single("image"), authController.updateCategory)

// DELETE /api/auth/delete-category/slug

authRouter.delete('/auth/delete-category/:slug', requireAuth, requireAdmin, authController.deleteCategory)

// POST /api/auth/create-product

authRouter.post('/auth/create-product', requireAuth, requireAdmin, upload.array("image", 10), authController.createProduct)

authRouter.post('/auth/import-products', requireAuth, requireAdmin, upload.single("file"), authController.importProducts)

// GET /api/auth/get-products

authRouter.get('/auth/get-products', authController.getProducts)

// DELETE /api/auth/delete-product/slug

authRouter.delete('/auth/delete-product/:slug', requireAuth, requireAdmin, authController.deleteProduct)

// GET /api/auth/get-product/slug

authRouter.get('/auth/get-product/:slug', authController.getProductBySlug)

// PUT /api/auth/update-product/slug

authRouter.put('/auth/update-product/:slug', requireAuth, requireAdmin, upload.array("image", 10), authController.updateProductBySlug)

authRouter.get('/auth/get-product/:slug/comments', authController.getProductComments)

authRouter.get('/auth/get-product/:slug/review-eligibility', requireAuth, authController.getProductReviewEligibility)

authRouter.post('/auth/get-product/:slug/comments', requireAuth, upload.array("images", 4), authController.createProductComment)

// POST /api/cart-sync

authRouter.post('/cart-sync', authController.cartSync)

// GET /api/get-cart

authRouter.get('/get-cart', authController.getCart)

// POST /api/create-cart

authRouter.post('/create-cart', authController.createCart)

// DELETE /api/remove-cart

authRouter.delete('/remove-cart', authController.removeCart)

// PUT /api/update-cart

authRouter.put('/update-cart', authController.updateCart)

// POST /api/checkout-session

authRouter.post('/checkout-session', authController.checkoutSession)

// POST /api/verify-payment

authRouter.post('/verify-payment', authController.verifyPayment)

// GET /api/get-orders

authRouter.get('/get-orders', authController.getOrders)

// POST /api/orders-chart

authRouter.post('/orders-chart', requireAuth, requireAdmin, authController.ordersChart)

export default authRouter;