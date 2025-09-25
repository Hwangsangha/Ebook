package com.example.ebook.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ebook.entity.Cart;

/*
 * 장바구니 레포지토리
 * userId로 장바구니를 찾는다(유저당 1개씩)
 */
public interface CartRepository extends JpaRepository<Cart, Long> {
	Optional<Cart> findByUserId(Long userId);
}
