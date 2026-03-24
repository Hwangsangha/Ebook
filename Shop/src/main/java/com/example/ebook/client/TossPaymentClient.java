package com.example.ebook.client;

import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class TossPaymentClient {

    @Value("${toss.secret-key:test_sk_DpexMgkW36GvjwPwJNjEVGbR5ozO}")
    private String tossSecretKey;

    public void cancelPayment(String orderNumber, String cancelReason) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();

        //토스 인증 헤더 세팅
        String encodedKey = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes());
        headers.set("Authorization", "Basic " + encodedKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        

        try {

            //주문 번호로 토스 서버에 조회해서 paymentKey 알아내기`
            String getUrl = "https://api.tosspayments.com/v1/payments/orders/" + orderNumber;

            HttpEntity<Object> getRequestEntity = new HttpEntity<>(null, headers);

            ResponseEntity<Map> getResponse = restTemplate.exchange(
                getUrl,
                HttpMethod.GET,
                getRequestEntity,
                Map.class
            );

            //성공(200)이 아니면 예외를 던져서 DB트랜잭션도 롤백되도록 유도
            if(!getResponse.getStatusCode().is2xxSuccessful() || getResponse.getBody() == null) {
                throw new RuntimeException("토스 결제 취소 실패");
            }

            //응답 데이터에서 paymentKey 뺴오기
            String paymentKey = (String) getResponse.getBody().get("paymentKey");

            //알아낸 paymentKey로 취소요청 날리기
            String cancelUrl = "https://api.tosspayments.com/v1/payments/" + paymentKey + "/cancel";

            Map<String, Object> tossRequest = Map.of("cancelReason", cancelReason);

            ResponseEntity<String> cancelResponse = restTemplate.postForEntity(
                cancelUrl,
                new HttpEntity<>(tossRequest, headers),
                String.class
            );
        } catch(Exception e) {
            //통신 에러 발생 시 서비스 로직에 에러를 던짐
            e.printStackTrace();
            throw new RuntimeException("결제 취소 통신 중 에러 발생: " + e.getMessage());
        }
    }
}
