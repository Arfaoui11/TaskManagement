package tn.esprit.kafkaservice.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.kafkaservice.Producer.KafkaProducer;
import tn.esprit.kafkaservice.entity.Notification;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final KafkaProducer kafkaProducer;

    @PostMapping
    public ResponseEntity<String> sendMessage(
            @RequestBody Notification notification  // Reçoit un JSON et le mappe en Notification
    ) {
        kafkaProducer.sendNotification(notification);  // Envoie l'objet Notification à Kafka
        return ResponseEntity.ok("Message queued successfully");
    }
}
