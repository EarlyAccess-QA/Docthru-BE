import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import auth from "./authMiddleware";
import application from "./application";

const challenges = express.Router();
const prisma = new PrismaClient();

challenges.get("/", async (req, res) => {
    const challenges = await prisma.challenge.findMany();
    if (!challenges[0]) res.status(400).json("no data");

    return res.json(challenges);
});

challenges.use("/application", auth, application);

challenges.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    const challenge = await prisma.challenge.findUnique({
        where: { id },
    });
    if (!challenge) return res.status(400).json("wrong id");

    return res.json(challenge);
});

challenges.put("/:id", auth, async (req, res) => {
    const id = Number(req.params.id);
    const { title, link, field, docType, deadLine, maxParticipants, content } =
        req.body;
    const role = res.locals.user.role;
    if (role !== "ADMIN") return res.status(400).json("NO ADMIN");

    try {
        const challenge = await prisma.challenge.update({
            where: { id: id },
            data: {
                title,
                link,
                field,
                docType,
                deadLine,
                maxParticipants,
                content,
            },
        });
        return res.json(challenge);
    } catch {
        return res.status(400).json("bad request");
    }
});

challenges.delete("/:id", auth, async (req, res) => {
    const id = Number(req.params.id);
    const role = res.locals.user.role;
    if (role !== "ADMIN") return res.status(400).json("NO ADMIN");

    try {
        await prisma.challenge.delete({
            where: { id: id },
        });
        return res.json("success");
    } catch {
        return res.status(400).json("wrong id");
    }
});

challenges.post("/:id/participation", auth, async (req, res) => {
    const id = Number(req.params.id);
    const userId = res.locals.user.id;
    let participate;

    const maxCheck = await prisma.challenge.findUnique({
        where: { id },
    });
    if (!maxCheck) return res.status(400).json("wrong id");
    else if (maxCheck.maxParticipants === maxCheck.participants)
        return res.status(400).json("maxParticipants");

    const doubleCheck = await prisma.participate.findMany({
        where: { userId, challengeId: id },
    });
    if (doubleCheck[0]) return res.status(400).json("already participation");

    try {
        participate = await prisma.participate.create({
            data: {
                userId,
                challengeId: id,
            },
        });
    } catch {
        return res.status(400).json("error");
    }

    try {
        await prisma.challenge.update({
            where: { id },
            data: { participants: { increment: 1 } },
        });
    } catch {
        return res.status(400).json("error");
    }

    return res.json(participate);
});

challenges.get("/:id/original", auth, async (req, res) => {
    const id = Number(req.params.id);

    const challenge = await prisma.challenge.findUnique({
        where: { id },
    });
    if (!challenge) return res.status(400).json("wrong id");

    return res.json(challenge.link);
});

export default challenges;
