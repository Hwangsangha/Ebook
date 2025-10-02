package com.example.ebook.controller;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ebook.dto.CreatedOrderResponse;
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
	public CreatedOrderResponse create(@RequestParam @NotNull Long userId) {
		Order order = orderService.createFromCart(userId);
		return CreatedOrderResponse.from(order);
	}
}
