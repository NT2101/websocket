package com.example.AppChat.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Setter
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "ChatGroup")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Mối quan hệ nhiều-nhiều giữa Room và User thông qua một bảng trung gian
    @ManyToMany
    @JoinTable(
            name = "UserGroup",
            joinColumns = @JoinColumn(name = "Group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> users;
}
