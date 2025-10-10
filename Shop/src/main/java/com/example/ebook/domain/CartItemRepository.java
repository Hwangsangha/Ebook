package com.example.ebook.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ebook.entity.CartItem;

/*
 * 장바구니 항목 레포지토리
 * cartId, ebookId로 단건 조회해서 수량 올리기 등에 사용
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
	Optional<CartItem> findByCartIdAndEbookId(Long cartId, Long ebookId);
	
	//장바구니 비우기
	void deleteAllByCartId(Long cartId);
	
	//특정 장바구니 항목 조회
	List<CartItem> findByCartId(Long cartId);
}