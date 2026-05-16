package com.fileshare.controller;

import com.fileshare.discovery.DiscoveryService;
import com.fileshare.model.Device;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    @Autowired
    private DiscoveryService discoveryService;

    @GetMapping
    public ResponseEntity<Collection<Device>> getDevices() {
        return ResponseEntity.ok(discoveryService.getDiscoveredDevices());
    }
}
