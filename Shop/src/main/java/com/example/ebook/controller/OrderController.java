package com.example.ebook.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ebook.dto.CreatedOrderResponse;
import com.example.ebook.dto.OrderDetail;
import com.example.ebook.dto.OrderSummary;
import com.example.ebook.entity.Order;
import com.example.ebook.service.OrderService;

import jakarta.validation.constraints.NotNull;

/*
 * 장바구니를 주문으로 전환
 * 바디 없이 userId만 쿼리로 받는다
 */
@RestController
@RequestMapping("/orders")
@Validated
public class OrderController {

	private final OrderService orderService;
	public OrderController(OrderService orderService) {this.orderService = orderService;}
	
	/*
	 * 주문생성
	 * 장바구니 비어 있으면 400
	 * 비활성 이북 포함돼 있으면 400
	 * 성공시 201 + 간당한 주문 요약 반환
	 */
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public CreatedOrderResponse create(@RequestParam("userId") @NotNull Long userId,
										@RequestParam(value = "ebookId", required = false) Long ebookId) {
		Order order;
		if(ebookId != null) {
			order = orderService.createDirectOrder(userId, ebookId);
		} else {
			order = orderService.createFromCart(userId);
		}

		return CreatedOrderResponse.from(order);
	}
	//결제 완료 처리: PATCH /orders/{id}/pay?userId=1
	@PatchMapping("/{id}/pay")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void pay(@PathVariable("id") Long id,
					@RequestParam("userId") @NotNull Long userId) {
		orderService.markPaid(userId, id);
	}
	//상세조회
	@GetMapping("/{id}")
	public OrderDetail detail(
			@PathVariable("id") Long orderId,
			@RequestParam("userId") @NotNull Long userId) {
		return orderService.getDetail(userId, orderId);
	}
	//주문 취소: PATCH /orders/id/cancel?userId=1
	@PatchMapping("/{id}/cancel")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void cancel(@PathVariable("id") Long id,
						@RequestParam("userId") @NotNull Long userId) {
		orderService.cancel(userId, id);
	}

	//주문 목록 조회: GET /orders?userId=1
	@GetMapping
	public List<OrderSummary> list(@RequestParam("userId") @NotNull Long userId) {
		return orderService.getMyOrders(userId);
	}
	
}
