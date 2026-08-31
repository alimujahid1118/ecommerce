import express from "express";
import * as tokenController from "../controllers/token.controller.js";

const tokenRouter = express.Router();

// POST /api/tokens/register
tokenRouter.post('/tokens/register', tokenController.registerToken);

// DELETE /api/tokens/unregister
tokenRouter.delete('/tokens/unregister', tokenController.unregisterToken);

export default tokenRouter;
