import express from "express";
import * as dashboardController from "../controllers/dashboard.controllers.js";



const dashboardRouter = express.Router();

// GET /api/get-dashboard
//Protected Route
dashboardRouter.get('/get-dashboard', dashboardController.dashboard)

export default dashboardRouter;