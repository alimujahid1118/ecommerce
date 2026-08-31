import express from "express";
import * as notificationController from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

// POST /api/notifications/promotions
notificationRouter.post('/notifications/promotions', notificationController.createPromotion);

// GET /api/notifications/promotions
notificationRouter.get('/notifications/promotions', notificationController.getPromotions);

export default notificationRouter;
