package com.example.ebook.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.entity.Order;

@RestController
@RequestMapping("/admin/orders")
public class AdminOrderController {

    private final OrderRepository orderRepository;

    public AdminOrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    //관리자용: 모든 유저의 전체 주문 내역 조회
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        //실제로는 페이징(Pageable) 처리를 하는게 좋지만, 일단 전체 목록을 가져옴
        List<Order> allOrders = orderRepository.findAll();

        //데이터 바로 리턴
        return ResponseEntity .ok(allOrders);
    }
}
