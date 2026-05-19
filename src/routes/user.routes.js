const express = require("express");

const router = express.Router();

const userController = require(
  "../controllers/user.controller"
);


// CREATE
router.post("/", userController.createUser);

// GET ALL
router.get("/", userController.getAllUsers);

// GET BY ID
router.get("/:id", userController.getUserById);

// UPDATE
router.put("/:id", userController.updateUser);

// DELETE
router.delete("/:id", userController.deleteUser);

module.exports = router;