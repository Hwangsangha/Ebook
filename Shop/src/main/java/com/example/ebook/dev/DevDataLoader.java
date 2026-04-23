package com.example.ebook.dev;

import com.example.ebook.controller.AdminEbookController;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

import com.example.ebook.domain.CartRepository;
import com.example.ebook.domain.EbookRepository;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.domain.UserRepository;
import com.example.ebook.entity.Ebook;
import com.example.ebook.entity.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

/*
 * dev 프로필에서만 실행되는 초기 데이터 로더
 * 앱 부팅 시 H2에 샘플 이북 몇권을 주입
 * 이미 데이터가 있으면 아무것도 하지 않는다(중복방지)
 */
@Component
//@Profile("dev")
public class DevDataLoader implements CommandLineRunner{

	private final AdminEbookController adminEbookController;

    private final EbookRepository ebookRepository;

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

    public DevDataLoader(EbookRepository ebookRepository,
                         CartRepository cartRepository,
                         OrderRepository orderRepository,
						 UserRepository userRepository,
						 PasswordEncoder passwordEncoder, AdminEbookController adminEbookController) {
        this.ebookRepository = ebookRepository;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
        this.adminEbookController = adminEbookController;
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
		if(ebookRepository.count() > 10) return;

		System.out.println("대량 데이터 시딩 시작");
		List<Ebook> bulkEbooks = new ArrayList<>();
		
		//-----------ebooks-------------
		for(int i = 1; i <= 1000; i++) {
			Ebook ebook = new Ebook(
				"성능 테스트용 책" + i,
				"작가 " + (i % 10),		//작가 10명 고정
				new BigDecimal(10000 + (i * 10)),
				"ACTIVE"
			);
			ebook.setCategory(i % 5 == 0 ? "IT" : "NOVEL");	//카테고리 분산
			bulkEbooks.add(ebook);

			//메모리 터질수 있으니 500건마다 나눠서 저장(Flush)
			if(i % 500 == 0) {
				ebookRepository.saveAll(bulkEbooks);
				bulkEbooks.clear();
			}
		}

		//남은 데이터 저장
		if(!bulkEbooks.isEmpty()) {
			ebookRepository.saveAll(bulkEbooks);
		}

		System.out.println("1000건의 테스트 데이터 모두 주입 완료");
		
		/*//----------cart----------------
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
		*/
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
