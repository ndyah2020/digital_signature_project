import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { updateUserSchema } from "../dto/user.dto";

export class UserController {
  private userService = new UserService();

  // [GET] /users
  async getAllUsers(req: Request, res: Response) {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(400).json({
          message: "Bạn không có quyền xem thông tin người dùng",
          access: false,
        })
      }
      const users = await this.userService.getAllUsers();
      return res.json(users);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getUserByEmail(req: Request, res: Response) {
    try {
      const email = req.params.email;
      console.log(email)
      const users = await this.userService.getUserByEmail(email);
      return res.status(200).json(users);
    }catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async checkPassword(req: Request, res: Response) {
    try {
      const {password} = req.body;
      const userId = req.user.email;
      const result = await this.userService.checkPassword(userId,password);
      if(!result) {
        return res.status(400).json({access: false})
      }

      return res.status(200).json({access: true})
    }catch (error: any) {
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
