package tn.esprit.serviceproj.Entity;

import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tache")
public class Tache implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre;
    private String description;
    private String commentaires;

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    private Statut statut;
    private Priorite priorite;
    private Double tempsEstime;

    private Double tempsPasse;

    private String categorie;


    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    private Long responsable;
    private String fullName;
    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    public enum Statut {
        EN_ATTENTE,
        EN_COURS,
        TERMINEE
    }

    public enum Priorite {
        BASSE,
        NORMALE,
        HAUTE
    }

    // Ajoute ces getters pour exposer des libellés "amis" côté frontend
    public String getStatutLibelle() {
        if (statut == null) return null;
        switch (statut) {
            case EN_ATTENTE: return "En attente";
            case EN_COURS: return "En cours";
            case TERMINEE: return "Terminée";
            default: return statut.name();
        }
    }

    public String getPrioriteLibelle() {
        if (priorite == null) return null;
        switch (priorite) {
            case BASSE: return "Basse";
            case NORMALE: return "Normale";
            case HAUTE: return "Haute";
            default: return priorite.name();
        }
    }
}
