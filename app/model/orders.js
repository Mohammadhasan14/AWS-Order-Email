import mongoose from "mongoose";

const orderStatusSchema = mongoose.Schema({
    orderId: {
        required: true,
        type: String
    },
    isEmailSent: {
        required: true,
        type: Boolean
    },
}, {
    timestamps: true
});

export const OrderStatus = mongoose.models.OrderStatus || mongoose.model("OrderStatus", orderStatusSchema);
