package tn.esprit.userservice.Entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name="permission")
public class Permission implements Serializable {

    private static final long serialVersionUID = 983648238746032841L;

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    @Column(unique = true)
    private String name; // ✅ C'est bien un champ name
    @JsonIgnore
    @ManyToMany(mappedBy = "permissions")  // La relation inverse avec Role
    private Set<Role> roles = new HashSet<>();  // Utilisez Set pour éviter les doublons

    public Permission(String name) {
        this.name = name;
    }
}
