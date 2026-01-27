package com.example.ebook.dev;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

import com.example.ebook.domain.CartRepository;
import com.example.ebook.domain.EbookRepository;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.domain.UserRepository;
import com.example.ebook.entity.Cart;
import com.example.ebook.entity.CartItem;
import com.example.ebook.entity.Ebook;
import com.example.ebook.entity.Order;
import com.example.ebook.entity.OrderItem;
import com.example.ebook.entity.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

/*
 * dev 프로필에서만 실행되는 초기 데이터 로더
 * 앱 부팅 시 H2에 샘플 이북 몇권을 주입
 * 이미 데이터가 있으면 아무것도 하지 않는다(중복방지)
 */
@Component
@Profile("dev")
public class DevDataLoader implements CommandLineRunner{

	private final EbookRepository ebookRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

    public DevDataLoader(EbookRepository ebookRepository,
                         CartRepository cartRepository,
                         OrderRepository orderRepository,
						 UserRepository userRepository,
						 PasswordEncoder passwordEncoder) {
        this.ebookRepository = ebookRepository;
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	@Transactional	//시드 전체를 한 트랜잭션으로
	public void run(String... args) {

		seedAdminUser();	//관리자 계정 시드(중복방지)
		seedEbookCarOrder();	//전자책/카트/주문 시드 (ebook기준 중복방지)

		System.out.println("Dev data loaded(dev profile)");
	}
	

	private void seedEbookCarOrder() {
		//1) 이미 데이터가 있으면 시드 주입 스킵
		if(ebookRepository.count() > 0) return;
		
		//-----------ebooks-------------
		Ebook e1 = new Ebook("스프링 입문", "홍길동", new BigDecimal("9900"), null, "ACTIVE");
		Ebook e2 = new Ebook("이펙티브 자바 요약", "조바", new BigDecimal("12900"), null, "ACTIVE");
		Ebook e3 = new Ebook("클린 아키텍처 한입", "로버트 C. 마틴", new BigDecimal("15000"), null, "ACTIVE");
		Ebook e4 = new Ebook("자바 기초", "이몽룡", new BigDecimal("20000"), null, "ACTIVE");
		Ebook e5 = new Ebook("리액트 처음부터", "임꺽정", new BigDecimal("18000"), null, "ACTIVE");		
		
		ebookRepository.save(e1);
		ebookRepository.save(e2);
		ebookRepository.save(e3);
		ebookRepository.save(e4);
		ebookRepository.save(e5);
		
		//----------cart----------------
		Cart cart = new Cart(1L);	//userId = 1
		CartItem ci = new CartItem(cart, e1, 1, e1.getPrice());
		cart.addItem(ci);
		cartRepository.save(cart);
		
		//------------order-------------
		Order order = new Order();
		order.setUserId(1L);
		order.setOrderNumber("ORD-DEMO");
		order.setStatus("PAID");
		order.setTotalAmount(e1.getPrice());
		order.setFinalAmount(e1.getPrice());
		order.setCreatedAt(LocalDateTime.now());
		orderRepository.save(order);
		
		OrderItem oi = new OrderItem(order, e1, e1.getPrice(), 1);
		oi.setSubTotal(e1.getPrice());
		order.addItem(oi);
		
		orderRepository.save(order);
		
		System.out.println("Dev data loaded: 3 ebooks, 1 order, 1 cart (userId=1)");
	}


	private void seedAdminUser() {
		boolean exists = userRepository.findByEmail("admin@test.com").isPresent();
		if(exists)
			return;

		userRepository.save(
		User.builder()
			.name("관리자")
			.email("admin@test.com")
			.password(passwordEncoder.encode("1234"))
			.role(User.Role.ADMIN)
			.build()
		);
	}

}
