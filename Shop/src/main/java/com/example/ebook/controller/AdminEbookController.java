package com.example.ebook.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ebook.dto.EbookResponse;
import com.example.ebook.entity.Ebook;
import com.example.ebook.service.EbookService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController //JSON API 컨트롤러
@Validated  //파라미터/바디 검증
@RequestMapping("/admin/ebooks")    //프론트가 호출하는 경로와 일치
public class AdminEbookController {

    private final EbookService ebookService;

    public AdminEbookController(EbookService ebookService) {
        this.ebookService = ebookService;   //생성자 주입
    }

    @PostMapping    //POST /admin/ebooks
    @ResponseStatus(HttpStatus.CREATED) //201
    public EbookResponse create(@Valid @RequestBody EbookController.CreateRequest req) {
        Ebook saved = ebookService.create(
            req.title(),
            req.author(),
            req.price(),
            req.thumbnail(),
            req.status()
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
