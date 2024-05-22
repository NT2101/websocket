package com.example.AppChat.Repository;

import com.example.AppChat.Entity.User;
import com.example.AppChat.Entity.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserGroupRepository extends JpaRepository<UserGroup, Long> {
    List<UserGroup> findByUserUsername(String username);

    List<UserGroup> findByUser(User user);
}
