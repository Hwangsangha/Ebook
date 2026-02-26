package com.example.ebook.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.dto.OrderDetail;
import com.example.ebook.entity.Order;
import com.example.ebook.service.AdminOrderService;

@RestController
@RequestMapping("/admin/orders")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    //관리자용: 모든 유저의 전체 주문 내역 조회
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        //서비스에 DTO 요청명령
        List<OrderDetail> allOrders = adminOrderService.getAllOrdersForAdmin();

        //데이터 바로 리턴
        return ResponseEntity .ok(allOrders);
    }
}
