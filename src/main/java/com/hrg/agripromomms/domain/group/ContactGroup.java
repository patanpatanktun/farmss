package com.hrg.agripromomms.domain.group;

import com.hrg.agripromomms.domain.user.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 연락처 그룹 이름과 설명을 저장합니다.
 * 현재 제공된 DB에는 contact와 contact_group을 연결하는 중간 테이블이 없습니다.
 */
@Getter
@Entity
@Table(name = "contact_group")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContactGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_num")
    private Long groupNum;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_num", nullable = false)
    private UserEntity user;

    @Column(name = "group_name", nullable = false, length = 100)
    private String groupName;

    @Column(name = "con_description", columnDefinition = "TEXT")
    private String description;
}
