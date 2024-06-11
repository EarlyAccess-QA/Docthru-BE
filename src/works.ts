import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";

const works = express.Router();
const prisma = new PrismaClient();

works.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    const work = await prisma.work.findUnique({
        where: { id },
    });
    if (!work) return res.status(400).json("wrong id");

    return res.json(work);
});

works.post("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const userId = Number(res.locals.user.id);
    const { description, status } = req.body;

    const challenge = prisma.challenge.findUnique({
        where: { id },
    });
    if (!challenge) return res.status(400).json("wrong id");

    const userCheck = await prisma.work.findMany({
        where: { challengeId: id, userId },
    });
    if (userCheck) return res.status(400).json("already work");

    try {
        const work = await prisma.work.create({
            data: {
                userId,
                challengeId: id,
                description,
                status,
            },
        });
        return res.json(work);
    } catch {
        return res.status(400).json("error");
    }
});

works.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const userId = Number(res.locals.user.id);
    const { description, status } = req.body;

    try {
        const work = await prisma.work.update({
            where: { id, userId },
            data: {
                description,
                status,
            },
        });
        return res.json(work);
    } catch {
        return res.status(400).json("wrong id");
    }
});

works.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        await prisma.work.delete({
            where: { id },
        });
    } catch {
        return res.status(400).json("wrong id");
    }

    return res.json("success");
});

works.post("/:id/likes", async (req, res) => {
    const id = Number(req.params.id);
    const userId = Number(res.locals.user.id);

    const likeCheck = await prisma.like.findMany({
        where: { userId, workId: id },
    });
    if (likeCheck[0]) return res.status(400).json("already like");
    try {
        const like = await prisma.like.create({
            data: { userId, workId: id },
        });
        return res.json(like);
    } catch {
        return res.status(400).json("error");
    }
});

// works.post("/:id/feedback", async (req, res) => {
//     const id = Number(req.params.id);
//     const userId = Number(res.locals.user.id);
//     const { comment } = req.body;

//     try {
//         const feedback = prisma.feedback.create({
//             data: {
//                 userId,
//                 workId: id,
//                 comment,
//             },
//         });
//         return res.json(feedback);
//     } catch {
//         return res.status(400).json("error");
//     }
// });

export default works;
