package com.example.ebook.common;

import java.time.OffsetDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.ebook.common.GlobalExceptionHandler.ErrorResponse.ValidationError;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

/*
 * 전역예외 처리기
 * -컨트롤러에서 발생하는 예외를 잡아 표준 JSON 응다븡로 변환
 * -유효성 검증 실패(400), 잘못된 요청(400), 그 외 서버 오류(500)를 구분
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
	
	/**
	 * 마지막 안전망: 예기치 못한 서버 오류를 잡아
	 * 1) 콘솔/파일에 전체 스택 로그 남기고
	 * 2) 클라이언트엔 표준화된 500 응답을 돌려준다.
	 */
	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	/*
	 * NotBlank, NotNull 등 RequestBody 검증 실패
	 * 예: CreateRequest에서 title 누락 등
	 */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handlerMethodArgumentNotValid(
			MethodArgumentNotValidException ex,
			HttpServletRequest req
	){
		List<ValidationError> details = ex.getBindingResult().getFieldErrors()
				.stream()
				.map(this::toValidationError)
				.toList();
		
		ErrorResponse body = ErrorResponse.of(
				HttpStatus.BAD_GATEWAY,
				"Validation failed",
				req.getRequestURI(),
				details);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}
	/*
	 * 서비스 계층에서 던진 잘못도니 요청(비즈니스 검증 실패 등)
	 */
	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ErrorResponse> handleConstraintViolation(
			ConstraintViolationException ex,
			HttpServletRequest req
	){
		//메시지만 단순히 담는다(필요하면 파싱해서 필드명 추출 가능)
		ErrorResponse body = ErrorResponse.of(
				HttpStatus.BAD_REQUEST,
				ex.getMessage(),
				req.getRequestURI(),
				List.of()
		);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}
	
	/**
	 * 컨트롤러에서 빠져나온 모든 미처리 예외 처리
	 * - 로그: 에러 레벨로 HTTP 메서드/URI/스택트레이스 기록
	 * - 응답: 500 + 표준 에러 바디(ErrorResponse)
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleAny(Exception ex, HttpServletRequest req) {
	    log.error("UNHANDLED @ {} {}", req.getMethod(), req.getRequestURI(), ex); // 전체 스택 로그
	    ErrorResponse body = ErrorResponse.of(
	            HttpStatus.INTERNAL_SERVER_ERROR,
	            "Internal server error",
	            req.getRequestURI(),
	            List.of()
	    );
	    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}

	
	
	private ValidationError toValidationError(FieldError fe) {
		return new ValidationError(fe.getField(), fe.getDefaultMessage(), String.valueOf(fe.getRejectedValue()));
	}
	
//	----------------------------------응답모델------------------------------------
	
	/*
	 * 표준 에러 응답 바디
	 */
	public static class ErrorResponse{
		public final String timestamp;		//오류 발생 시각
        public final String path;			//요쳥 URI
        public final int status;			//HTTP상태코드
        public final String error;			//상태요약
        public final String message;		//에러 메시지
        public final List<ValidationError> validationErrors;	//필드별 검증 오류 상세
        
        private ErrorResponse(String path, int status, String error, String message, List<ValidationError> validationErrors) {
        	this.timestamp = OffsetDateTime.now().toString();
        	this.path = path;
        	this.status = status;
        	this.error = error;
        	this.message = message;
        	this.validationErrors = validationErrors;
        }
        
        public static ErrorResponse of(HttpStatus status, String message, String path, List<ValidationError> validationErrors) {
        	return new ErrorResponse(path, status.value(), status.getReasonPhrase(), message, validationErrors);
        }
        
        //단일 필드 검증 오류정
        public static class ValidationError{
        	public final String field;
        	public final String message;
        	public final String rejectedValue;
        	
        	public ValidationError(String field, String message, String rejectedValue) {
        		this.field = field;					//필드명
        		this.message = message;				//오류메시지
        		this.rejectedValue = rejectedValue;	//거부된 값(문자열 반환)
        	}
        	
        }
	}
}
