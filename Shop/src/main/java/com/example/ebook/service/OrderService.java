package com.example.ebook.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.ebook.domain.CartItemRepository;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.entity.CartItem;
import com.example.ebook.entity.Order;
import com.example.ebook.entity.OrderItem;

/*
 * 장바구니 -> 주문전환
 * 상태는 PENDING으로 시작
 * 금액 합계와 최종 금액 계산
 * 생성 후 장바구니 비우기
 */
@Service
@Transactional	//중간에 에러나면 안되기 때문에 전부 롤백
public class OrderService {

	private final OrderRepository orderRepository;
	private final CartItemRepository cartItemRepository;
	private final CartService cartService;
	
	public OrderService(OrderRepository orderRepository,
						CartItemRepository cartItemRepository,
						CartService cartService) {
		this.orderRepository = orderRepository;
		this.cartItemRepository = cartItemRepository;
		this.cartService = cartService;
	}
	
	/*
	 * 장바구니를 읽어 주문을 생성
	 * 장바구니가 비어 있으면 400
	 * 비활성 이북이 있으면 400
	 * 성공 시: 주문과 주문아이템 저장, 장바구니 비움
	 */
	public Order createFromCart(Long userId) {
		if(userId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
		}
		
		//유저 장바구니 확보
		var cart = cartService.getOrCreateCart(userId);
		
		//장바구니 항목 로드(트랜잭션 안이라 LAZY 접근 안전)
		List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
		if(items.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
		}
		
		//주문 헤더 생성
		String orderNo = generateOrderNumber();
		Order order = new Order(userId, orderNo, "PENDING");
		
		//장바구니 -> 주문아이템 변환 + 합계 계산
		BigDecimal total = BigDecimal.ZERO;
		for(CartItem ci : items) {
			//상태 체크: 비활성 상품을 주문하려 하면 막음
			var ebook = ci.getEbook();
			String status = ebook.getStatus() == null ? "" : ebook.getStatus().trim().toUpperCase();
			if(!"ACTIVE".equals(status)) {
				throw new ResponseStatusException(
						HttpStatus.BAD_REQUEST,
						"Ebook is not available: id=" + ebook.getId());
			}
			
			//스냅샷 생성: 제목/가격은 주문 시점 값으로 보존
			OrderItem oi = new OrderItem(
					ebook,
					ebook.getTitle(),
					ebook.getPrice(),
					ci.getQuantity()
			);
			order.additem(oi);	//양방향 연관 설정 + 리스트에 추가
			total = total.add(oi.getSubTotal());	//합계 증가
		}
		
		//금액 세팅
		order.setTotalAmount(total);
		order.setFinalAmount(total);
		
		//저장
		Order saved = orderRepository.save(order);
		
		//장바구니 비우기(동일 트랜젝션 내에서 처리)
		cartItemRepository.deleteAllByCartId(cart.getId());
		cart.touch(); //updated_at 갱신(더티체킹으로 UPDATE)
		
		return saved;
	}
	
//---------내부 유틸-----------
	private String generateOrderNumber() {
		// 길이 20자 맞춤: "ORD-"(4) + 16자리 대문자 HEX
	    String hex = java.util.UUID.randomUUID().toString().replace("-", "");
	    return "ORD-" + hex.substring(0, 16).toUpperCase();
	    }
}
