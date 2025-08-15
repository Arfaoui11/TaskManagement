package tn.esprit.authservice.Entity;




import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@Table(name="role")
public class Role  implements Serializable {

    private static final long serialVersionUID = 983648238746032841L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @NotNull(message = "Le nom du rôle ne peut pas être vide")
    private String name;

    @OneToMany(mappedBy = "role")
    @JsonIgnore
    private List<User> users = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Permission> permissions;



    public Role() {
    }

    public Role(String name, Set<Permission> permissions) {
        this.name = name;
        this.permissions = permissions;
    }

    public Role(String name) {
        this.name = name;
    }
}

