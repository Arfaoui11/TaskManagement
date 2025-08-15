package tn.esprit.serviceproj.Entity;


import lombok.*;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;        // ex: "projet_cree", "utilisateur_ajoute"
    private String message;     // message simple ou JSON string


    private Long projetId;      // lien vers projet (optionnel)
    private Long userId;        // lien vers utilisateur (optionnel)

    // getters & setters
}
