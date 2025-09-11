package com.example.Ebook.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Ebook.entity.Ebook;

//기본 CRUD메서드는 JpaRepository가 제공, 메서드 이름으로 쿼리 자동 생성
public interface EbookRepository extends JpaRepository<Ebook, Long>{
	List<Ebook> findByStatusByIdDesc(String status);
	//상태값으로 필터링 후 id 내림차수능로 목록 조회
}
