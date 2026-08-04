import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cloudinary, { envConfig } from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { generateOtp, getHtmlFromOtp } from "../utils/utils.js";
import sendEmail from "../services/email.service.js";
import otpModel from "../models/otp.model.js";
import categoryModel from "../models/category.model.js";
import productModel from "../models/product.model.js";
import slugify from "slugify";
import cartModel from "../models/cart.model.js";
import Stripe from "stripe";
import orderModel from "../models/order.model.js";

export async function register(req, res) {

    const { firstName, lastName, username, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?])\S{8,}$/;

    //Field Validation
    if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ message: "Please enter correct credentials." })
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter correct credentials." })
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message:
                `Password should have at least 8 characters.
                Password should have at least one lowercase letter.
                Password should have at least one uppercase letter.
                Password should have at least one number.
                Password should have at least one special character.
                No spaces or other whitespace characters (spaces, tabs, newlines).`

        })
    }

    const firstNameValidated = firstName.trim()
    const lastNameValidated = lastName.trim()
    const usernameValidated = username.trim().toLowerCase()
    const emailValidated = email.trim().toLowerCase()

    //Existing User Validation
    const user = await userModel.findOne({
        $or: [{ email: emailValidated }, { username: usernameValidated }]
    }).select("_id").lean();

    if (user) {
        return res.status(400).json({
            message: "Username or Email already exists."
        })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const newUser = await userModel.create({
        firstName: firstNameValidated,
        lastName: lastNameValidated,
        username: usernameValidated,
        email: emailValidated,
        password: hashedPassword
    })

    const otp = generateOtp();
    const html = getHtmlFromOtp(otp);
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

    await otpModel.create({
        email: newUser.email,
        user: newUser._id,
        otpHash: otpHash
    })

    try {
        await sendEmail(
            newUser.email,
            "Verify Your Email Address - E Shop",
            `Your OTP Code is ${otp}`,
            html
        );

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email error:", error);
    }

    res.status(201).json({
        message: "User registered successfully.",
        user: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt,
            verified: newUser.verified
        }
    })
}

export async function login(req, res) {
    const { email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const emailValidated = email.trim().toLowerCase();

    if (!email || !password || !emailRegex.test(emailValidated)) {
        return res.status(400).json({ message: "Please enter correct credentials." })
    }

    const user = await userModel.findOne({ email: emailValidated, password: hashedPassword });

    if (!user) {
        return res.status(404).json({ message: "No User found with this credentials." })
    }

    if (!user.verified) {
        return res.status(400).json({ message: "Email is unverified." })
    }

    const refreshToken = jwt.sign(
        { id: user._id },
        envConfig.JWT_SECRET,
        { expiresIn: '7d' }
    )

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash: refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    })

    const accessToken = jwt.sign(
        { id: user._id },
        envConfig.JWT_SECRET,
        { expiresIn: '10m' }
    )

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 60 * 1000 //10 minutes
    })

    res.status(200).json({
        message: "User logged In successfully.",
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin,
            createdAt: user.createdAt
        }
    })
}

export async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;

    if (!refreshToken) {
        return res.status(400).json({ message: "Invalid Token." })
    }

    if (!accessToken) {
        return res.status(400).json({ message: "Invalid Token." })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const decoded = jwt.verify(refreshToken, envConfig.JWT_SECRET);

    const session = await sessionModel.updateMany({
        user: decoded.id,
        refreshTokenHash: refreshTokenHash,
        isRevoked: false
    },
        {
            isRevoked: true
        })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    })

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 60 * 1000 //10 minutes
    })

    res.status(200).json({ message: "User logged out successfully." })
}

export async function logoutAll(req, res) {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;

    if (!refreshToken) {
        return res.status(400).json({ message: "Invalid Token." })
    }

    if (!accessToken) {
        return res.status(400).json({ message: "Invalid Token." })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const decoded = jwt.verify(refreshToken, envConfig.JWT_SECRET);

    const session = await sessionModel.updateMany({
        user: decoded.id,
        isRevoked: false
    },
        {
            isRevoked: true
        })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    })

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 60 * 1000 //10 minutes
    })

    res.status(200).json({ message: "User logged out successfully from all devices." })
}

export async function UpdateRefreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        return res.status(404).json({ message: "Invalid Refresh Token." })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const decoded = jwt.verify(refreshToken, envConfig.JWT_SECRET);

    const session = await sessionModel.findOne({
        refreshTokenHash: refreshTokenHash,
        isRevoked: false
    })

    if (!session) {
        return res.status(404).json({ message: "Invalid Session." })
    }

    const newRefreshToken = jwt.sign(
        { id: decoded.id },
        envConfig.JWT_SECRET,
        { expiresIn: '7d' }
    )

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    })

    const accessToken = jwt.sign(
        { id: decoded.id },
        envConfig.JWT_SECRET,
        { expiresIn: '10m' }
    )

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 60 * 1000 //10 minutes
    })

    res.status(200).json({
        message: "Update Refresh token Successful."
    })
}

export async function getMe(req, res) {

    const accessToken = req.cookies.accessToken

    if (!accessToken) {
        return res.status(401).json({ message: "Invalid Access Token." })
    }

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, envConfig.JWT_SECRET);
            const user = await userModel.findById(decoded.id).lean().select("firstName lastName username email is_admin createdAt");

            res.status(200).json({
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    is_admin: user.is_admin,
                    createdAt: user.createdAt
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

export async function getUsers(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Invalid Access Token." });
    }

    try {
        const decoded = jwt.verify(accessToken, envConfig.JWT_SECRET);
        const user = await userModel.findById(decoded.id).lean();

        if (!user || !user.is_admin) {
            return res.status(403).json({ message: "Access denied. Only admins can perform this action." });
        }

        const users = await userModel.find().lean().select("firstName lastName username email is_admin createdAt");
        res.status(200).json({ users });
    } catch (error) {
        return res.status(401).json({ message: "Invalid Access Token." });
    }
}

export async function deleteUser(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Invalid Access Token." });
    }

    try {
        const decoded = jwt.verify(accessToken, envConfig.JWT_SECRET);
        const user = await userModel.findById(decoded.id).lean();

        if (!user || !user.is_admin) {
            return res.status(403).json({ message: "Access denied. Only admins can perform this action." });
        }

        const { userId } = req.params;
        const deletedUser = await userModel.findByIdAndDelete(userId).lean();

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        return res.status(401).json({ message: "Invalid Access Token." });
    }
}

export async function verifyEmail(req, res) {
    const { otp, email } = req.body;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await otpModel.findOne({ email: email, otpHash: otpHash })

    if (!otpDoc) {
        return res.status(400).json({
            message: "Invalid otp."
        })
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user, { verified: true }, { new: true })

    await otpModel.deleteMany({ user: otpDoc.user })

    return res.status(200).json({
        message: "User verified successfully.",
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    })
}

export async function createCategory(req, res) {

    const accessToken = req.cookies.accessToken

    if (!accessToken) {
        return res.status(401).json({ message: "Invalid Access Token." })
    }

    if (accessToken) {
        try {
            const { name } = req.body;
            const slug = slugify(name, {
                lower: true,
                strict: true,
                trim: true
            })
            const file = req.file;

            if (!name) {
                return res.status(400).json({
                    message: "Category name cannot be empty."
                })
            }

            const existingCategory = await categoryModel.findOne({ slug: slug }).select("_id").lean();

            if (existingCategory) {
                return res.status(400).json({
                    message: 'Category Name should be unique'
                })
            }

            const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`

            const result = await cloudinary.uploader.upload(base64, { folder: 'categories' })

            const category = await categoryModel.create({
                name: name,
                slug: slug,
                imageUrl: result.secure_url,
                imagePublicId: result.public_id
            })

            return res.status(201).json(category)
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json(
                    { message: 'Token expired.' }
                )
            } else {
                return res.status(401).json(
                    { message: 'Invalid Token' }
                )
            }
        }
    }


}

export async function getCategory(req, res) {
    try {
        const category = await categoryModel.find().lean()
        return res.status(200).json(category)
    } catch (error) {
        console.log(error)
    }
}

export async function getCategoryBySlug(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: 'Invalid access token'
        })
    }

    if (accessToken) {
        try {
            const { slug } = req.params;

            const category = await categoryModel.findOne({ slug: slug }).lean()

            if (!category) {
                return res.status(404).json({
                    message: 'Category not found.'
                })
            }
            return res.status(200).json(category)
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: 'Token Expired.'
                })
            } else {
                return res.status(401).json({
                    message: 'Invalid Token.'
                })
            }
        }
    }
}

export async function updateCategory(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Invalid Access Token." });
    }

    try {
        const { slug } = req.params;
        const { name } = req.body;
        const file = req.file;

        const category = await categoryModel.findOne({ slug: slug })

        if (!category) {
            return res.status(404).json({
                message: "Category not found.",
            });
        }

        // Update name
        if (name) {
            category.name = name;
            const slug = slugify(name, {
                lower: true,
                strict: true,
                trim: true
            })
            category.slug = slug;
        }

        // Update image only if a new image was uploaded
        if (file) {
            // Delete old image
            await cloudinary.uploader.destroy(category.imagePublicId);

            // Upload new image
            const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

            const result = await cloudinary.uploader.upload(base64, {
                folder: "categories",
            });

            category.imageUrl = result.secure_url;
            category.imagePublicId = result.public_id;
        }

        await category.save();

        return res.status(200).json(category);

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: 'Expired Token.' });
        } else {
            return res.status(401).json({ message: 'Invalid Token.' });
        }
    }
}

export async function deleteCategory(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: 'Invalid Token.'
        })
    }

    if (accessToken) {
        try {
            const { slug } = req.params;

            if (!slug) {
                return res.status(400).json({
                    message: 'Invalid id.'
                })
            }

            if (slug) {
                await categoryModel.findOneAndDelete({ slug: slug })
                return res.status(200).json({
                    message: 'Category deleted successfully.'
                })
            }
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: 'Token Expired.'
                })
            } else {
                return res.status(401).json({
                    message: 'Invalid Token.'
                })
            }
        }
    }


}

export async function createProduct(req, res) {

    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: 'Invalid Token.'
        })
    }

    if (accessToken) {
        try {
            const { name, price, stock, category } = req.body;
            const file = req.file;
            const user = jwt.verify(accessToken, envConfig.JWT_SECRET)

            if (!name || !price || !stock || !category || !file) {
                return res.status(400).json({
                    message: 'Please enter all fields.'
                })
            }

            try {
                const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
                const result = await cloudinary.uploader.upload(base64, { folder: "products" })
                const slug = slugify(name, {
                    lower: true,
                    strict: true,
                    trim: true
                })

                const product = await productModel.create({
                    name: name,
                    slug: slug,
                    imageUrl: result.secure_url,
                    imagePublicId: result.public_id,
                    price: price,
                    author: user.id,
                    stock: stock,
                    category: category
                })

                const getProduct = await productModel.findById(product._id).populate("author", "firstName lastName").populate("category", "name").lean()

                return res.status(201).json(getProduct)
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    message: 'Something went wrong.'
                })
            }

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: 'Token Expired.'
                })
            } else {
                return res.status(401).json({
                    message: 'Invalid Token.'
                })
            }
        }
    }

}

export async function getProducts(req, res) {
    const { category, sort, search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    try {
        const filter = {};

        if (category) {
            const categoryDoc = await categoryModel.findOne({ slug: category }).select("_id").lean();

            if (!categoryDoc) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found.",
                });
            }

            filter.category = categoryDoc._id;
        }

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i",
            };
        }

        const skip = (page - 1) * limit;

        let query = productModel.find(filter);

        if (sort === "asc") {
            query = query.sort({ price: 1 });
        }

        if (sort === "desc") {
            query = query.sort({ price: -1 });
        }

        const totalProducts = await productModel.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await query.lean()
            .skip(skip)
            .limit(limit)
            .populate("author", "firstName lastName")
            .populate("category", "name slug");

        return res.status(200).json({
            success: true,
            products,
            totalProducts,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function getProductBySlug(req, res) {
    const { slug } = req.params;

    try {
        const product = await productModel.findOne({ slug: slug }).populate("author", "firstName lastName").populate("category", "name slug").lean()
        return res.status(200).json(product)
    } catch (error) {
        console.log(error)
    }
}

export async function deleteProduct(req, res) {

    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: 'Invalid Token.'
        })
    }

    try {

        const { slug } = req.params

        await productModel.findOneAndDelete({ slug: slug })
        return res.status(200).json({
            message: "Product deleted successfully."
        })
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token Expired."
            })
        } else {
            return res.status(401).json({
                message: 'Invalid Token.'
            })
        }
    }
}

export async function updateProductBySlug(req, res) {

    const { name, price, stock, category } = req.body;
    const file = req.file;

    const newSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true
    })
    const { slug } = req.params;

    const product = await productModel.findOne({ slug: slug })

    if (name) {
        product.name = name;
        product.slug = newSlug;
    }
    if (price) {
        product.price = price;
    }
    if (stock) {
        product.stock = stock;
    }

    if (category) {
        const existingCategory = await categoryModel.findOne({
            slug: category,
        });

        product.category = existingCategory._id;
    }

    if (file) {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
        await cloudinary.uploader.destroy(product.imagePublicId)

        const result = await cloudinary.uploader.upload(base64, { folder: 'products' })

        product.imageUrl = result.secure_url;
        product.imagePublicId = result.public_id;
    }

    await product.save()

    const updatedProduct = await productModel
        .findById(product._id)
        .populate("author", "firstName lastName")
        .populate("category", "name slug").lean();

    return res.status(201).json(updatedProduct)
}

export async function cartSync(req, res) {
    const accessToken = req.cookies.accessToken;
    const { items } = req.body

    const user = jwt.verify(accessToken, envConfig.JWT_SECRET)

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No cart items found.",
            });
        }
        for (const item of items) {
            const existingCart = await cartModel.findOne({
                product: item.productId,
                user: user.id,
            })

            if (existingCart) {
                existingCart.quantity += item.quantity;
                await existingCart.save();
            } else {
                await cartModel.create({
                    user: user.id,
                    product: item.productId,
                    quantity: item.quantity,
                });
            }
        }
        res.json({
            success: true,
            message: "Cart synced successfully",
        })
    } catch (error) {
        console.error(error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: 'Token Expired.'
            })
        } else {
            return res.status(401).json({
                message: 'Invalid Token.'
            })
        }
    }
}

export async function getCart(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: "Invalid token.",
        });
    }

    if (accessToken) {
        try {
            const user = jwt.verify(accessToken, envConfig.JWT_SECRET)

            const cart = await cartModel
                .find({ user: user.id })
                .populate({
                    path: "product",
                    select: "name imageUrl price stock category",
                    populate: {
                        path: "category",
                        select: "name slug",
                    },
                })
                .lean();

            if (cart.length > 0) {
                return res.status(200).json(cart)
            }
            return res.status(200).json([]);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: 'Token Expired.'
                })
            } else {
                return res.status(401).json({
                    message: 'Invalid token.'
                })
            }
        }
    }
    return res.status(401).json({
        message: 'Invalid token.'
    })
}

export async function createCart(req, res) {

    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: "Invalid Access Token."
        })
    }

    if (accessToken) {
        try {
            const user = jwt.verify(accessToken, envConfig.JWT_SECRET)
            const { productId, quantity } = req.body;
            const existingCartItem = await cartModel.findOne({ product: productId, user: user.id })

            if (existingCartItem) {
                existingCartItem.quantity += quantity
                await existingCartItem.save()
                return res.status(201).json(existingCartItem)
            }

            const cart = await cartModel.create({
                product: productId,
                user: user.id,
                quantity: quantity
            })

            return res.status(201).json(cart)

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Access Token Expired."
                })
            } else {
                return res.status(401).json({
                    message: "Invalid Access Token."
                })
            }
        }
    }
}

export async function removeCart(req, res) {

    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: "Invalid Access Token."
        })
    }
    try {
        const user = jwt.verify(accessToken, envConfig.JWT_SECRET)
        const { id, product } = req.body;
        await cartModel.findOneAndDelete({ _id: id, product: product, user: user.id })
        return res.status(200).json({
            message: "Item deleted successfully."
        })

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Access Token Expired."
            })
        } else {
            return res.status(401).json({
                message: "Invalid Access Token."
            })
        }
    }
}

export async function updateCart(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: "Invalid Token."
        })
    }

    try {
        const { id, product, action } = req.body;
        const user = jwt.verify(accessToken, envConfig.JWT_SECRET);

        const existingItem = await cartModel.findOne({ _id: id, product: product, user: user.id })

        if (action === "decrease" && existingItem.quantity === 1) {
            await cartModel.findOneAndDelete({ _id: id, product: product, user: user.id })
            return res.status(200).json({
                message: "Item removed."
            })
        }

        if (action === "increase") {
            existingItem.quantity += 1;
        }
        if (action === "decrease") {
            existingItem.quantity -= 1;
        }
        await existingItem.save()

        return res.status(200).json(existingItem)
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token Expired."
            })
        } else {
            return res.status(401).json({
                message: "Invalid Token."
            })
        }
    }
}

export async function checkoutSession(req, res) {

    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: "Invalid Tokenss."
        })
    }

    try {
        const user = jwt.verify(accessToken, envConfig.JWT_SECRET)
        const userCart = await cartModel.find({ user: user.id }).populate("user", "firstName lastName email username").populate("product", "name imageUrl price stock")

        const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: userCart.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.product.name,
                        images: [item.product.imageUrl]
                    },
                    unit_amount: Math.round(item.product.price * 100)
                },
                quantity: item.quantity
            })),
            mode: "payment",
            success_url: `${envConfig.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${envConfig.CLIENT_URL}/checkout?payment=cancelled`
        })
        return res.json({ url: session.url })

    } catch (error) {
        console.log(error)
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token Expired."
            })
        } else {
            return res.status(401).json({
                message: "Invalid Token."
            })
        }
    }
}

export async function verifyPayment(req, res) {
    const session_id = req.query.session_id;
    const accessToken = req.cookies.accessToken;
    const {
        firstName,
        lastName,
        email,
        phoneNo,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        orderNote,
    } = req.body;

    if (!accessToken) {
        return res.status(401).json({
            message: "Invalid Token.",
        });
    }

    let user;

    try {
        user = jwt.verify(accessToken, envConfig.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or Expired Token.",
        });
    }

    try {
        const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (
            session.status !== "complete" ||
            session.payment_status !== "paid"
        ) {
            return res.status(400).json({
                message: "Payment has not been completed.",
            });
        }

        const existingOrder = await orderModel.findOne({
            stripeSessionId: session.id,
        });

        if (existingOrder) {
            return res.json(existingOrder);
        }

        const userCart = await cartModel
            .find({ user: user.id })
            .populate("product", "name imageUrl price stock");

        const order = await orderModel.create({
            user: user.id,
            orderNumber: `ORD-${Date.now()}`,
            stripeSessionId: session.id,

            items: userCart.map((item) => ({
                product: item.product._id,
                name: item.product.name,
                imageUrl: item.product.imageUrl,
                price: item.product.price,
                quantity: item.quantity,
            })),

            shippingAddress: {
                fullName: `${firstName} ${lastName}`,
                email,
                phoneNo,
                address: `${addressLine1} ${addressLine2}`.trim(),
                city,
                state,
                country,
                orderNote,
            },

            payment: {
                paymentIntentId: session.payment_intent,
                status: "paid",
            },

            total: session.amount_total / 100,
            orderStatus: "processing",
        });

        await Promise.all(
            userCart.map(async (item) => {
                const updated = await productModel.findOneAndUpdate(
                    {
                        _id: item.product._id,
                        stock: { $gte: item.quantity },
                    },
                    {
                        $inc: { stock: -item.quantity },
                    },
                    { new: true }
                );

                if (!updated) {
                    throw new Error(`${item.product.name} is out of stock.`);
                }
            })
        );

        await cartModel.deleteMany({
            user: user.id,
        });

        return res.status(201).json(order);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong.",
        });
    }
}

export async function getOrders(req, res) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            message: "Invalid Token."
        })
    }

    try {
        const user = jwt.verify(accessToken, envConfig.JWT_SECRET)
        const orders = await orderModel.find({ user: user.id }).populate("user", "firstName lastName email username").lean() || []

        return res.status(200).json(orders)
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token Expired."
            })
        } else {
            return res.status(401).json({
                message: "Invalid Token."
            })
        }
    }
}

export async function ordersChart(req, res) {

    const { period } = req.body;

    const end = new Date();
    const start = new Date();

    if (period === "week") {
        start.setDate(end.getDate() - 6);
    }

    if (period === "month") {
        start.setDate(end.getDate() - 29);
    }

    try {
        const orders = await orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: start,
                        $lte: end,
                    },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $group: {
                    _id: "$items.name",
                    sold: {
                        $sum: "$items.quantity",
                    },
                },
            },
            {
                $sort: {
                    sold: -1,
                },
            },
            {
                $limit: 5,
            },
            {
                $project: {
                    _id: 0,
                    product: "$_id",
                    sold: 1,
                },
            },

        ])
        return res.json(orders);
    } catch (error) {
        res.json(error.message)
    }

}