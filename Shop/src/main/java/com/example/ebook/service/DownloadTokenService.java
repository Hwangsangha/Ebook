package com.example.ebook.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
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

	//yml에서 경로를 주입받음
	@Value("${ebook.storage.path}")
	private String storagePath;
	
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
		boolean contains = orderItemRepository.findByOrder_Id(orderId).stream()
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
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "token expired");
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

		boolean contains = orderItemRepository.findByOrder_Id(dt.getOrderId()).stream()
				.anyMatch(oi -> oi.getEbook() != null && dt.getEbookId().equals(oi.getEbook().getId()));
		
		if(!contains) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ebook not in the order");
		}

		//1회성 토큰 소비(엔티티에 used필드 없으니 삭제로 처리)
		downloadTokenRepository.deleteById(dt.getId());

		//실제 파일 로드(resource/ebooks/ebook-{ebookId}.pdf)
		String filename = "ebook-" + dt.getEbookId() + ".pdf";

		try {
			//설정된 경로(storagePath)와 파일명 합침
			Path path = Paths.get(storagePath).resolve(filename).normalize();

			//파일 존재 여부 확인
			if(!Files.exists(path)) {
				//보안상 실제 경로를 노출하지 않고 404처리
				System.out.println("File not found at: " + path.toAbsolutePath());
				throw new ResponseStatusException(HttpStatus.NOT_FOUND, "ebook file not found: " + filename);
			}

			//파일 읽기
			byte[] bytes = Files.readAllBytes(path);
			return new DownloadFile(filename, bytes);
		} catch(IOException e) {
			e.printStackTrace();		//서버 로그에 에러 출력
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "failed to read ebook file");
		}
	}
}
