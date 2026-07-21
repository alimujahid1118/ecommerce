import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    'name': {
        type: String,
        required: [true, "Category Name is a required field."],
        unique: [true, "Category Name must be unique."]
    },
    'imageUrl': {
        type: String,
        required: [true, "Category Name is a required field."]
    },
    'imagePublicId': {
        type: String,
        required: [true, "Category Name is a required field."],
        unique: [true, "Category Name must be unique."]
    }
}, { timestamps: true })

const categoryModel = mongoose.model('categories', categorySchema);

export default categoryModel;