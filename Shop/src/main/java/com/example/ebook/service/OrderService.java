package com.example.ebook.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.ebook.domain.CartItemRepository;
import com.example.ebook.domain.EbookRepository;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.dto.CartLine;
import com.example.ebook.dto.OrderDetail;
import com.example.ebook.dto.OrderLine;
import com.example.ebook.dto.OrderSummary;
import com.example.ebook.entity.CartItem;
import com.example.ebook.entity.Ebook;
import com.example.ebook.entity.Order;
import com.example.ebook.entity.OrderItem;
import jakarta.validation.constraints.NotNull;

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
	private final EbookRepository ebookRepository;
	private final OrderItem orderItem;
	
	public OrderService(OrderRepository orderRepository,
						CartItemRepository cartItemRepository,
						CartService cartService,
						EbookRepository ebookRepository,
						OrderItem orderItem
						) {
		this.orderRepository = orderRepository;
		this.cartItemRepository = cartItemRepository;
		this.cartService = cartService;
		this.ebookRepository = ebookRepository;
		this.orderItem = orderItem;
	}
	
	/*
	 * 장바구니를 읽어 주문을 생성
	 * 장바구니가 비어 있으면 400
	 * 비활성 이북이 있으면 400
	 * 성공 시: 주문과 주문아이템 저장, 장바구니 비움
	 */
	public Order createFromCart(Long userId) {		//주문 생성
		//PENDING 주문이 있으면 새로 만들지 말고 기존 것 반환(중복방지)
		var existing = orderRepository.findTopByUserIdAndStatusOrderByIdDesc(userId, "PENDING");
		if(existing.isPresent()) {
			return existing.get();
		}

		List<CartLine> lines = cartService.getItems(userId);		//장바구니 라인 조회
		if(lines.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
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
			order.addItem(oi);	//양방향 연관 설정 + 리스트에 추가
			total = total.add(oi.getSubTotal());	//합계 증가
		}
		
		//금액 세팅
		order.setTotalAmount(total);
		order.setFinalAmount(total);
		
		//저장
		Order saved = orderRepository.save(order);

		//장바구니 비우기
		cartItemRepository.deleteAllByCartId(cart.getId());
		cart.touch();
		
		return saved;
	}
	
//---------내부 유틸-----------
	private String generateOrderNumber() {
		// 길이 20자 맞춤: "ORD-"(4) + 16자리 대문자 HEX
	    String hex = java.util.UUID.randomUUID().toString().replace("-", "");
	    return "ORD-" + hex.substring(0, 16).toUpperCase();
	}
	
	/*
	 * 주문 상세조회
	 Repository 별도 호출 없이 JPA 연관관계를 통해 아이템 조회
	 */
	@Transactional(readOnly = true)
	public OrderDetail getDetail(Long userId, Long orderId) {
		if(userId == null || orderId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and orderId are required");
		}
		
		//주문 헤더 로드 없으면 404
		Order order = orderRepository.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
		
		//권한 확인
		if(!order.getUserId().equals(userId)) {
			//권한 없는 사용자는 존재 자체를 모르게 처리
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
		}
		
		//아이템 변환(JPA 연관관계 활용)
		// order.getItems() 호출 시점에 DB에서 Select 쿼리가 실행(Lazy Loading)
		List<OrderLine> lines = order.getItems().stream()
				.map(oi -> new OrderLine(
						oi.getEbook().getId(),
						oi.getTitleSnap(),
						oi.getPriceSnap(),
						oi.getQuantity(),
						oi.getSubTotal()
				)).toList();
		return new OrderDetail(
				order.getId(),
				order.getOrderNumber(),
				order.getStatus(),
				order.getTotalAmount(),
				order.getFinalAmount(),
				order.getCreatedAt(),
				lines
				);
	}
	
	//주문 상태를 PENDING -> PAID로 변경
	@Transactional
	public void markPaid(Long userId, Long orderId) {
		if(userId == null || orderId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and orderId are required");
		}
		
		var order = orderRepository.findById(orderId)
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found"));
		
		//본인 주문만 가능
		if(!order.getUserId().equals(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found");
		}
		
		//상태체크
		String s = order.getStatus();
		if(!"PENDING".equalsIgnoreCase(s)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, " Order is not PENDING");
		}
		
		order.setStatus("PAID");
		order.setPaidAt(LocalDateTime.now());
		
		//더티체킹으로 flush 되지만 명시적으로 저장해도 무방
		orderRepository.save(order);

		//결제 성공 후 장바구니 비우기
		var cart = cartService.getOrCreateCart(userId);		//장바구니 확보
		cartItemRepository.deleteAllByCartId(cart.getId());		//장바구니 전체 삭제
		cart.touch();		//updated_at 갱신
	}
	
	//주문 취소: PENDING만 가능
	@Transactional
	public void cancel(Long userId, Long orderId) {
		if(userId == null || orderId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and orderId are required");
		}
		
		var order = orderRepository.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found"));
		if(!order.getUserId().equals(userId)) {
			//남의 주문은 존재자체를 숨김
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found");
		}
		
		if(!"PENDING".equalsIgnoreCase(order.getStatus())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING can be cancelled");
		}
		
		order.setStatus("CANCELED");
		order.setCanceledAt(LocalDateTime.now());
		orderRepository.save(order);	//명시 저장
	}

	@Transactional(readOnly = true)
	public List<OrderSummary> getMyOrders(Long userId) {
		if(userId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
		}

		return orderRepository.findByUserIdOrderByIdDesc(userId).stream()
				.map(o -> new OrderSummary(
					o.getId(),
					o.getOrderNumber(),
					o.getStatus(),
					o.getTotalAmount(),
					o.getFinalAmount(),
					o.getCreatedAt()
				))
				.toList();
	}

	//장바구니 거치지 않고 단건 주문생성
	@Transactional
    public Order createDirectOrder(Long userId, Long ebookId) {
		//책 정보 조회
		Ebook ebook = ebookRepository.findById(ebookId)
						.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "책을 찾을 수 없습니다."));
		
		//비활성 상태 체크
		if(!"ACTIVE".equals(ebook.getStatus())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "판매 중인 상품이 아닙니다.");
		}

		//주문 생성
		Order order = new Order();
		order.setUserId(userId);
		order.setStatus("PENDING");
		order.setCreatedAt(LocalDateTime.now());

		orderRepository.save(order);

		// //주문 상품 생성
		// OrderItem item = new OrderItem();
		// item.setOrder(order);
		// item.setEbook(ebook);
		// item.setPriceSnap(ebook.getPrice());

		// orderItemRepository.save(item);
		
		return order;
    }
	
}
