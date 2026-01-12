package com.example.ebook.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
    Long ebookId,
    String titleSnap,
    int quantity,
    BigDecimal subTotal
) {}