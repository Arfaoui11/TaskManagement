package tn.esprit.serviceproj.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.serviceproj.Entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
