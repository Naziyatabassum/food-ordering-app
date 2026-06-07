package com.foodapp;

import com.foodapp.model.User;
import com.foodapp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class FoodAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(FoodAppApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByEmail("admin@food.com").isEmpty()) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@food.com");
                admin.setPassword("admin123");
                admin.setRole("ADMIN");
                admin.setPhone("0000000000");
                admin.setAddress("Admin HQ");
                userRepository.save(admin);
            }
        };
    }
}
