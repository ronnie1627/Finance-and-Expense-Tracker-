import express from 'express';
import {
    loginControllers,
    registerControllers,
    setAvatarController,
    getBudgetController,
    setBudgetController,
    forgotPasswordController,
    resetPasswordController,
} from '../controllers/userController.js';

const router = express.Router();

router.route("/register").post(registerControllers);

router.route("/login").post(loginControllers);

router.route("/setAvatar/:id").post(setAvatarController);

// NEW
router.route("/budget/:id").get(getBudgetController).post(setBudgetController);
router.route("/forgotPassword").post(forgotPasswordController);
router.route("/resetPassword/:token").post(resetPasswordController);

export default router;