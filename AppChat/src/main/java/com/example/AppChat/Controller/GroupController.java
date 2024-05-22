package com.example.AppChat.Controller;

import com.example.AppChat.Entity.Group;
import com.example.AppChat.Entity.User;
import com.example.AppChat.Entity.UserGroup;
import com.example.AppChat.Repository.GroupRepository;
import com.example.AppChat.Repository.UserGroupRepository;
import com.example.AppChat.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserGroupRepository userGroupRepository;

    @GetMapping("/user/{username}/groups")
    public List<Group> getUserGroups(@PathVariable String username) {
        // Lấy thông tin user từ username
        User user = userRepository.findByUsername(username);

        // Lấy danh sách các nhóm mà user tham gia
        List<UserGroup> userGroups = userGroupRepository.findByUser(user);

        // Lấy danh sách các nhóm từ userGroups và trả về
        return userGroups.stream().map(UserGroup::getGroup).collect(Collectors.toList());
    }

}
