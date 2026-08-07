package com.hrg.agripromomms.domain.product;

import org.springframework.data.jpa.repository.JpaRepository;

/** product 테이블 저장소입니다. */
public interface ProductRepository extends JpaRepository<Product, Long> {
}
