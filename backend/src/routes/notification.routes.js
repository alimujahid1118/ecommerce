import express from "express";
import * as notificationController from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

// POST /api/notifications/promotions
notificationRouter.post('/notifications/promotions', notificationController.createPromotion);

// GET /api/notifications/promotions
notificationRouter.get('/notifications/promotions', notificationController.getPromotions);

// GET /api/notifications
notificationRouter.get('/notifications', notificationController.getNotifications);

// PATCH /api/notifications/read-all
notificationRouter.patch('/notifications/read-all', notificationController.markAllNotificationsRead);

// PATCH /api/notifications/:id/read
notificationRouter.patch('/notifications/:id/read', notificationController.markNotificationRead);

export default notificationRouter;
