const userService = require("../services/user.service");

exports.createUser = async (req, res) => {
  try {
    const userData = req.body;

    // Validate role
    const allowedRoles = ["admin", "student", "lecturer"];

    if (
      userData.role &&
      !allowedRoles.includes(userData.role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Role không hợp lệ",
      });
    }

    const user = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      message: "Tạo user thành công",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updateData = req.body;

    // Validate role
    if (updateData.role) {
      const allowedRoles = [
        "admin",
        "student",
        "lecturer",
      ];

      if (!allowedRoles.includes(updateData.role)) {
        return res.status(400).json({
          success: false,
          message: "Role không hợp lệ",
        });
      }
    }

    const user = await userService.updateUser(
      req.params.id,
      updateData
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật user thành công",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa user thành công",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};