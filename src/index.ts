import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import router from "./auth";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(router);

app.post("/", async (req, res) => {
    const { nickName, email, password } = req.body;

    // const result = await prisma.user.create({
    //     data: {
    //         nickName,
    //         email,
    //         password,
    //     },
    // });
    console.log(req.body);
    res.json(req.body);
});

const server = app.listen(3000, () =>
    console.log(`
🚀 Server ready at: http://localhost:3000`)
);
