import crypto from "crypto";
import User from "../models/UserSchema.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";

// Removes the password and reset fields before sending a user to the browser
const sanitizeUser = (user) => {
    const obj = user.toObject();
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
};

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

export const registerControllers = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }) 
        }

        let user = await User.findOne({email});

        if(user){
            return res.status(409).json({
                success: false,
                message: "User already Exists",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser = await User.create({
            name, 
            email, 
            password: hashedPassword, 
        });

        return res.status(200).json({
            success: true,
            message: "User Created Successfully",
            user: sanitizeUser(newUser)
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const loginControllers = async (req, res, next) => {
    try{
        const { email, password } = req.body;

        if (!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }); 
        }
    
        const user = await User.findOne({ email });
    
        if (!user){
            return res.status(401).json({
                success: false,
                message: "User not found",
            }); 
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch){
            return res.status(401).json({
                success: false,
                message: "Incorrect Email or Password",
            }); 
        }

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            user: sanitizeUser(user),
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const setAvatarController = async (req, res, next)=> {
    try{
        const userId = req.params.id;
        const imageData = req.body.image;
      
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage: imageData,
        },
        { new: true });

        return res.status(200).json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
          });
    }catch(err){
        next(err);
    }
}

export const allUsers = async (req, res, next) => {
    try{
        const user = await User.find({_id: {$ne: req.params.id}}).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);

        return res.json(user);
    }
    catch(err){
        next(err);
    }
}

// ===== NEW: monthly budget =====

export const getBudgetController = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("monthlyBudget");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            budget: user.monthlyBudget || 0,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const setBudgetController = async (req, res) => {
    try {
        const budget = Number(req.body.budget);

        if (!Number.isFinite(budget) || budget < 0) {
            return res.status(400).json({
                success: false,
                message: "Budget must be a positive number",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { monthlyBudget: budget },
            { new: true }
        ).select("monthlyBudget");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            budget: user.monthlyBudget,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ===== NEW: forgot / reset password =====

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email",
            });
        }

        const user = await User.findOne({ email });

        // Same reply whether or not the email exists, so nobody can probe for accounts
        if (user) {
            const token = crypto.randomBytes(32).toString("hex");

            user.resetPasswordToken = hashToken(token);
            user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
            await user.save({ validateBeforeSave: false });

            const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
            const link = `${clientUrl}/resetPassword/${token}`;

            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                text: `Hi ${user.name},\n\nOpen this link to set a new password (valid for 15 minutes):\n${link}\n\nIf you did not ask for this, ignore this email.`,
                html: `<p>Hi ${user.name},</p><p>Click the link below to set a new password (valid for 15 minutes):</p><p><a href="${link}">${link}</a></p><p>If you did not ask for this, ignore this email.</p>`,
            });
        }

        return res.status(200).json({
            success: true,
            message: "If that email is registered, a reset link has been sent.",
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const resetPasswordController = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const user = await User.findOne({
            resetPasswordToken: hashToken(req.params.token),
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or has expired",
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = "";
        user.resetPasswordExpires = null;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: "Password updated. You can log in now.",
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
