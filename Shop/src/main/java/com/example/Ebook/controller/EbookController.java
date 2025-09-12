package com.example.Ebook.web;


import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Ebook.service.EbookService;

//서비스 계층을 호출해 API 엔드포인트를 제공
//요청, 응답에는 DTO를 사용해 엔티티 노출을 방지
@RestController
@Validated
@RequestMapping("/ebooks")
public class EbookController {

	private final EbookService ebookService;
	
	public EbookController(EbookService ebookService) {
		this.ebookService = ebookService;
	}
	
//	//목록조회
//	//기본은 ACTIVE 상태만 반환
//	// 추후 쿼리 파라ㅣ터로 상태를 받아 확장 가능
//	@GetMapping
//	public List<EbookResponse> list(){
//		return ebookService.listActive().stream().map(EbookResponse::from).toList();
//	}
}
