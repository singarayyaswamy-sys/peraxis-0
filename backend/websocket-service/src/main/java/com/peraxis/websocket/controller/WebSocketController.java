package com.peraxis.websocket.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/websocket")
@CrossOrigin(origins = "*")
public class WebSocketController {
    
    @GetMapping("/health")
    public String health() {
        return "WebSocket Service is running";
    }
}