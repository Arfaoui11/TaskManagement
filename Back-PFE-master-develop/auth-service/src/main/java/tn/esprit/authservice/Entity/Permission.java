package tn.esprit.authservice.Entity;




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

    private String name; // ✅ C'est bien un champ name

    @ManyToMany(mappedBy = "permissions")  // La relation inverse avec Role
    private Set<Role> roles = new HashSet<>();
}
