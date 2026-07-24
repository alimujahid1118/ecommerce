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
    });

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
            const user = await userModel.findById(decoded.id);

            res.status(200).json({
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
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

export async function verifyEmail(req, res) {
    const { otp, email } = req.body;
    console.log(otp, email)

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    console.log(otpHash)

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

            const existingCategory = await categoryModel.findOne({ slug: slug })

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
        const category = await categoryModel.find()
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

            const category = await categoryModel.findOne({ slug: slug })

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

                const getProduct = await productModel.findById(product._id).populate("author", "firstName lastName").populate("category", "name")

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
    const { category, sort } = req.query;
    try {
        const filter = {};

        if (category) {
            const categoryDoc = await categoryModel.findOne({ slug: category });

            if (!categoryDoc) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found.",
                });
            }

            filter.category = categoryDoc._id;
        }

        let query = productModel.find(filter);

        if (sort === "asc") {
            query = query.sort({ price: 1 });
        }

        if (sort === "desc") {
            query = query.sort({ price: -1 });
        }

        const products = await query.populate("author", "firstName lastName").populate("category", "name")

        return res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function getProductBySlug(req, res) {
    const { slug } = req.params;

    try {
        const product = await productModel.findOne({ slug: slug }).populate("author", "firstName lastName").populate("category", "name slug")
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

        const result = await cloudinary.uploader.upload(base64, { foler: 'products' })

        product.imageUrl = result.secure_url;
        product.imagePublicId = result.public_id;
    }

    await product.save()

    const updatedProduct = await productModel
        .findById(product._id)
        .populate("author", "firstName lastName")
        .populate("category", "name slug");

    return res.status(201).json(updatedProduct)
}