package com.example.ebook.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderSummary(
    Long orderId,               //주문 PK
    String orderNumber,         //주문 번호
    String status,              //상태
    BigDecimal totalAmount,     //합계
    BigDecimal finalAmount,     //최종 결제금액
    LocalDateTime createdAt     //생성일시
) {}
