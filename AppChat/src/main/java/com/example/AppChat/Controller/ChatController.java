package com.example.AppChat.Controller;

import com.example.AppChat.Entity.Message;
import com.example.AppChat.Repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/message")
    @SendTo("/chatroom/public")
    public Message receiveMessage(@Payload Message message){
        return messageRepository.save(message);
    }

    @MessageMapping("/private-message")
    public Message recMessage(@Payload Message message){
        simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(),"/private",message);
        System.out.println(message.toString());
        return messageRepository.save(message);
    }
    @MessageMapping("/group-message")
    public Message receiveGroupMessage(@Payload Message message) {
        System.out.println("Received message for group: " + message.getGroupName());
        simpMessagingTemplate.convertAndSend("/group" + message.getGroupName(), message);
        return messageRepository.save(message);
    }

}