import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import { Secret } from "jsonwebtoken";

const key = process.env.SECRET_KEY as Secret;

export default function auth(req: Request, res: Response, next: NextFunction) {
    let token = req.headers.authorization?.split("Bearer ")[1] as string;
    try {
        const decoded = jwt.verify(token, key);
        const { id, role } = decoded as JwtPayload;
        res.locals.user = { id, role };
        return next();
    } catch {
        return res.status(400).json("wrong token");
    }
}
