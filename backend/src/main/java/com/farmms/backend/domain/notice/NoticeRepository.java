package com.farmms.backend.domain.notice;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    @Query("""
            SELECT notice
            FROM Notice notice
            WHERE :keyword IS NULL
               OR LOWER(notice.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(notice.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY notice.createDate DESC, notice.boardNum DESC
            """)
    List<Notice> search(@Param("keyword") String keyword);
}
