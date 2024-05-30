import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { Secret } from "jsonwebtoken";
import auth from "./authMiddleware";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const key = process.env.SECRET_KEY as Secret;

app.post("/users", async (req, res, next) => {
    const { nickName, email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email: email },
    });
    const nickname = await prisma.user.findUnique({
        where: { nickName: nickName },
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
        where: { email: email, password: password },
    });
    if (!user) return res.status(400).json({ message: "no user" });
    let token = jwt.sign(
        { type: "JWT", nickname: user.nickName, role: user.role },
        key,
        {
            expiresIn: "60m",
            issuer: "accept",
        }
    );
    return res.status(200).json(token);
});

app.post("/logout", auth, async (req, res) => {
    res.json("logout"); // 추가 구현 cookie 활용해서
});

// router.post('/logout', (req, res) => {
//     req.logout();
//     req.session.destroy();
//     res.send('logout ok');
//   });

const server = app.listen(3000, () => {
    console.log(`🚀 Server ready at: http://localhost:3000`);
});
