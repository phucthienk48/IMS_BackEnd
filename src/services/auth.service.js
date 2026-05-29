const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");

class AuthService {
  //  ĐĂNG KÝ
  static async register(data) {
    const { username, email, password, role } = data;

    // 1️ Kiểm tra trùng email hoặc username
    const existed = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existed) {
      throw new Error("Tài khoản đã tồn tại");
    }

    // Tạo user mới
    const user = await User.create({
      username,
      email,
      password,              
      avatar: "/data/avatar.jpg", 
      role: role || "student",
      isActive: true,
    });

    // Không trả password ra ngoài
    const result = user.toObject();
    delete result.password;

    return result;
  }



    // ĐĂNG NHẬP
  static async login(data) {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) throw new Error("Email không tồn tại");

    if (password !== user.password) {
      throw new Error("Mật khẩu không đúng");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user,
      accessToken,
      refreshToken,
    };
  }



  //  ĐĂNG XUẤT 
  static async logout(userId) {
    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
    });
  }
}

module.exports = AuthService;
