package com.example.ebook.controller;

import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.ebook.domain.OrderRepository;
import com.example.ebook.entity.Order;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final OrderRepository orderRepository;

    //토스 시크릿 키
    @Value("${toss.secret0key:test_sk_DpexMgkW36GvjwPwJNjEVGbR5ozO}")
    private String tossSecretKey;

    public PaymentController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, Object> payload) {
        String paymentKey = (String) payload.get("paymentKey");
        String orderId = (String) payload.get("orderId");
        Number amountNumber = (Number) payload.get("amount");
        Long amount = amountNumber.longValue();

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();

        String encodedKey = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes());
        headers.set("Authorization", "Basic " + encodedKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> tossRequest = Map.of(
            "paymentKey", paymentKey,
            "orderId", orderId,
            "amount", amount
        );

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.tosspayments.com/v1/payments/confirm",
                new HttpEntity<>(tossRequest, headers),
                Map.class);
            if(response.getStatusCode() == HttpStatus.OK) {
                //PENDING을 PAID로 바꿈
                Order order = orderRepository.findByOrderNumber(orderId)
                        .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));
                
                order.setStatus("PAID");
                orderRepository.save(order);
                
                return ResponseEntity.ok().body(Map.of("message", "결제 성공"));
            } else {
                return ResponseEntity.status(400).body(Map.of("message", "결제 승인 실패"));
            }
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("message", "토스 승인 중 오류: " + e.getMessage()));
        }
    }
}
