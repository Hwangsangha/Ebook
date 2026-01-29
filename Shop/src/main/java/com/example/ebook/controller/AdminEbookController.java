package com.example.ebook.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.ebook.common.FileStore;
import com.example.ebook.dto.EbookResponse;
import com.example.ebook.dto.PageResponse;
import com.example.ebook.entity.Ebook;
import com.example.ebook.service.EbookService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.io.IOException;
import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController //JSON API 컨트롤러
@Validated  //파라미터/바디 검증
@RequestMapping("/admin/ebooks")    //프론트가 호출하는 경로와 일치
public class AdminEbookController {

    private final EbookService ebookService;
    private final FileStore fileStore;

    public AdminEbookController(EbookService ebookService, FileStore fileStore) {
        this.ebookService = ebookService;   //생성자 주입
        this.fileStore = fileStore;
    }

    @GetMapping //GET /admin/ebooks
    public PageResponse<EbookResponse> list(
        @RequestParam(name = "page", defaultValue = "0")
        @Min(value = 0, message = "page는 0 이상이어야 합니다.")
        int page, //페이지 번호
        @RequestParam(name = "size", defaultValue = "50")
        @Min(value = 1, message = "size는 1 이상이어야 합니다.")
        @Max(value = 200, message = "size는 200이하여야 합니다.")
        int size, //페이지 크기
        @RequestParam(name = "status", required = false)
        String status //상태 필터(선택): ACTIVE/INACTIVE/SOLD_OUT
    ) {
        //최신순 정렬
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        //조회 결과
        Page<Ebook> pageResult;

        //status 정규화
        String s = (status == null) ? "" : status.trim().toUpperCase();
        if(s.isBlank() || s.equals("ALL")) {    //status 없거나 ALL이면
            //전체 조회
            pageResult = ebookService.listAllPage(pageable);
        } else {
            //상태별 조회
            pageResult = ebookService.listByStatusPage(s, pageable);
        }
        return PageResponse.of(//PageResponse로 변환
                //엔티티 -> DTO
                pageResult.getContent().stream().map(EbookResponse::from).toList(),
                pageResult.getNumber(), //현재 페이지
                pageResult.getSize(),   //페이지 크기
                pageResult.getTotalElements()   //전체 개수
        );
    }

    @PostMapping    //POST /admin/ebooks
    @ResponseStatus(HttpStatus.CREATED) //201
    public EbookResponse create(
            @RequestParam("title") String title,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam("price") BigDecimal price,
            @RequestParam("status") String status,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException{
        
        //파일 저장(FileStore 위임)
        String thumbnailPath = fileStore.storeFile(thumbnail);
        String filePath = fileStore.storeFile(file);
        String originalFileName = (file != null) ? file.getOriginalFilename() : null;
        
        //서비스 호출
        Ebook saved = ebookService.create(
            title,
            author,
            price,
            status,
            thumbnailPath,
            filePath,
            originalFileName
        );
        return EbookResponse.from(saved);
    }
    
    @PatchMapping("/{id}")  //PATCH /admin/ebooks/{id}
    public EbookResponse update(@PathVariable(name = "id") Long id,
                                @Valid @RequestBody EbookController.UpdateRequest req) {
        Ebook updated = ebookService.update(
            id,
            req.title(),
            req.author(),
            req.price(),
            req.thumbnail(),
            req.status()
        );
                                    
        return EbookResponse.from(updated); //DTO 변환
    }

    @DeleteMapping("/{id}") // DELETE /admin/ebooks/{id}
    @ResponseStatus(HttpStatus.NO_CONTENT)  //204
    public void delete(@PathVariable(name = "id") Long id) {
        ebookService.delete(id);
    }
}
