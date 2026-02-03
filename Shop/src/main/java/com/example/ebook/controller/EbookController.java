package com.example.ebook.controller;


import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.ebook.dto.EbookResponse;
import com.example.ebook.dto.PageResponse;
import com.example.ebook.entity.Ebook;
import com.example.ebook.service.EbookService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

//서비스 계층을 호출해 API 엔드포인트를 제공
//요청, 응답에는 DTO를 사용해 엔티티 노출을 방지
@RestController
@Validated
@RequestMapping("/api/ebooks")
public class EbookController {

	private final EbookService ebookService;
	
	public EbookController(EbookService ebookService) {
		this.ebookService = ebookService;
	}
	
	/* 
	목록조회(검색 + 페이징)
	GET /api/ebook?page=0&size=10&q=검색어
	*/
	@GetMapping
	public PageResponse<EbookResponse> list(
			@RequestParam(name = "page", defaultValue = "0")
			@Min(0) int page,
			@RequestParam(name = "size", defaultValue = "10")
			@Min(0) @Max(100) int size,
			@RequestParam(name = "q", required = false) String q) {
	    
		var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

		Page<Ebook> pageResult = (q == null || q.isBlank())
				? ebookService.listActivePage(pageable)
				: ebookService.listActivePage(q.trim(), pageable);

		return PageResponse.of(
				pageResult.getContent().stream().map(EbookResponse::from).toList(),
				pageResult.getNumber(),
				pageResult.getSize(),
				pageResult.getTotalElements()
		);
	}

	/*
	상세조회(상세페이지용)
	GET /api/ebooks/{id}
	*/
	@GetMapping("/{id}")
	public EbookResponse get(@PathVariable(name = "id") Long id) {
		Ebook ebook = ebookService.getById(id);
		return EbookResponse.from(ebook);
	}

	//부분수정(patch)
	//null인 필드는 변경x
	//price는 0이상 필수
	@PatchMapping("/{id}")
	public EbookResponse update(@PathVariable(name = "id") Long id, @Valid @RequestBody UpdateRequest req) {
		Ebook updated = ebookService.update(
				id,
				req.title(),
				req.author(),
				req.price(),
				req.thumbnail(),
				req.status()
		);
		return EbookResponse.from(updated);
	}
	
	//이북 삭제
	//HttpStatus상태코드 204로 반환 기본설정 200
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable(name = "id") Long id) {
		ebookService.delete(id);
	}
	
	/*
	 *이북 상태 변경 전용 엔드포인트
	 *ACTIVE / INACTIVE 만 허용
	 *다른 필드는 건드리지 않음
	 */
	@PatchMapping("/{id}/status")
	public EbookResponse changeStatus(
			@PathVariable(name = "id") Long id,
			@RequestBody StatusRequest req
	) {
		//허용 값 검증(대소문자 무시) 틀리면 400
		if(req == null || req.status == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
		}
		String s = req.status.trim().toUpperCase();
		if(!s.equals("ACTIVE") && !s.equals("INACTIVE")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be ACTIVE or INACTIVE");
		}
		
		//서비스의 부분 수정 사용: status만 변경
		var updated = ebookService.update(id, null, null, null, null, s);
		return EbookResponse.from(updated);
	}
	
//	-----------------------DTO---------------------------------
	
	//생성요청-title, price필수
	public record CreateRequest(
			@NotBlank(message = "title은 필수입니다.")
			String title,
			String author,
			@NotNull(message = "price는 필수입니다.")
			@DecimalMin(value = "0.0", inclusive = true, message = "price는 0원 이상입니다.")
			BigDecimal price,
			String thumbnail,
			String status
	) {}
	
	//부분수정요청 DTO
	//모든 필드 선택사항
	//price 0이상 필수
	public record UpdateRequest(
			Long id,
			String title,
			String author,
			BigDecimal price,
			String thumbnail,
			String status
	) {}
	
	public static class StatusRequest{
		public String status;	//JSON: {"status":"INACTIVE"}같은 형태
	}
}
