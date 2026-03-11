package com.example.ebook.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.ebook.client.TossPaymentClient;
import com.example.ebook.domain.DownloadTokenRepository;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.entity.DownloadToken;
import com.example.ebook.entity.Order;

//스프링 컨테이너를 띄우지 않고 가짜 객체(Mock)만 사용해서 빠르게 테스트
@ExtendWith(MockitoExtension.class)
class OrderRefundServiceTest {

    @InjectMocks
    private OrderRefundService orderRefundService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private DownloadTokenRepository tokenRepository;

    @Mock
    private TossPaymentClient tossPaymentClient;

    @Test
    @DisplayName("결제 취소 성공: 주문 상태가 CANCELLED로 변경되고 토큰이 만료")
    void cancelAndRefundOrder_Success() {
        Long orderId = 1L;
        Order order = Order.builder()
                    .id(orderId)
                    .orderNumber("ORD-1234")
                    .status("PAID")
                    .build();

        DownloadToken token = new DownloadToken();

        ReflectionTestUtils.setField(token, "orderId", orderId);

        when(tokenRepository.findByOrderId(orderId)).thenReturn(List.of(token));
        
        //레포지토리와 외부 클라이언트가 어떻게 행동할지
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(tokenRepository.findByOrderId(orderId)).thenReturn(List.of(token));

        //토스 API 호출은 실제로 하지 않고 "성공했다 치고 아무거도 하지마라" 라고 설정
        doNothing().when(tossPaymentClient).cancelPayment(anyString(), anyString());

        //when (실행)
        orderRefundService.cancelAndRefundOrder(orderId, "단순변심");

        // then (검증)
        assertEquals("CANCELLED", order.getStatus(), "주문 상태가 CANCELLED로 변경되어야 합니다.");
        assertNotNull(order.getCanceledAt(), "취소 시간이 기록되어야 합니다.");

        // 토스 API 취소 메서드가 정확히 1번 호출되었는지 검증
        verify(tossPaymentClient, times(1)).cancelPayment("ORD-1234", "단순변심");
    }

    @Test
    @DisplayName("결제 취소 실패: 결제 완료(PAID) 상태가 아닌 경우 예외 발생")
    void cancelAndRefundOrder_Fail_NotPaid() {
        Long orderId = 2L;
        Order order = Order.builder()
                .id(orderId)
                .status("PENDING")
                .build(); //결제 전 상태로 세팅

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        //when, then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            orderRefundService.cancelAndRefundOrder(orderId, "단순변심");
        });

        assertEquals("결제 완료 상태의 주문만 취소할 수 있습니다.", exception.getMessage());

        //핵심 검증: 예외가 터졌으니 외부 토스 API는 절대 호출되지 말아야함
        verify(tossPaymentClient, never()).cancelPayment(anyString(), anyString());
    }
}
