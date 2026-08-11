package com.farmms.backend.domain.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    /**
     * 로그인한 회원의 상품을
     * 상품명과 카테고리 조건으로 검색합니다.
     */
    @Query("""
            SELECT product
            FROM Product product
            WHERE product.userNum = :userNum
              AND (
                    :keyword IS NULL
                    OR product.proName LIKE CONCAT(
                            '%',
                            :keyword,
                            '%'
                    )
              )
              AND (
                    :category IS NULL
                    OR product.category = :category
              )
            ORDER BY product.proNum DESC
            """)
    List<Product> search(
            @Param("userNum") Long userNum,
            @Param("keyword") String keyword,
            @Param("category") String category
    );

    /**
     * 로그인한 회원의 전체 상품을 최신순으로 조회합니다.
     *
     * 회원 탈퇴 시 해당 회원의 상품을 삭제하는 데 사용합니다.
     */
    List<Product> findAllByUserNumOrderByProNumDesc(
            Long userNum
    );

    /**
     * 상품 번호와 회원 번호가 모두 일치하는 상품을 조회합니다.
     */
    Optional<Product> findByProNumAndUserNum(
            Long proNum,
            Long userNum
    );

    /**
     * 로그인한 회원이 등록한 전체 상품 수를 조회합니다.
     */
    long countByUserNum(Long userNum);
}