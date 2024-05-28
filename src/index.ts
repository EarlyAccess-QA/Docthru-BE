import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.post("/users", async (req, res) => {
    const { nickName, email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email: email },
    });
    if (user)
        return res.status(400).json({
            message: "이미 존재하는 이메일입니다.",
        });

    const result = await prisma.user.create({
        data: {
            nickName,
            email,
            password,
        },
    });
    res.json(result);
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email: email, password: password },
    });
    if (!user) return res.status(400).json({ message: "유저가 없습니다." });
    res.json(user); // 추가 구현
});

app.post("/logout", async (req, res) => {
    res.json("logout"); // 추가 구현
});

// router.post('/logout', (req, res) => {
//     req.logout();
//     req.session.destroy();
//     res.send('logout ok');
//   });

const server = app.listen(3000, () =>
    console.log(`🚀 Server ready at: http://localhost:3000`)
);
