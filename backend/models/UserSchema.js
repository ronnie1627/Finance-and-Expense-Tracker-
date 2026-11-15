import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique : true,
        validate : validator.isEmail,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength : [6, "Password Must Be Atleast 6 characters"],
    },
    isAvatarImageSet: {
        type: Boolean,
        default: false,
    },
    avatarImage: {
        type: String,
        default: ""
    },
    transactions: {
        type: [],
    },

    // NEW: monthly budget saved per user
    monthlyBudget: {
        type: Number,
        default: 0,
        min: 0,
    },

    // NEW: forgot-password fields
    resetPasswordToken: {
        type: String,
        default: "",
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },

    createdAt: {
        type:Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

export default  User;