INSERT INTO roles(name) VALUES ('USER'), ('ADMIN')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users(email, password_hash, name, status)
VALUES ('demo@ebook.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5e7YQYyY5q3LkM4b6h8Z/5q3u1e7YQy', '데모', 'ACTIVE')
ON DUPLICATE KEY UPDATE name='데모';

INSERT INTO ebook(title, author, price, status)
VALUES ('스프링 하나로 생존', '홍개발', 9900.00, 'ACTIVE'),
       ('이펙티브 자바 요약', '조바', 7900.00, 'ACTIVE');

-- 대표 파일은 애플리케이션에서 한 개만 보장
INSERT INTO ebook_file(ebook_id, path, format, file_size, is_primary)
SELECT e.id, CONCAT('s3://bucket/', e.id, '/book.epub'), 'EPUB', 123456, TRUE FROM ebook e;
