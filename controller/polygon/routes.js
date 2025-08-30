"use strict";
const express = require("express");
const requireDirectory = require("require-directory");
const createDualJwtAuth = require("../middleware/tokenmiddleware");
const polygonRoutes = express.Router();
const controller = requireDirectory(module, "./");

polygonRoutes.use(createDualJwtAuth(["admin", "seller"]));

polygonRoutes.get("/health", controller.health);
polygonRoutes.get("/", controller.getAll);
polygonRoutes.get("/:id", controller.getById);
polygonRoutes.post("/", controller.create);
polygonRoutes.put("/:id", controller.update);
polygonRoutes.delete("/:id", controller.remove);
polygonRoutes.post("/test-point", controller.testPoint);

module.exports = polygonRoutes;
