import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import auth from "./authMiddleware";

const works = express.Router();
const prisma = new PrismaClient();

works.get("/", async (req, res) => {
    res.json("get");
});

export default works;
