package com.example.ebook.dto;

import java.math.BigDecimal;

import com.example.ebook.entity.Ebook;

/** 이북 응답 DTO (컨트롤러 밖, public top-level) */
public class EbookResponse {
    public Long id;
    public String title;
    public String author;
    public BigDecimal price;
    public String thumbnail;
    public String status;

    public static EbookResponse from(Ebook e) {
        EbookResponse r = new EbookResponse();
        r.id = e.getId();
        r.title = e.getTitle();
        r.author = e.getAuthor();
        r.price = e.getPrice();
        r.thumbnail = e.getThumbnailPath();
        r.status = e.getStatus();
        return r;
    }
}
