package com.example.AppChat.Controller;

import com.example.AppChat.Entity.User;
import com.example.AppChat.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        // Find the user by username
        User userFromDB = userRepository.findByUsername(user.getUsername());

        // Check if the user exists and the password matches
        if (userFromDB != null && user.getPassword().equals(userFromDB.getPassword())) {
            return "Đăng nhập thành công!";
        } else {
            return "Tên người dùng hoặc mật khẩu không chính xác!";
        }
    }
}