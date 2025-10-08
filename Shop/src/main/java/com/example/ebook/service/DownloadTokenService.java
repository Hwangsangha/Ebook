package com.example.ebook.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.ebook.domain.DownloadTokenRepository;
import com.example.ebook.domain.OrderItemRepository;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.dto.DownloadTokenResponse;

/*
 *다운로드 토큰 발급:
 *주문이 본인 것인지 확인
 *주문 상태가 PAID인지 확인
 *해당 주문에 ebookId가 포함돼 있는지 확인
 *토큰 생성 후 만료시간과 함께 저장 
 */
@Service
@Transactional
public class DownloadTokenService {

	private final OrderRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final DownloadTokenRepository downloadTokenRepository;
	
	public DownloadTokenService(OrderRepository orderRepository,
								OrderItemRepository orderItemRepository,
								DownloadTokenRepository downloadTokenRepository) {
		this.orderRepository = orderRepository;
		this.orderItemRepository = orderItemRepository;
		this.downloadTokenRepository = downloadTokenRepository;
	}
	
//	public DownloadTokenResponse issue(Long userId, Long orderId, Long ebookId) {
//		//파라미터 검증
//		if(userId == null || orderId == null || ebookId == null) {
//			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId, orderId, ebookId are required");
//		}
//		
//		//주문 헤더 확인
//		
//		
//	}
}
