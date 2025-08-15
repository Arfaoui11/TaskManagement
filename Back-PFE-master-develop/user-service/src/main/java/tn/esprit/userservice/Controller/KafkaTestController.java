package tn.esprit.userservice.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.userservice.Service.KafkaProducerService;

@RestController
@RequestMapping("/kafka")
@RequiredArgsConstructor
public class KafkaTestController {

    private final KafkaProducerService kafkaProducerService;

    @PostMapping
    public ResponseEntity<String> sendKafkaMessage(@RequestBody String message) {
        kafkaProducerService.sendMessage(message);
        return ResponseEntity.ok("✅ Message envoyé depuis user-service");
    }
}
