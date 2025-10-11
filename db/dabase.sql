
-- người dùng hệ thống
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    public_key TEXT,
    role TEXT NOT NULL,
    private_key_encrypted TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- hợp đồng hoặc tài liệu cần ký
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    drive_file_id VARCHAR(50),
    file_type VARCHAR(20),
    file_size BIGINT,
    hash TEXT,  -- SHA-256 hash của nội dung hợp đồng
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'cancelled')),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- chữ ký số của người dùng trên hợp đồng
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    contract_id INT,
    user_id INT,
    signature_algo VARCHAR(50) DEFAULT 'RSA-PSS-SHA256',
    signature_hash TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- theo dõi hành động người dùng
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Thêm khóa ngoại sau khi tạo bảng
-- 🔹 contracts.created_by → users.id
ALTER TABLE contracts
ADD CONSTRAINT fk_contracts_created_by
FOREIGN KEY (created_by)
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 🔹 signatures.contract_id → contracts.id
ALTER TABLE signatures
ADD CONSTRAINT fk_signatures_contract
FOREIGN KEY (contract_id)
REFERENCES contracts(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 🔹 signatures.user_id → users.id
ALTER TABLE signatures
ADD CONSTRAINT fk_signatures_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 🔹 audit_logs.user_id → users.id
ALTER TABLE audit_logs
ADD CONSTRAINT fk_audit_logs_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Tạo index hỗ trợ tìm kiếm nhanh
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_signatures_contract_user ON signatures(contract_id, user_id);
