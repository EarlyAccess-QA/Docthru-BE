import express from "express";

const router = express.Router();
router.get("/", async (req, res) => {
    console.log("hi");
    res.json("hi");
});

export default router;
