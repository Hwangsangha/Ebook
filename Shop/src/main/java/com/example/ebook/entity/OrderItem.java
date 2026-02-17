package com.example.ebook.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/*
 * 주문상세
 * ebook의 제목/가격을 주문 시점 스냅샷으로 보관
 * subTotal = priceSnap * quantity
 */
@Entity
@Table(
		name = "order_item",
		indexes = {@Index(name = "idx_order_item_ord", columnList = "order_id")}
		)
public class OrderItem {

	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "order_id", nullable = false,
				foreignKey = @ForeignKey(name = "fk_oi_order"))
	private Order order;
	
	//참조용 원본 이북
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ebook_id", nullable = false,
				foreignKey = @ForeignKey(name = "fk_oi_ebook"))
	private Ebook ebook;
	
	@Column(name = "title_snap", nullable = false, length = 255)
	private String titleSnap;
	
	@Column(name = "price_snap", nullable = false, precision = 12, scale = 2)
	private BigDecimal priceSnap;
	
	@Column(nullable = false)
	private int quantity;
	
	@Column(name = "sub_total", nullable = false, precision = 12, scale = 2)
	private BigDecimal subTotal;
	
	public OrderItem() {}
	
	public OrderItem(Ebook ebook, String titleSnap, BigDecimal priceSnap, int quantity) {
		this.ebook = ebook;
		this.titleSnap = titleSnap;
		this.priceSnap = priceSnap;
		this.quantity = Math.max(1, quantity);
		this.subTotal = priceSnap.multiply(BigDecimal.valueOf(this.quantity));
	}
	
	public OrderItem(Order order, Ebook ebook, BigDecimal price, int quantity) {
		this.order = order;
		this.ebook = ebook;
		this.titleSnap = ebook.getTitle();
		this.priceSnap = price;
		this.quantity = Math.max(1, quantity);
		this.subTotal = price.multiply(BigDecimal.valueOf(this.quantity));
	}

	//내부 일관성 유지
	public void setOrder(Order order) {
		this.order = order;
	}
	public void setPriceSnap(BigDecimal priceSnap) {
		this.priceSnap = priceSnap;
		this.subTotal = priceSnap.multiply(BigDecimal.valueOf(this.quantity));
	}
	public void setQuantity(int quantity) {
		this.quantity = Math.max(1, quantity);
		this.subTotal = this.priceSnap.multiply(BigDecimal.valueOf(this.quantity));
	}
	
	//getter
	public Long getId() {return id;}
	public Order getOrder() {return order;}
	public Ebook getEbook() {return ebook;}
	public void setEbook(Ebook ebook) {this.ebook = ebook;}
	public String getTitleSnap() {return titleSnap;}
	public void setTitleSnap(String titleSnap) {this.titleSnap = titleSnap;}
	public BigDecimal getPriceSnap() {return priceSnap;}
	public int getQuantity() {return quantity;}
	public BigDecimal getSubTotal() {return subTotal;}
	public void setSubTotal(BigDecimal price) {this.subTotal = subTotal;}
}
