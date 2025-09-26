package com.example.ebook.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.ebook.domain.CartItemRepository;
import com.example.ebook.domain.CartRepository;
import com.example.ebook.domain.EbookRepository;
import com.example.ebook.entity.Cart;
import com.example.ebook.entity.CartItem;
import com.example.ebook.entity.Ebook;

@Service
@Transactional	//따로 트랜잭션으로 묶어 끝나면 커밋 시킴
public class CartService {

	private final CartRepository cartRepository;
	private final CartItemRepository cartItemRepository;
	private final EbookRepository ebookRepository;
	
	public CartService(CartRepository cartRepository,
					   CartItemRepository cartItemRepository,
					   EbookRepository ebookRepository) {
		this.cartRepository = cartRepository;
		this.cartItemRepository = cartItemRepository;
		this.ebookRepository = ebookRepository;
	}
	
	/*
	 * 유저의 장바구니를 가져오거나 없으면 만든다
	 * 인증은 아직 없으니 userId만 받는다
	 */
	public Cart getOrCreateCart(Long userId) {
		if(userId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
		}
		return cartRepository.findByUserId(userId)
				.orElseGet(() -> cartRepository.save(new Cart(userId)));
	}
	/*
	 * 장바구니에 이북 담기
	 * 중복 이북은 수량 증가
	 * 수량은 최소 1로 필수
	 * 존재하지 않는 이북이면 404
	 */
	public CartItem addItem(Long userId, Long ebookId, int quantity) {
		if(quantity <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "quantity must be >= 1");
		}
		
		Cart cart = getOrCreateCart(userId);
		
		Ebook ebook = ebookRepository.findById(ebookId)
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND, "Ebook not found: id=" + ebookId));
		
		//cart, ebook조합이 이미 있으면 수량 증가
		CartItem item = cartItemRepository
				.findByCartIdAndEbookId(cart.getId(), ebook.getId())
				.orElse(null);
		
		if(item == null) {
			//새항목
			item = new CartItem(cart, ebook, quantity);
		}else {
			//기존 수량 + 추가 수량(최소 1개)
			item.changeQuantity(item.getQuantity() + quantity);
		}
		return cartItemRepository.save(item);
	}
	
	/*
	 * 장바구니 비우기
	 */
	public void clear(Long userId) {
		Cart cart = getOrCreateCart(userId);	//장바구니 조회
		cartItemRepository.deleteAllByCartId(cart.getId());	//장바구니 전체삭제			
		cart.touch();							//장바구니의 타임스탬프갱신
	}
}
