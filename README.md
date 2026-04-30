# ✍️ Digital Signature Platform (Hệ Thống Chữ Ký Số)

## 📖 Giới thiệu (Introduction)
Dự án **Digital Signature Platform** là một nền tảng ứng dụng Web toàn diện hỗ trợ các cá nhân và doanh nghiệp trong việc tải lên, quản lý, và ký kết các hợp đồng/tài liệu điện tử (Digital Signature). Hệ thống giúp hiện đại hóa quy trình ký kết, tiết kiệm thời gian, tăng cường tính bảo mật và đảm bảo tính pháp lý của các tài liệu thông qua hệ thống phân quyền và theo dõi lịch sử thao tác (Audit Logs).

## 🚀 Các tính năng nổi bật (Key Features)

### 👥 Dành cho Người dùng & Quản trị viên
- **Quản lý Hợp đồng (Contract Management):** Tải lên các hợp đồng, xem chi tiết và quản lý trạng thái của từng hợp đồng (Chờ ký, Đã ký, Từ chối, v.v.).
- **Ký số Điện tử (Digital Signature):** Hỗ trợ người dùng tạo và sử dụng chữ ký số cá nhân để ký kết trực tiếp lên các văn bản hợp đồng một cách an toàn.
- **Xác thực & Bảo mật (Security & Authentication):** 
  - Đăng nhập/Đăng ký an toàn với JWT (JSON Web Token) và mã hóa mật khẩu.
  - Hỗ trợ Xác thực hai yếu tố (2FA) sử dụng mã QR và Google Authenticator.
- **Phân quyền người dùng (RBAC):** Quản lý phân quyền chặt chẽ thông qua Roles và Users (Admin, User thông thường).
- **Lịch sử hoạt động (Audit Logs):** Theo dõi, lưu trữ và ghi nhận chi tiết mọi thao tác trên hệ thống nhằm đảm bảo tính minh bạch và dễ dàng truy vết.
- **Bảng điều khiển (Dashboard):** Giao diện thống kê trực quan về số lượng hợp đồng, tình trạng ký kết và tài khoản người dùng thông qua các biểu đồ sinh động.
- **Thông báo Tự động (Email Notifications):** Tự động gửi email thông báo cho người dùng khi họ được chỉ định tham gia ký kết một hợp đồng mới.

## 🛠️ Công nghệ sử dụng (Technology Stack)

### Frontend
- **Core Framework:** React.js kết hợp với Vite giúp build dự án siêu tốc.
- **Ngôn ngữ:** TypeScript.
- **Giao diện & Styling:** Tailwind CSS cho thiết kế hiện đại, Responsive.
- **Định tuyến:** React Router DOM.
- **Trực quan hóa Dữ liệu:** Recharts (Biểu đồ thống kê).
- **Icons:** Lucide-react.

### Backend
- **Core Framework:** Node.js, Express.js.
- **Ngôn ngữ:** TypeScript.
- **Cơ sở dữ liệu (Database):** PostgreSQL kết hợp với TypeORM.
- **Lưu trữ Cloud:** Cloudinary (dùng để lưu trữ tài liệu và hình ảnh chữ ký an toàn).
- **Bảo mật:** JsonWebToken (JWT), Bcryptjs, Speakeasy (2FA), Crypto-js.
- **Tiện ích:** Nodemailer (Gửi email), Multer (Xử lý file upload), Node-cron (Lên lịch tự động).

### DevOps & Tools
- **Containerization:** Docker & Docker Compose để dễ dàng triển khai môi trường Database và Backend.

## 📂 Cấu trúc dự án (Project Structure)

```text
📦 project-signature
 ┣ 📂 backend          # Mã nguồn API Server (Node.js/Express)
 ┃ ┣ 📂 src            # Chứa Controllers, Services, Entities, Routes...
 ┃ ┣ 📜 docker-compose.yml
 ┃ ┗ 📜 package.json
 ┣ 📂 frontend         # Mã nguồn Giao diện (React/Vite)
 ┃ ┣ 📂 src            # Chứa Components, Pages, Hooks, API, Context...
 ┃ ┗ 📜 package.json
 ┗ 📂 db               # Chứa file SQL khởi tạo cơ sở dữ liệu
```

## ⚙️ Hướng dẫn cài đặt và chạy dự án (Getting Started)

### Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/en/) (phiên bản 18+ trở lên)
- [Docker & Docker Compose](https://www.docker.com/) (Để chạy PostgreSQL và Backend qua container)
- Cấu hình các dịch vụ bên ngoài (Cloudinary, Email SMTP) để điền vào file `.env`

### 1. Khởi chạy Backend & Database
Chúng tôi khuyên dùng Docker để khởi chạy nhanh cơ sở dữ liệu và môi trường backend:
```bash
cd backend
# 1. Copy file biến môi trường và thiết lập các thông số (Database, Cloudinary, JWT Secret...)
cp .env.example .env

# 2. Khởi chạy Database và Backend thông qua Docker Compose
docker-compose --profile dev up -d
```
*(Nếu không dùng Docker, bạn cần tự tạo Database trong PostgreSQL, cấu hình lại chuỗi kết nối trong `.env`, sau đó chạy `npm install` và `npm run dev` trong thư mục `backend`)*

### 2. Khởi chạy Frontend
Mở một terminal mới và chạy các lệnh sau:
```bash
cd frontend

# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy server development
npm run dev
```

Sau khi quá trình khởi động hoàn tất, hãy truy cập vào đường dẫn mặc định `http://localhost:5173` để trải nghiệm ứng dụng.
