package tn.esprit.serviceproj.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public void send(SimpleMailMessage mailMessage) {
    }


//    public void sendActivationEmail(String to, String token) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(to);
//        message.setSubject("Activate your account");
//        message.setText("To activate your account, click the link below:\n"
//                + "http://localhost:9090/api2/users/activate?token=" + token);
//        mailSender.send(message);
//    }
}

