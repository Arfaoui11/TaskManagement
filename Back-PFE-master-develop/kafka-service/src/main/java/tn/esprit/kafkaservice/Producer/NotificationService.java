//package tn.esprit.kafkaservice.Producer;
//
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Service;
//
//@Service
//@Slf4j
//public class NotificationService {
//
//    private final SimpMessagingTemplate messagingTemplate;
//
//    public NotificationService(SimpMessagingTemplate messagingTemplate) {
//        this.messagingTemplate = messagingTemplate;
//    }
//
//    @KafkaListener(topics = "${kafka.topic.name}", groupId = "myGroup")
//    public void consumeMsg(String msg) {
//        log.info("Consuming message: {}", msg);
//
//        // Diffuser via WebSocket à tous les abonnés du topic /topic/notifications
//        messagingTemplate.convertAndSend("/topic/notifications", msg);
//    }
//}
//
