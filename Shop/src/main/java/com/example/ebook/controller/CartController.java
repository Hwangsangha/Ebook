package com.example.ebook.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ebook.dto.CartLine;
import com.example.ebook.entity.CartItem;
import com.example.ebook.service.CartService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/*
 * 장바구니 컨트롤러
 */
@RestController
@RequestMapping("/cart")
@Validated
public class CartController {

	private final CartService cartService;
	public CartController(CartService cartService) {
		this.cartService = cartService;
	}
	
	/*
	 * 장바구니에 이북 추가
	 * 이미 있다면 수량 증가
	 * 성공시 201과 함꼐 간단한 항목 정보 반환
	 */
	@PostMapping(path = "/items", consumes = "application/json", produces = "application/json")
	@ResponseStatus(HttpStatus.CREATED)
	public AddItemResponse add(@Valid @RequestBody AddItemRequest req) {
		int qty = req.quantity == null ? 1 : req.quantity;	//null이면 1로
		CartItem item = cartService.addItem(req.userId, req.ebookId, qty);
		//연관 엔티티LAZY문제 피하려고 필요한 최소 정보만 반환
		return new AddItemResponse(item.getId(), req.ebookId, item.getQuantity());
	}
	
	@PatchMapping(path = "/items", consumes = "application/json", produces = "application/json")
	public AddItemResponse changeQuantity(@Valid @RequestBody UpdateQtyRequest req) {
		CartItem item = cartService.setQuantity(req.userId, req.ebookId, req.quantity);
		return new AddItemResponse(item.getId(), req.ebookId, item.getQuantity());
	}
	
	/** 수량 변경 요청 DTO */
	public static class UpdateQtyRequest {
	    @NotNull(message = "userId는 필수입니다.")
	    public Long userId;
	    @NotNull(message = "ebookId는 필수입니다.")
	    public Long ebookId;
	    @Min(value = 1, message = "quantity는 1 이상이어야 합니다.")
	    public Integer quantity;
	}
	
	//요청 바디
	public static class AddItemRequest{
		@NotNull(message = "userId는 필수입니다.")
		public Long userId;
		@NotNull(message = "ebookId는 필수입니다.")
		public Long ebookId;
		@Min(value = 1, message = "quantity는 1이상이어야 합니다.")
		public Integer quantity;
	}
	
	//응답 바디 
	public static class AddItemResponse{
		public final Long id;
		public final Long ebookId;
		public final int quantity;
		public AddItemResponse(Long id, Long ebookId, int quantity) {
			this.id = id;
			this.ebookId = ebookId;
			this.quantity = quantity;
		}
	}
	
	/*
	 * 장바구니 항목 조회
	 * 인증이 업으니 userId를 쿼리로 받음
	 * 응답: CartService.CartLine 리스트
	 */
	@GetMapping("/items")
	public List<CartLine> list(@RequestParam @NotNull Long userId){
		return cartService.getItems(userId);
	}
}
