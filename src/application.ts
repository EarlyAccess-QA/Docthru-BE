import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";

const application = express.Router();
const prisma = new PrismaClient();

application.get("/", async (req, res) => {
    const application = await prisma.application.findMany();
    if (!application[0]) return res.status(400).json("no data");

    return res.json(application);
});

application.post("/", async (req, res) => {
    const userId = Number(res.locals.user.id);
    const { title, link, field, docType, deadLine, maxParticipants, content } =
        req.body;

    try {
        const challenge = await prisma.challenge.create({
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
        const application = await prisma.application.create({
            data: {
                userId,
                challengeId: challenge.id,
            },
        });
        await prisma.participate.create({
            data: {
                userId,
                challengeId: challenge.id,
            },
        });
        return res.json(application);
    } catch {
        return res.status(400).json("bad request");
    }
});

application.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const userId = Number(res.locals.user.id);

    const application = await prisma.application.findUnique({
        where: { id },
    });
    if (!application) return res.status(400).json("wrong id");
    else if (application.userId !== userId)
        return res.status(400).json("wrong user");

    try {
        await prisma.challenge.delete({
            where: { id: application.challengeId },
        });
    } catch {
        return res.status(400).json("error");
    }

    return res.json("success");
});

application.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    let application;
    const role = res.locals.user.role;
    if (role !== "ADMIN") return res.status(400).json("NO ADMIN");

    try {
        if (status === "APPLY") {
            application = await prisma.application.update({
                where: { id },
                data: {
                    status,
                    appliedAt: new Date(),
                },
            });
        } else if (status === "REFUSE") {
            application = await prisma.application.update({
                where: { id },
                data: {
                    status,
                    refuseReasons: req.body.reasons,
                    refuseAt: new Date(),
                },
            });
        }
        return res.json(application);
    } catch {
        return res.status(400).json("wrong id");
    }
});

export default application;
