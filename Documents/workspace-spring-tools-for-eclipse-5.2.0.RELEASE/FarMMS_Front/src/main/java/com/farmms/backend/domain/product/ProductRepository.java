package com.farmms.backend.domain.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    /**
     * 로그인한 회원의 상품을 상품명과 카테고리 조건으로 검색합니다.
     */
    @Query("""
            SELECT p
            FROM Product p
            WHERE p.userNum = :userNum
              AND (
                    :keyword IS NULL
                    OR p.proName LIKE CONCAT('%', :keyword, '%')
              )
              AND (
                    :category IS NULL
                    OR p.category = :category
              )
            ORDER BY p.proNum DESC
            """)
    List<Product> search(
            @Param("userNum") Long userNum,
            @Param("keyword") String keyword,
            @Param("category") String category
    );

    /**
     * 상품 번호와 회원 번호가 모두 일치하는 상품을 조회합니다.
     */
    Optional<Product> findByProNumAndUserNum(
            Long proNum,
            Long userNum
    );
}