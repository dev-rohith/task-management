import express from "express";
import mongoose from "mongoose";
import { Task, TaskStatus, TaskPriority } from "../models/Task.js";
import { authenticate } from "../middleware/auth.js";
import {
  taskCreationSchema,
  taskUpdateSchema,
  taskQuerySchema,
} from "../utils/validation.js";


const router = express.Router();


router.use(authenticate);

router.get("/", async (req, res) => {
  try {

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: "Internal server error" });
    }
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: "Internal server error" });
    }
    console.log(error);
  }
});


router.post("/", async (req, res) => {
  try {

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: "Internal server error" });
    }
    console.log(error);
  }
});


router.put("/:id", async (req, res) => {
  try {

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: "Internal server error" });
    }
    console.log(error);
  }
});


router.delete("/:id", async (req, res) => {
  try {

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: "Internal server error" });
    }
    console.log(error);
  }
});


router.get("/stats/summary", async (req, res) => {
  try {
 
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: "Internal server error" });
    }
    console.log(error);
  }
});

export { router as taskRoutes };
