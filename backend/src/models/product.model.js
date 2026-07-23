import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    'name': {
        type: String,
        required: [true, "Product Name is a required field."]
    },
    'imageUrl': {
        type: String,
        required: [true, "imageUrl is a required field."]
    },
    'imagePublicId': {
        type: String,
        required: [true, "imagePublicId is a required field."]
    },
    'price': {
        type: Number,
        required: [true, "Price is a required field."]
    },
    'author': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, "Author is a required field."]
    },
    'stock': {
        type: Number,
        required: [true, "Stock is a required field."]
    },
    'category': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: [true, "Category is a required field."]
    }

}, { timestamps: true })

const productModel = mongoose.model('products', productSchema);

export default productModel;