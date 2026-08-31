import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    'user': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    'title': {
        type: String,
        required: [true, "Title is a required field."]
    },
    'body': {
        type: String,
        required: [true, "Body is a required field."]
    },
    'type': {
        type: String,
        enum: ['product', 'category', 'promotion', 'order'],
        required: [true, "Type is a required field."]
    },
    'link': {
        type: String,
        required: [true, "Link is a required field."]
    },
    'readBy': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }]
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

const notificationModel = mongoose.model('notifications', notificationSchema);

export default notificationModel;
