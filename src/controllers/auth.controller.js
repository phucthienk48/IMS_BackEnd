const AuthService = require("../services/auth.service");

class AuthController {
  async register(req, res) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
        message: "Đăng ký thành công",
        user, //  trả về password
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async login(req, res) {
    try {
      const data = await AuthService.login(req.body);

      res.json({
        message: "Đăng nhập thành công",
        user: {
          id: data.user._id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,

          // BẮT BUỘC THÊM
          avatar: data.user.avatar || "",
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }



  async logout(req, res) {
    await AuthService.logout(req.user.id);
    res.json({ message: "Đăng xuất thành công" });
  }
}

module.exports = new AuthController();
