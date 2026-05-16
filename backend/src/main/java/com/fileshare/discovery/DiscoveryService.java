package com.fileshare.discovery;

import com.fileshare.model.Device;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceInfo;
import javax.jmdns.ServiceListener;
import java.io.IOException;
import java.net.InetAddress;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class DiscoveryService {

    private JmDNS jmdns;
    private static final String SERVICE_TYPE = "_fileshare._tcp.local.";
    private final Map<String, Device> discoveredDevices = new ConcurrentHashMap<>();

    @Value("${server.port:8080}")
    private int port;

    @Value("${spring.application.name:lan-file-share}")
    private String appName;

    private final Map<String, Device> webClients = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            // Bind to local host address
            InetAddress localHost = InetAddress.getLocalHost();
            jmdns = JmDNS.create(localHost);

            // Register this service
            String serviceName = appName + "-" + localHost.getHostName();
            ServiceInfo serviceInfo = ServiceInfo.create(SERVICE_TYPE, serviceName, port, "LAN File Share System");
            jmdns.registerService(serviceInfo);
            log.info("Registered mDNS service: {} on port {}", serviceName, port);

            // Add a listener to discover other devices
            jmdns.addServiceListener(SERVICE_TYPE, new ServiceListener() {
                @Override
                public void serviceAdded(ServiceEvent event) {
                    log.info("Service added: {}", event.getName());
                    jmdns.requestServiceInfo(event.getType(), event.getName(), 1);
                }

                @Override
                public void serviceRemoved(ServiceEvent event) {
                    log.info("Service removed: {}", event.getName());
                    discoveredDevices.remove(event.getName());
                }

                @Override
                public void serviceResolved(ServiceEvent event) {
                    log.info("Service resolved: {}", event.getInfo());
                    ServiceInfo info = event.getInfo();
                    String[] hostAddresses = info.getHostAddresses();
                    if (hostAddresses != null && hostAddresses.length > 0) {
                        String ip = hostAddresses[0];
                        // Don't add ourselves
                        if (!ip.equals(localHost.getHostAddress())) {
                            Device device = new Device(event.getName(), ip, info.getPort());
                            discoveredDevices.put(event.getName(), device);
                        }
                    }
                }
            });

        } catch (IOException e) {
            log.error("Failed to initialize JmDNS", e);
        }
    }

    @PreDestroy
    public void cleanup() {
        if (jmdns != null) {
            jmdns.unregisterAllServices();
            try {
                jmdns.close();
            } catch (IOException e) {
                log.error("Error closing JmDNS", e);
            }
        }
    }

    public void addWebClient(String sessionId, Device device) {
        // Filter out localhost since it's the current device
        if (device.getIpAddress() != null && !device.getIpAddress().equals("127.0.0.1") && !device.getIpAddress().equals("0:0:0:0:0:0:0:1")) {
            webClients.put(sessionId, device);
        }
    }

    public void removeWebClient(String sessionId) {
        webClients.remove(sessionId);
    }

    public Collection<Device> getDiscoveredDevices() {
        java.util.Collection<Device> allDevices = new java.util.ArrayList<>(discoveredDevices.values());
        allDevices.addAll(webClients.values());
        return allDevices;
    }
}
