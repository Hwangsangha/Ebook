package com.example.ebook.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.ebook.domain.CartItemRepository;
import com.example.ebook.domain.CartRepository;
import com.example.ebook.domain.EbookRepository;
import com.example.ebook.dto.CartLine;
import com.example.ebook.entity.Cart;
import com.example.ebook.entity.CartItem;
import com.example.ebook.entity.Ebook;
import jakarta.annotation.Nonnull;

@Nonnull
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
	
	@Transactional(readOnly = true)
	public List<CartLine> getItems(Long userId){
		Cart cart = getOrCreateCart(userId);
		List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
		
		return items.stream()
				.map(ci -> new CartLine(
						ci.getEbook().getId(),
						ci.getEbook().getTitle(),
						ci.getEbook().getPrice(),
						ci.getQuantity(),
						ci.getEbook().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()))
				))
				.toList();
	}
	
	/*
	 * 장바구니 항목 수량을 설정
	 * userId, ebookId로 항목을 찾고 없으면 404
	 * quantity < 1이면 400
	 * 성공시 변경된 CartItem반환
	 */
	public CartItem setQuantity(Long userId, Long ebookId, int quantity) {
		if(quantity < 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "quantity must be >= 1");
		}
		
		//장바구니가 없으면 생성되지만, 그 안에 해당 항목이 없으면 아래에서 404처리
		Cart cart = getOrCreateCart(userId);
		
		CartItem item = cartItemRepository
				.findByCartIdAndEbookId(cart.getId(), ebookId)
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND, "Cart item not found: ebookId=" + ebookId));
		
		item.changeQuantity(quantity);	//도메인 메서드: 최소 1보장 + cart.updatedAt 갱신
		return cartItemRepository.save(item);
	}
	
	/*
	 * 장바구니에서 특정이북 항목 삭제
	 * userId의 장바구니에서 ebookId 항목을 찾아 삭제 없으면 404
	 */
	public void removeItem(Long userId, Long ebookId) {
		Cart cart = getOrCreateCart(userId);	//장바구니 확보
		
		CartItem item = cartItemRepository
				.findByCartIdAndEbookId(userId, ebookId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found: ebookId=" + ebookId));
		
		cartItemRepository.delete(item);	//삭제
		cart.touch();						//갱신 시각 업데이트
	}
	
	@Transactional
	public void addToCart(Long userId, Long ebookId, int quantity) {
		//카트 확보
		Cart cart = cartRepository.findByUserId(userId)
				.orElseGet(() -> cartRepository.save(new Cart(userId)));
		
		//기존 항목 있으면 수량만 변경
		var existing = cartItemRepository.findByCartIdAndEbookId(cart.getId(), ebookId);
		if(existing.isPresent()) {
			CartItem item = existing.get();
			item.changeQuantity(item.getQuantity() + Math.max(1, quantity));
			return;	//JPA dirty checking으로 끝
		}
		
		//없으면 새로 추가
		Ebook ebook = ebookRepository.findById(ebookId)
				.orElseThrow(() -> new IllegalArgumentException("Ebook not found: " + ebookId));
		
		CartItem ci = new CartItem(cart, ebook, Math.max(1, quantity));
		cart.addItem(ci);			//연관관계 고정 + cart.touch()
		cartRepository.save(cart);	//cascade로 cart_item까지 저장
	}
}
