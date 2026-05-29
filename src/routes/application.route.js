const express = require("express");

const router = express.Router();

const ApplicationController = require("../controllers/application.controller");

// CREATE
router.post("/", ApplicationController.create);
router.post("/topic/:topicId", ApplicationController.createForTopic);

// GET ALL
router.get("/", ApplicationController.getAll);

router.get("/user/:id", ApplicationController.getByUser);

// GET BY ID
router.get("/:id", ApplicationController.getById);

// UPDATE
router.put("/:id", ApplicationController.update);

// UPDATE STATUS
router.patch("/:id/status", ApplicationController.updateStatus);

// DELETE
router.delete("/:id", ApplicationController.delete);

module.exports = router;
