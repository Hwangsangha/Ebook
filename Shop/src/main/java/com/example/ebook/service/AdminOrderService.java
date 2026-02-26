package com.example.ebook.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ebook.domain.OrderRepository;
import com.example.ebook.dto.OrderDetail;
import com.example.ebook.dto.OrderLine;
import com.example.ebook.entity.Order;

@Service
@Transactional(readOnly = true)
public class AdminOrderService {

    private final OrderRepository orderRepository;

    public AdminOrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<OrderDetail> getAllOrdersForAdmin() {
        //DB에서 일단 Order엔티티들을 다 가져옴
        List<Order> orders = orderRepository.findAll();

        //세션이 살아있는 상태에서 Order엔티티를 OrderDetail DTO로 변환
        return orders.stream()
                .map(this::convertToOrderDetail)
                .collect(Collectors.toList());
    }

    private OrderDetail convertToOrderDetail(Order order) {
        List<OrderLine> orderLines = order.getItems().stream()
                .map(item -> new OrderLine(
                        item.getEbook().getId(),
                        item.getTitleSnap(),
                        item.getPriceSnap(),
                        item.getQuantity(),
                        item.getSubTotal()
                    ))
                    .collect(Collectors.toList());

        return new OrderDetail(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getFinalAmount(),
                order.getCreatedAt(),
                orderLines
        );
    }
}
