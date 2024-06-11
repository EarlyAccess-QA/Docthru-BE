import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";

const users = express.Router();
const prisma = new PrismaClient();

users.get("/ongoing", async (req, res) => {
    const userId = Number(res.locals.user.id);

    const work = await prisma.work.findMany({
        where: { userId },
        include: {
            Challenge: true,
        },
    });
    if (!work[0]) return res.json("no data");

    const challenges = work
        .filter((work) => work.Challenge.progress === false)
        .map((work) => work.Challenge);

    return res.json(challenges);
});

users.get("/completed", async (req, res) => {
    const userId = Number(res.locals.user.id);

    const work = await prisma.work.findMany({
        where: { userId },
        include: {
            Challenge: true,
        },
    });
    if (!work[0]) return res.json("no data");

    const challenges = work
        .filter((work) => work.Challenge.progress === true)
        .map((work) => work.Challenge);

    return res.json(challenges);
});

users.get("/application", async (req, res) => {
    const userId = Number(res.locals.user.id);

    const application = await prisma.application.findMany({
        where: { userId },
        include: {
            Challenge: true,
        },
    });
    if (!application[0]) return res.json("no data");

    return res.json(application);
});

export default users;
