import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { Secret } from "jsonwebtoken";
import auth from "./authMiddleware";
import challenges from "./challenges";
import works from "./works";
import users from "./users";

const prisma = new PrismaClient();
const app = express();
const allowedOrigins = ["http://localhost:3000"];
const options: cors.CorsOptions = {
    origin: allowedOrigins,
};
app.use(cors(options));
app.use(express.json());
const key = process.env.SECRET_KEY as Secret;

app.post("/users", async (req, res) => {
    const { nickName, email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });
    const nickname = await prisma.user.findUnique({
        where: { nickName },
    });
    if (user)
        return res.status(400).json({
            message: "wrong email",
        });
    else if (nickname)
        return res.status(400).json({
            message: "wrong nickname",
        });

    await prisma.user.create({
        data: {
            nickName,
            email,
            password,
        },
    });
    return res.status(200).json("success");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email, password },
    });
    if (!user) return res.status(400).json({ message: "no user" });
    const token = jwt.sign({ type: "JWT", id: user.id, role: user.role }, key, {
        expiresIn: "60m",
        issuer: "accept",
    });
    return res
        .status(200)
        .json({
            accessToken: token,
            userRole: user.role,
            userGrade: user.grade,
            nickName: user.nickName,
        });
});

app.post("/logout", auth, async (req, res) => {
    return res.json("logout"); // 추가 구현 cookie 활용해서 아니 해더
});

app.use("/challenges", challenges);
app.use("/works", auth, works);
app.use("/users/me/challenges", auth, users);

const server = app.listen(3000, () => {
    console.log(`🚀 Server ready at: http://localhost:3000`);
});
