package com.example.ebook.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ebook.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long>{
	
	//Optional로 Order에 주문번호가 있는지 없느지 판단
	Optional<Order> findByOrderNumber(String orderNumber);
	
	//userId를 통해 찾아서 내림차순으로 정렬, 여러건이 나오니 List에 담음
	List<Order> findByUserIdOrderByIdDesc(Long userId);

	Optional<Order> findTopByUserIdAndStatusOrderByIdDesc(Long userId, String status);

	@Query("SELECT o FROM Order o " +
			"JOIN OrderItem oi ON oi.order = o " +
			"WHERE o.userId = :userId " +
			"AND oi.ebook.id = :ebookId " +
			"AND o.status = 'PENDING'")
	Optional<Order> findPendingOrder(@Param("userId") Long userId, @Param("ebookId") Long ebookId);

	boolean existByUserIdAndEbookIdAndStatus(Long userId, Long ebookId, String Status);
}
