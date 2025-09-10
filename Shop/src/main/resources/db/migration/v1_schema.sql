-- === USERS & ROLES ===
CREATE TABLE users (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  status        VARCHAR(20),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id    BIGINT PRIMARY KEY AUTO_INCREMENT,
  name  VARCHAR(30) NOT NULL UNIQUE
);

-- 다대다: 사용자-역할
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- === EBOOK CORE ===
CREATE TABLE ebook (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  title      VARCHAR(255) NOT NULL,
  author     VARCHAR(255),
  price      DECIMAL(12,2) NOT NULL,
  thumbnail  VARCHAR(500),
  status     VARCHAR(20),  -- ACTIVE/INACTIVE/DRAFT 등 코드로 관리
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 전자책 파일(여러 포맷 저장)
CREATE TABLE ebook_file (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  ebook_id   BIGINT NOT NULL,
  path       VARCHAR(500) NOT NULL, -- 저장소 키 또는 URL
  format     VARCHAR(20),           -- PDF/EPUB 등
  file_size  BIGINT,
  is_primary BOOLEAN,               -- 대표 파일 여부 (애플리케이션에서 1개로 보장)
  CONSTRAINT fk_ef_ebook FOREIGN KEY (ebook_id) REFERENCES ebook(id)
);

-- === CART ===
CREATE TABLE cart (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT NOT NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT uq_cart_user UNIQUE (user_id)  -- 유저별 카트 1개
);

CREATE TABLE cart_item (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  cart_id    BIGINT NOT NULL,
  ebook_id   BIGINT NOT NULL,
  quantity   INT NOT NULL,
  added_at   TIMESTAMP NULL,
  CONSTRAINT fk_ci_cart  FOREIGN KEY (cart_id)  REFERENCES cart(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ci_ebook FOREIGN KEY (ebook_id) REFERENCES ebook(id),
  CONSTRAINT uq_ci UNIQUE (cart_id, ebook_id)  -- 같은 책 중복 방지
);

-- === ORDER ===
CREATE TABLE orders (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  order_number  VARCHAR(20) NOT NULL,    -- 비즈 키
  status        VARCHAR(20) NOT NULL,    -- PENDING/PAID/CANCELLED/REFUNDED 등
  total_amount  DECIMAL(12,2) NOT NULL,
  final_amount  DECIMAL(12,2) NOT NULL,
  paid_at       TIMESTAMP NULL,
  canceled_at   TIMESTAMP NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT uq_orders_number UNIQUE (order_number)
);

CREATE TABLE order_item (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id   BIGINT NOT NULL,
  ebook_id   BIGINT NOT NULL,
  title_snap VARCHAR(255) NOT NULL,      -- 구매 시점 스냅샷
  price_snap DECIMAL(12,2) NOT NULL,
  quantity   INT NOT NULL,
  sub_total  DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_ebook FOREIGN KEY (ebook_id) REFERENCES ebook(id)
);

-- === PAYMENT ===
CREATE TABLE payment (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id    BIGINT NOT NULL,
  provider    VARCHAR(20),               -- PG사
  method      VARCHAR(20),               -- CARD/VBANK/KAKAOPAY 등
  amount      DECIMAL(12,2) NOT NULL,
  pg_id       VARCHAR(50)  NOT NULL,     -- PG 거래 아이디
  status      VARCHAR(20)  NOT NULL,     -- REQUESTED/PAID/FAILED/REFUNDED
  paid_at     TIMESTAMP NULL,
  canceled_at TIMESTAMP NULL,
  raw_payload TEXT,
  CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT uq_payment_pg UNIQUE (pg_id)
);

-- === DOWNLOAD TOKEN ===
CREATE TABLE download_token (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT NOT NULL,
  ebook_id   BIGINT NOT NULL,
  token      VARCHAR(128) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dt_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_dt_ebook FOREIGN KEY (ebook_id) REFERENCES ebook(id) ON DELETE CASCADE,
  CONSTRAINT uq_dt_token UNIQUE (token)
);

-- === REVIEW ===
CREATE TABLE review (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_item_id BIGINT NOT NULL,
  rating        INT,
  content       TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rev_oi FOREIGN KEY (order_item_id) REFERENCES order_item(id) ON DELETE CASCADE,
  CONSTRAINT uq_rev_oi UNIQUE (order_item_id) -- 한 주문항목당 리뷰 1개
);

-- ===== Indexes (필수 조회 위주) =====
CREATE INDEX idx_ebook_status   ON ebook(status);
CREATE INDEX idx_orders_user    ON orders(user_id);
CREATE INDEX idx_order_item_ord ON order_item(order_id);
CREATE INDEX idx_payment_order  ON payment(order_id);
CREATE INDEX idx_dt_user        ON download_token(user_id);
CREATE INDEX idx_ci_cart        ON cart_item(cart_id);