package com.hrg.agripromomms.domain.contact;

import com.hrg.agripromomms.domain.user.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 판매업자가 관리하는 MMS 수신 연락처입니다. */
@Getter
@Entity
@Table(name = "contact")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "con_num")
    private Long conNum;

    /** 이 연락처를 소유한 판매업자입니다. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_num", nullable = false)
    private UserEntity user;

    @Column(name = "con_name", nullable = false, length = 50)
    private String conName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "region", nullable = false, length = 100)
    private String region;

    @Column(name = "crop", length = 100)
    private String crop;
}
