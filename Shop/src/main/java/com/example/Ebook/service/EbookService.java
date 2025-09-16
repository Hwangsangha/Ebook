package com.example.Ebook.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Ebook.domain.EbookRepository;
import com.example.Ebook.entity.Ebook;


@Service
@Transactional(readOnly = true)  //기본 읽기 트랜잭션
public class EbookService {
	
	private final EbookRepository ebookRepository;
	
	public EbookService (EbookRepository ebookRepository) {
		this.ebookRepository = ebookRepository;
	}
	
	//ACTIVE 상태의 이북 목록을 내림차순으로 조회
	public List<Ebook> listActive(){
		return ebookRepository.findByStatusOrderByIdDesc("ACTIVE");
	}
	
	public Page<Ebook> listActivePage(Pageable pageable) {
        return ebookRepository.findByStatus("ACTIVE", pageable);
	}
	//단건 조회(없으면 예외)
	public Ebook getById(Long id) {
		return ebookRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Ebook not found: id = " + id));
	}
	
	//이북생성
	//제목, 가격 필수 검증
	//status 기본값 미지정시 active로 지정
	public Ebook create(String title, String author, BigDecimal price, String thumbnail, String status) {
		if(title == null || title.isBlank()) {
			throw new IllegalArgumentException("title is requierd");
		}
		if(price == null || price.signum() < 0) {
			throw new IllegalArgumentException("price must be >= 0");
		}
		Ebook e = new Ebook();
		e.setTitle(title.trim());
		e.setAuthor(author);
		e.setPrice(price);
		e.setThumbnail(thumbnail);
		e.setStatus(status == null || status.isBlank() ? "ACTIVE" : status.trim());
		
		return ebookRepository.save(e);
	}
	//이북 정보 수정, 널이 아닌 값만 반영
	//제목, 저자, 가격, 썸네일, 상태를 선택적으로 갱신
	@Transactional
	public Ebook update(Long id, String title, String author, BigDecimal price, String thumbnail, String status) {
		Ebook e = getById(id); //존재 확인
		if(title != null && !title.isBlank()) e.setTitle(title.trim()); //제목 변경 null이면 변경 안함, 제목 앞뒤 공백 제거
		if(author != null) e.setAuthor(author);
		if(price != null) {
			if(price.signum() < 0) throw new IllegalArgumentException("price must be >= 0");
			e.setPrice(price);
		} // 새 가격 null이면 변경 안함, 0원 이상만 허용
		if(thumbnail != null)e.setThumbnail(thumbnail); // null이면 변경안함
		if(status != null && !status.isBlank()) e.setStatus(status.trim()); //새 상태 null이면 변경안함, 앞뒤 공백제거
		
		return ebookRepository.save(e);
	}
	
	//이북 삭제
	@Transactional
	public void delete(Long id) {
		Ebook e = getById(id); //없으면 예외
		ebookRepository.delete(e);
	}
}
