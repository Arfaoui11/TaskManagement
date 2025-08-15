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
@Table(name = "dossier")
public class Dossier implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToMany(mappedBy = "dossier")
    @JsonIgnore
    private List<Document> documents = new ArrayList<>();
    private String name;
    private Long userId;    // Lien avec un utilisateur (microservice user)
    @ManyToOne(fetch =FetchType.EAGER, cascade= CascadeType.DETACH)
    private Projet projet;
    private LocalDateTime createdAt;
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean archived = false;
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    private Long parentId = 0L; // Valeur par défaut à 0L

    @OneToMany
    private List<Dossier> subDossiers = new ArrayList<>(); // PAS de mappedBy ici
}
