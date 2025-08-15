package tn.esprit.serviceproj.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "document")
public class Document implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String fileName;

    //@Column(nullable = false, columnDefinition = "boolean default false")
    private boolean archived = false;

    private String type;

    private String url;

    private String content;
    @ManyToOne(fetch =FetchType.EAGER, cascade= CascadeType.DETACH)
    private Dossier dossier;
    @OneToMany(mappedBy = "projet")
    @JsonIgnore
    private List<Dossier> dossiers = new ArrayList<>();
    private LocalDateTime createdAt;
    private Long fileSize;
    private Long userId;    // Lien avec un utilisateur (microservice user)
    @Column(name = "parent_id", nullable = false, columnDefinition = "bigint default 0")
    private Long parentId = 0L; // Définir une valeur par défaut
    @ManyToOne
    private Projet projet; // ✅ Nouveau champ ajouté ici


    public Document(URI uri) {
        this.url = uri.toString();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
