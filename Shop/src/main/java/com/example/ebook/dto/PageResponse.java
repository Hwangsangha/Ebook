package com.example.ebook.dto;

import java.util.List;

/** 표준 페이지 응답 DTO */
public class PageResponse<T> {
    public List<T> items;
    public int page;
    public int size;
    public long total;

    public PageResponse(List<T> items, int page, int size, long total) {
        this.items = items; this.page = page; this.size = size; this.total = total;
    }
    public static <T> PageResponse<T> of(List<T> items, int page, int size, long total) {
        return new PageResponse<>(items, page, size, total);
    }
}