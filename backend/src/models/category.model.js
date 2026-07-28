import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    'name': {
        type: String,
        required: [true, "Category Name is a required field."],
        unique: true
    },
    'slug': {
        type: String,
        required: [true, "Product Slug is a required field."]
    },
    'imageUrl': {
        type: String,
        required: [true, "Category Name is a required field."]
    },
    'imagePublicId': {
        type: String,
        required: [true, "Category Name is a required field."],
        unique: true
    }
}, { timestamps: true })

const categoryModel = mongoose.model('categories', categorySchema);

export default categoryModel;