package com.example.ebook.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.ebook.controller.AdminEbookController;
import com.example.ebook.controller.AdminOrderController;
import com.example.ebook.domain.DownloadTokenRepository;
import com.example.ebook.domain.OrderRepository;
import com.example.ebook.entity.DownloadToken;
import com.example.ebook.entity.Order;

@Service
public class OrderRefundService {

    private final AdminOrderController adminOrderController;

    private final AdminEbookController adminEbookController;

    private final OrderRepository orderRepository;
    private final DownloadTokenRepository tokenRepository;
    //private final TossPaymentClient tossPaymentClient; //토스 API 통신용

    public OrderRefundService(OrderRepository orderRepository, DownloadTokenRepository tokenRepository, AdminEbookController adminEbookController, AdminOrderController adminOrderController) {
        this.orderRepository = orderRepository;
        this.tokenRepository = tokenRepository;
        this.adminEbookController = adminEbookController;
        this.adminOrderController = adminOrderController;
    }

    @Transactional
    public void cancelAndRefundOrder(Long orderId, String cancelReason) {
        //1. 주문 조회 및 상태 검증
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

       if(!"PAID".equals(order.getStatus())) {
            throw new IllegalStateException("결제 완료 상태의 주문만 취소할 수 있습니다.");
       }

       //2.외부 API 호출(토스페이먼츠 결제 취소)
       //tossPaymentClient.cancelPayment(order.getOrderNumber(), cancelReason);
       //에러 시 DB업데이트 로직은 실행되지 않고 롤백됨

       //내부 DB: 주문 상태를 취소로 변경
       order.setStatus("CANCELLED");
       order.setCanceledAt(LocalDateTime.now());

       //내부 DB: 해당 주문으로 발급된 모든 다운로드 토큰 찾아서 즉시 만료 처리(핵심!)
       List<DownloadToken> tokens = tokenRepository.findByOrderId(order.getId());
       for(DownloadToken token : tokens) {
        token.expireNow();
       }

       //더티 체킹(Dirty Checking) 덕분에 별도로 repository.save()를 안해도
       // 트랜잭션이 끝날 떄 Order의 상태와 Token의 만료 시간이 DB에 자동으로 UPDATE

    }
}
