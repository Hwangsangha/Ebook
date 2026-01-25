package com.example.ebook.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.ebook.domain.DownloadTokenRepository;
import com.example.ebook.domain.OrderItemRepository;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.dto.DownloadTokenResponse;
import com.example.ebook.entity.DownloadToken;

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
	
	public DownloadTokenResponse issue(Long userId, Long orderId, Long ebookId) {
		//파라미터 검증
		if(userId == null || orderId == null || ebookId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId, orderId, ebookId are required");
		}
		
		//주문 헤더 확인
		var order = orderRepository.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
		if(!order.getUserId().equals(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
		}
		if(!"PAID".equalsIgnoreCase(order.getStatus())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not PAID");
		}
		
		//주문 아이템에 해당 ebook이 있는지 확인
		boolean contains = orderItemRepository.findByOrderId(orderId).stream()
				.anyMatch(oi -> oi.getEbook() != null && ebookId.equals(oi.getEbook().getId()));
		if(!contains) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ebook not in the order");
		}
		
		//토큰 생성(충돌 걱정 없는 UUID) + 만료시간(예: 10분)
		String token = "DT-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
		LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
		
		//저장
		var entity = new DownloadToken(userId, orderId, ebookId, token, expiresAt);
		downloadTokenRepository.save(entity);
		
		return new DownloadTokenResponse(token, expiresAt);
	}

	//다운로드 응답용(컨드롤러에서 filename(), bytes()로 꺼냄)
	public record DownloadFile(String filename, byte[] bytes) {}

	//토큰으로 다운로드(만료 검증 + 1회성 소비 + 파일 바이트 생성)
	public DownloadFile download(String token) {
		if(token == null || token.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "token is required");
		}

		//토큰 조회
		DownloadToken dt = downloadTokenRepository.findByToken(token)
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "token not found"));

		//만료체크
		if(dt.getExpiresAt() == null || dt.getExpiresAt().isBefore(LocalDateTime.now())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "token expied");
		}

		//orderId가 없으면(기존 데이터/이전 토큰) 재발급 유도
		if(dt.getOrderId() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "token has no orderId. re-issue token");
		}

		//주문 재검증(본인/PAID/ebook 포함)
		var order = orderRepository.findById(dt.getOrderId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found"));
		
		if(!order.getUserId().equals(dt.getUserId())) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found");
		}

		if(!"PAID".equalsIgnoreCase(order.getStatus())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "order is not PAID");
		}

		boolean contains = orderItemRepository.findByOrderId(dt.getOrderId()).stream()
				.anyMatch(oi -> oi.getEbook() != null && dt.getEbookId().equals(oi.getEbook().getId()));
		
		if(!contains) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ebook not in the order");
		}

		//1회성 토큰 소비(엔티티에 used필드 없으니 삭제로 처리)
		downloadTokenRepository.deleteById(dt.getId());

		//실제 파일은 아직 없으니 "동작 확인용" 텍스트 파일로 응답(다음 단계에서 교체)
		String filename = "ebook-" + dt.getEbookId() + ".txt";
		String content = "DOWNLOAD OK\norderId=" + dt.getOrderId() + "\nebookId=" + dt.getEbookId();

		return new DownloadFile(filename, content.getBytes(StandardCharsets.UTF_8));
	}
}
