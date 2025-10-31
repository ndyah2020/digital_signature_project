import {UserData} from "../type/auth";
import { api } from "../utils/api";

export const findUserByEmail = async (email: string): Promise<UserData> => {
    try {
        const response = await api.get(`/users/${email}`);
        const user = response.data
        if (!user || !user) {
          throw new Error('Không tìm thấy người dùng với email này.');
        }
        return user;
    } catch (err: any) {
        console.error("Lỗi tìm user:", err);
        if (err.response?.status === 404 || err.message.includes('Không tìm thấy')) {
           throw new Error(`Không tìm thấy người dùng: ${email}`);
        }
        throw new Error('Lỗi khi tìm kiếm người dùng. Vui lòng thử lại.');
    }
}

