package tn.esprit.authservice.Service;


import tn.esprit.authservice.Entity.User;


import java.util.List;
import java.util.Optional;


public interface IUserService {

    public void save(User user);

    public Optional<User> update(Long userId,User user);

    public void delete(Long userId);

    public List<User> getUsers();

    public Optional<User> getUserById(Long userId);

    public User getUserByUserName(String email);
}
