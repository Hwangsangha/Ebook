package com.example.ebook.domain;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.ebook.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // 이메일로 사용자 조회(로그인에 사용)
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
