package com.fileshare.discovery;

import com.fileshare.model.Device;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
@Slf4j
public class WebSocketEventListener {

    @Autowired
    private DiscoveryService discoveryService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        String sessionId = headerAccessor.getSessionId();
        
        String ip = "Unknown IP";
        if (sessionAttributes != null && sessionAttributes.containsKey("ip")) {
            ip = (String) sessionAttributes.get("ip");
        }
        
        // Generate a simple name for the web client
        String deviceName = "Mobile/Web Client (" + ip + ")";
        log.info("Received a new web socket connection from IP: {}", ip);
        
        discoveryService.addWebClient(sessionId, new Device(deviceName, ip, 80));
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        if (sessionId != null) {
            log.info("Web socket connection disconnected: {}", sessionId);
            discoveryService.removeWebClient(sessionId);
        }
    }
}
