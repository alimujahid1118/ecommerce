import jwt from "jsonwebtoken";
import envConfig from "../config/config.js";
import userModel from "../models/user.model.js"

export async function dashboard(req, res) {
    const accessToken = req.headers.authorization.split(" ")[1]

    if (!accessToken) {
        return res.status(404).json({ message: "Invalid Access Token." })
    }

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, envConfig.JWT_SECRET);
            const user = await userModel.findById(decoded.id);

            res.status(200).json({
                user: {
                    username: user.username,
                    email: user.email
                }
            })
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Access Token Expired."
                })
            }
            return res.status(401).json({
                message: "Invalid Access Token."
            })
        }
    }
}