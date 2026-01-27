package com.example.ebook.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ebook.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{
	
	//orderId로 찾아 List에 담아정렬ㄴ
	List<OrderItem> findByOrder_Id(Long orderId);
}
