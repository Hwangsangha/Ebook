package com.example.ebook.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/*
 * 장바구니 항목
 * cart, ebook은 유니크: 같은 책을 한 장바구니에 중복 담지 않음
 * 수량은 최소 1
 */
@Entity
@Table(name = "cart_item", uniqueConstraints = {
		@UniqueConstraint(name = "uq_cartitem_cart_ebook", columnNames = {"cart_id","ebook_id"})
})
public class CartItem {

	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	//소유자 장바구니
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "cart_id", nullable = false,
			foreignKey = @ForeignKey(name = "fk_ci_cart"))
	private Cart cart;
	
	//담긴 전자책
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ebook_id", nullable = false,
			foreignKey = @ForeignKey(name = "fk_ci_ebook"))
	private Ebook ebook;
	
	@Column(nullable = false)
	private int quantity = 1;
	
	@Column(name = "added_at")
	private LocalDateTime addedAt;
	
	protected CartItem() {}
	public CartItem(Cart cart, Ebook ebook, int quantity) {
		this.cart = cart;
		this.ebook = ebook;
		this.quantity = Math.max(1, quantity);
		this.addedAt = LocalDateTime.now();
		cart.touch();	//장바구니 갱신
	}
	
//---------------------------------도메인 동작------------------------------
	public void changeQuantity(int quantity) {
		this.quantity = Math.max(1, quantity);
		this.cart.touch();
	}
	
//--------------------------------getter/setter---------------------------
	public Long getId() {return id;}
	public Cart getCart() {return cart;}
	public void setCart(Cart cart) {this.cart = cart;}
	public Ebook getEbook() {return ebook;}
	public void setEbook(Ebook ebook) {this.ebook = ebook;}
	public int getQuantity() {return quantity;}
	public void setQuantity(int quantity) {changeQuantity(quantity);}
	public LocalDateTime getAddedAt() {return addedAt;}
	public void setAddedAt(LocalDateTime addedAt) {this.addedAt = addedAt;}
}
