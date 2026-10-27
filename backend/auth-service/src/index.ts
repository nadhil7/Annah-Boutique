import express from "express";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { randomInt, randomUUID } from "node:crypto";
import { z } from "zod";
import type { Request, Response } from "express";
import { pool, ApiError, fail, health, ok, requireAdmin } from "@annah/shared";

const app = express();
app.use(express.json({ limit: "32kb" }), cookieParser());
app.get("/health", health);

const otpEnabled = () => process.env.ADMIN_OTP_ENABLED === "true";
const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());
const passwordSchema = z.string().min(12, "Password must be at least 12 characters").max(200);
const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
const passwordChangeSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).superRefine((input, context) => {
  if (input.newPassword !== input.confirmPassword) context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
  if (input.newPassword === input.currentPassword) context.addIssue({ code: "custom", path: ["newPassword"], message: "New password must be different" });
});

type AdminRequest = Request & { adminId?: string };

function trustedDays() {
  const hours = Number(process.env.TRUSTED_DEVICE_HOURS || 24);
  return Number.isFinite(hours) && hours > 0 ? hours / 24 : 1;
}

async function signSession(adminId: string, sessionId: string, days: number) {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuer("annah-boutique")
    .setIssuedAt()
    .setExpirationTime(`${Math.max(1, Math.round(days * 24))}h`)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

async function createSession(adminId: string, res: Response, db: { query: (...args: any[]) => Promise<any> } = pool) {
  const sid = randomUUID();
  const days = trustedDays();
  const token = await signSession(adminId, sid, days);
  await db.query("INSERT INTO admin_sessions(id,admin_id,expires_at,trusted_until) VALUES($1,$2,now()+($3::text||' days')::interval,now()+($3::text||' days')::interval)", [sid, adminId, days]);
  res.cookie("annah_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: Math.round(days * 86400000) });
  return { authenticated: true, trustedUntil: new Date(Date.now() + days * 86400000).toISOString() };
}

app.post("/auth/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await pool.query("SELECT id,password_hash FROM admins WHERE lower(email)=lower($1)", [input.email]);
    const account = result.rows[0] as { id: string; password_hash: string | null } | undefined;
    if (!account?.password_hash || !(await bcrypt.compare(input.password, account.password_hash))) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    ok(await createSession(account.id, res), res);
  } catch (error) { next(error); }
});

app.post("/auth/request-otp", async (req, res, next) => {
  try {
    if (!otpEnabled()) throw new ApiError(404, "NOT_FOUND", "Not found");
    const email = emailSchema.parse(req.body.email);
    const admin = await pool.query("SELECT id,email FROM admins WHERE lower(email)=lower($1)", [email]);
    if (!admin.rowCount) return res.json({ success: true, data: { message: "If the email is registered, a code will be sent." } });
    const adminId = admin.rows[0].id;
    const previous = await pool.query("SELECT last_sent_at FROM otp_verifications WHERE admin_id=$1 AND used_at IS NULL ORDER BY last_sent_at DESC LIMIT 1", [adminId]);
    if (previous.rowCount && Date.now() - new Date(previous.rows[0].last_sent_at).getTime() < 60_000) throw new ApiError(429, "OTP_COOLDOWN", "Please wait before requesting another code");
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const otpHash = await bcrypt.hash(code, 12);
    await pool.query("UPDATE otp_verifications SET used_at=now() WHERE admin_id=$1 AND used_at IS NULL", [adminId]);
    await pool.query("INSERT INTO otp_verifications(admin_id,otp_hash,expires_at) VALUES($1,$2,now()+interval '10 minutes')", [adminId, otpHash]);
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
    await transport.sendMail({ from: process.env.SMTP_FROM, to: admin.rows[0].email, subject: "Annah Boutique admin sign-in code", text: `Your sign-in code is ${code}. It expires in 10 minutes.` });
    ok({ message: "If the email is registered, a code will be sent." }, res);
  } catch (error) { next(error); }
});

app.post("/auth/verify-otp", async (req, res, next) => {
  try {
    if (!otpEnabled()) throw new ApiError(404, "NOT_FOUND", "Not found");
    const body = z.object({ email: emailSchema, otp: z.string().regex(/^\d{6}$/) }).parse(req.body);
    const result = await pool.query("SELECT o.id,o.otp_hash,o.attempts,o.expires_at,a.id admin_id FROM otp_verifications o JOIN admins a ON a.id=o.admin_id WHERE lower(a.email)=lower($1) AND o.used_at IS NULL ORDER BY o.last_sent_at DESC LIMIT 1", [body.email]);
    if (!result.rowCount) throw new ApiError(401, "INVALID_OTP", "Invalid or expired code");
    const otp = result.rows[0];
    if (otp.attempts >= 5 || new Date(otp.expires_at) < new Date()) { await pool.query("UPDATE otp_verifications SET used_at=now() WHERE id=$1", [otp.id]); throw new ApiError(401, "INVALID_OTP", "Invalid or expired code"); }
    await pool.query("UPDATE otp_verifications SET attempts=attempts+1 WHERE id=$1", [otp.id]);
    if (!await bcrypt.compare(body.otp, otp.otp_hash)) throw new ApiError(401, "INVALID_OTP", "Invalid or expired code");
    await pool.query("UPDATE otp_verifications SET used_at=now() WHERE id=$1", [otp.id]);
    ok(await createSession(otp.admin_id, res), res);
  } catch (error) { next(error); }
});

app.post("/auth/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.annah_session;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), { issuer: "annah-boutique", algorithms: ["HS256"] });
        if (typeof payload.sid === "string") await pool.query("UPDATE admin_sessions SET revoked_at=now() WHERE id=$1", [payload.sid]);
      } catch { /* Always clear the browser cookie, even if the token is already invalid. */ }
    }
    res.clearCookie("annah_session", { path: "/" });
    ok({ loggedOut: true }, res);
  } catch (error) { next(error); }
});

app.get("/auth/me", requireAdmin, async (req, res, next) => {
  try {
    const adminId = (req as AdminRequest).adminId;
    const result = await pool.query("SELECT id,email,name,phone FROM admins WHERE id=$1", [adminId]);
    if (!result.rowCount) throw new ApiError(404, "ADMIN_NOT_FOUND", "Admin profile not found");
    ok(result.rows[0], res);
  } catch (error) { next(error); }
});

app.post("/auth/password", requireAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const input = passwordChangeSchema.parse(req.body);
    const adminId = (req as AdminRequest).adminId;
    if (!adminId) throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    await client.query("BEGIN");
    const result = await client.query("SELECT password_hash FROM admins WHERE id=$1 FOR UPDATE", [adminId]);
    if (!result.rowCount || !result.rows[0].password_hash || !(await bcrypt.compare(input.currentPassword, result.rows[0].password_hash))) throw new ApiError(400, "INVALID_CURRENT_PASSWORD", "Current password is incorrect");
    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await client.query("UPDATE admins SET password_hash=$2 WHERE id=$1", [adminId, passwordHash]);
    await client.query("UPDATE admin_sessions SET revoked_at=now() WHERE admin_id=$1 AND revoked_at IS NULL", [adminId]);
    const session = await createSession(adminId, res, client);
    await client.query("COMMIT");
    ok({ ...session, passwordChanged: true }, res);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    next(error);
  } finally { client.release(); }
});

app.use(fail);
const server = app.listen(Number(process.env.PORT || 4002), process.env.HOST || '127.0.0.1');
void pool.query("SELECT 1").catch(() => undefined);
process.on("SIGTERM", () => server.close(() => pool.end()));
