import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { requireAuth } from "../middleware/auth";
import { supabaseAdmin } from "../supabase";

export const authRouter = Router();

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.auth });
});

authRouter.post("/verify", requireAuth, (req, res) => {
  res.json({ valid: true, user: req.auth });
});

authRouter.post("/password-reset", async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const redirectTo = `${config.frontendUrl}/reset-password`;
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "Password reset email sent" });
  } catch (error) {
    return next(error);
  }
});
