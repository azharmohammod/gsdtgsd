import { Request, Response, NextFunction } from "express";

export function requireMemberAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.memberId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
}
