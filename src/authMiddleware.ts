import jwt from "jsonwebtoken";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import { Secret } from "jsonwebtoken";

const key = process.env.SECRET_KEY as Secret;

export default function auth(req: Request, res: Response, next: NextFunction) {
    let token = req.headers.authorization?.split("Bearer ")[1] as string;
    try {
        jwt.verify(token, key);
        return next();
    } catch {
        return res.status(400).json("wrong token");
    }
}
