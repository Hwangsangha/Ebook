package com.example.ebook.domain;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ebook.entity.Ebook;

//기본 CRUD메서드는 JpaRepository가 제공, 메서드 이름으로 쿼리 자동 생성
public interface EbookRepository extends JpaRepository<Ebook, Long>{
	/**
     * 상태값으로 필터링 후 id 내림차순 목록 조회
     * 예: findByStatusOrderByIdDesc("ACTIVE")
     */
    List<Ebook> findByStatusOrderByIdDesc(String status);

    /**
     * 상태값 + 페이징 조회
     * 예: findByStatus("ACTIVE", PageRequest.of(0,10))
     */
    Page<Ebook> findByStatus(String status, Pageable pageable);
    
    Page<Ebook> findByStatusAndTitleContainingIgnoreCase(String status, String title, Pageable pageable);
}
