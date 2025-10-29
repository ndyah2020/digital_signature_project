import { AppDataSource } from "../config/data_source";
import { User } from "../entities/User";
import { UpdateUserDTO } from "../dto/user.dto";
export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  // lấy tất cả người dùng
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
  // Lấy thông tin người dùng theo ID
  async getUserById(userId: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  // update thông tin người dùng
  async updateUser(userId: number, updateData: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }
}
