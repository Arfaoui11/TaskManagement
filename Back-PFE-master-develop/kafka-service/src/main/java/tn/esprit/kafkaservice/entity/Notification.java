package tn.esprit.kafkaservice.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Notification {

    private Long id;          // peut être null à la création
    private String type;      // ex: "projet_cree", "utilisateur_ajoute"
    private String message;   // message simple ou JSON string
    private Long projetId;    // optionnel
    private Long userId;      // optionnel

}