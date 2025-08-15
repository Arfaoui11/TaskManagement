package tn.esprit.kafkaservice.Consumer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class KafkaConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    // Injection du SimpMessagingTemplate (Spring WebSocket)
    public KafkaConsumer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = "votre-topic", groupId = "myGroup")
    public void consumeMsg(String msg) {
        log.info(String.format("Consuming the message from votre-topic Topic:: %s", msg));
        // Forward message to WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/notifications", msg);
    }
}
