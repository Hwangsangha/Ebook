package com.example.ebook.client;

import java.util.Base64;
import java.util.Map;

import com.example.ebook.controller.AdminEbookController;
import com.example.ebook.controller.AdminOrderController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class TossPaymentClient {

    private final AdminOrderController adminOrderController;

    private final AdminEbookController adminEbookController;

    @Value("${toss.secret-key:test_sk_DpexMgkW36GvjwPwJNjEVGbR5ozO}")
    private String tossSecretKey;

    TossPaymentClient(AdminEbookController adminEbookController, AdminOrderController adminOrderController) {
        this.adminEbookController = adminEbookController;
        this.adminOrderController = adminOrderController;
    }

    public void cancelPayment(String orderNumber, String cancelReason) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();

        //토스 인증 헤더 세팅
        String encodedKey = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes());
        headers.set("Authorization", "Basic " + encodedKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        //취소 사유 파라미터 세팅
        Map<String, Object> tossRequest = Map.of(
            "cancelReason", cancelReason
        );

        //paymentKey 대신 orderNumber로 취소하는 똑똑한 API 주소
        String url = "http://api.tosspayments.com/v1/payments/orders" + orderNumber + "/cancel";

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                url,
                new HttpEntity<>(tossRequest, headers),
                String.class
            );

            //성공(200)이 아니면 예외를 던져서 DB트랜잭션도 롤백되도록 유도
            if(!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("토스 결제 취소 실패: " + response.getBody());
            }   
        } catch(Exception e) {
            //통신 에러 발생 시 서비스 로직에 에러를 던짐
            throw new RuntimeException("결제 취소 통신 중 에러 발생: " + e.getMessage());
        }
    }
}
