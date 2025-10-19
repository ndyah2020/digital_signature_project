import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { updateUserSchema } from "../dto/user.dto";

export class UserController {
  private userService = new UserService();

  // [GET] /users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      return res.json(users);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // [PUT] /users/:id
  async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);

      // Validate body bằng Joi
      const { error, value } = updateUserSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true, // loại bỏ field thừa
      });
      if (error) {
        return res
          .status(400)
          .json({ message: "Dữ liệu không hợp lệ", details: error.details });
      }

      // Gọi service cập nhật
      const updatedUser = await this.userService.updateUser(userId, value);

      return res.json({
        message: "Cập nhật người dùng thành công",
        data: updatedUser,
      });
    } catch (error: any) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}
