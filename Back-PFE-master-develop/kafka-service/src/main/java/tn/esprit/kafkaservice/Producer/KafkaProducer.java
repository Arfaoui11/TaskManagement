package tn.esprit.kafkaservice.Producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class KafkaProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String TOPIC = "votre-topic";

    public KafkaProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendNotification(Object notification) {
        try {
            String message = objectMapper.writeValueAsString(notification);

            CompletableFuture<SendResult<String, String>> future = (CompletableFuture<SendResult<String, String>>) kafkaTemplate.send(TOPIC, message);

            future.thenAccept(result -> {
                System.out.println("✅ Message envoyé à Kafka (partition " +
                        result.getRecordMetadata().partition() + ")");
            }).exceptionally(ex -> {
                System.err.println("❌ Échec d'envoi Kafka : " + ex.getMessage());
                return null;
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
