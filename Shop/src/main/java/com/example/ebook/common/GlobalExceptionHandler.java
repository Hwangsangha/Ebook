package com.example.ebook.common;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

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
	 * 마지막 안전망(DEV 진단용):
	 * - 콘솔에는 전체 스택 로그
	 * - 응답 바디 message에 "예외클래스: 메시지"를 담아 브라우저에서 바로 원인 확인
	 *   ※ 운영 전환 전에 이 출력은 반드시 지울 것
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleUnhandled(Exception ex, HttpServletRequest req) {	//예외 + 요청정보
	    log.error("UNHANDLED @ {} {} | type={} | msg={}",
				req.getMethod(), req.getRequestURI(),
				ex.getClass().getName(), ex.getMessage(),
				ex); // 핵심: e를 마지막 인자로 넣어 스택트레이스까지 찍음

	    Map<String, Object> body = new LinkedHashMap<>();	//응답 바디 구성
		body.put("path", req.getRequestURI());		//어떤 API에서 터졌는지
		body.put("method", req.getMethod());		//HTTP 메서드
		body.put("error", ex.getClass().getSimpleName());	//예외 타입
		body.put("message", ex.getMessage());		//예외 메시지
	
	    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}
	
	/**
	 * ResponseStatusException 전용 처리
	 * - 서비스/컨트롤러에서 명시한 상태코드(예: 400, 404)를 그대로 유지해서 응답한다.
	 * - 지금 500으로 뭉개지는 문제의 원인 제거.
	 */
	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ErrorResponse> handleResponseStatus(
			ResponseStatusException ex,
			HttpServletRequest req
	){
		//콘솔에는 원인 로그 남김
		log.warn("RSE @ {} {} -> {}", req.getMethod(), req.getRequestURI(), ex.getStatusCode(), ex);
		
		//원인이 null일 수 있어 기본 메시지 보정
		String msg = ex.getReason() != null ? ex.getReason() : ex.getMessage();
		
		ErrorResponse body = ErrorResponse.of(
				HttpStatus.valueOf(ex.getStatusCode().value()),
				msg,
				req.getRequestURI(),
				List.of()
		);
		return ResponseEntity.status(ex.getStatusCode()).body(body);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<Map<String, Object>> handleBadJson(Exception ex, HttpServletRequest req) {
		log.warn("BAD JSON @ {} {} : {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
		return ResponseEntity.badRequest().body(Map.of(
			"error", "BAD_REQUEST",
			"message", "요청 JSON/Enum/타입 변환 실패"
		));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Map<String, Object>> handleConstraint(Exception ex, HttpServletRequest req) {
		return ResponseEntity.status(409).body(Map.of(
			"error", "CONSTRAINT_VIOLATION",
			"message", "DB 제약조건 위반"
		));
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<Map<String, Object>> handleNotFound(Exception ex, HttpServletRequest req) {
		log.warn("NOT FOUND @ {} {} : {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
		return  ResponseEntity.status(404).body(Map.of(
			"error", "NOT_FOUND",
			"message", "대상이 존재하지 않음"
		));
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
