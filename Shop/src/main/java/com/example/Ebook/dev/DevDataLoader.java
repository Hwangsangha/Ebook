package com.example.Ebook.dev;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
/*
 * dev 프로필에서만 실행되는 초기 데이터 로더
 * 앱 부팅 시 H2에 샘플 이북 몇권을 주입
 * 이미 데이터가 있으면 아무것도 하지 않는다(중복방지)
 */

import com.example.Ebook.domain.EbookRepository;
import com.example.Ebook.service.EbookService;
@Component
@Profile("dev")
public class DevDataLoader implements CommandLineRunner{

	private final EbookRepository repo;		//현재 데이터 존재 여부 확인용
	private final EbookService service;		//생성 규칙(검증/기본값)은 서비스 로직을 그대로 사용
	
	public DevDataLoader(EbookRepository repo, EbookService servcie) {
		this.repo = repo;
		this.service = servcie;
	}
	
	@Override
	public void run(String...args) {
		//1) 이미 데이터가 있으면 시드 주입 스킵
		if(repo.count() > 0) return;
		
		//2) 샘플 데이터 주입(검증/기본값은 서비스에서 처리)
		service.create("스프링 입문", "홍길동", new BigDecimal("9900"), null, "ACTIVE");
		service.create("이펙티브 자바 요약", "조바", new BigDecimal("12900"), null, "ACTIVE");
		service.create("클린 아키텍처 한입", "로버트 C. 마틴", new BigDecimal("15000"), null, "ACTIVE");
	}
}
