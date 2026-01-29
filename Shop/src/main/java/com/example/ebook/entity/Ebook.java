package com.example.ebook.entity;

import java.math.BigDecimal;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "ebook",
		indexes = {
			@Index(name = "idx_ebook_status", columnList = "status")
		})
public class Ebook {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, length = 255)
	private String title;
	
	@Column(length = 255)
	private String author;
	
	@Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(length = 20)
    private String status; // ACTIVE/INACTIVE/DRAFT 등

    @Column(name = "thumbnail_path", length = 500)
    private String thumbnailPath;

    //다운로드 파일 경로
    @Column(name = "file_path")
    private String filePath;

    //원본 파일명
    @Column(name = "original_file_name")
    private String originalFileName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    // getter/setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getThumbnailPath() { return thumbnailPath; }
    public void setThumbnailPath(String thumbnailPath) { this.thumbnailPath = thumbnailPath; }

    public String getFilePath() {return filePath;}
    public void setFilePath(String filePath) {this.filePath = filePath;}

    public String getOriginalFileName() {return originalFileName;}
    public void setOriginalFileName(String originalFileName) {this.originalFileName = originalFileName;}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    
    public Ebook(String title, String author, BigDecimal price, String status) {
        this.title = title;
        this.author = author;
        this.price = price;
        this.status = status;
        this.createdAt = Instant.now();

        //명시적 null 초기화
        this.thumbnailPath = null;
        this.filePath = null;
        this.originalFileName = null;
    }
    
    public Ebook() {}
}
