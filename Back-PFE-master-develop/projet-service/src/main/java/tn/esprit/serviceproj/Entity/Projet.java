package tn.esprit.serviceproj.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "projet")
public class Projet implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    @OneToMany(mappedBy = "projet")
    @JsonIgnore
    private List<Dossier> dossiers = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Column(name = "archived", nullable = false)

    private boolean archived = false;
    private Long createdBy;
    @OneToMany
    @JsonIgnore
    private List<Tache> taches = new ArrayList<>();
    @ElementCollection // Stocke la liste des IDs en base
    private List<Long> userIds = new ArrayList<>();
    private Long teamId; // Lien logique vers la Team (dans un autre microservice)

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

