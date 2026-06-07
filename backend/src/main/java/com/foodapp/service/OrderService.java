package com.foodapp.service;

import com.foodapp.dto.OrderRequest;
import com.foodapp.model.*;
import com.foodapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public Optional<Order> placeOrder(OrderRequest request) {
        User user = userRepository.findById(request.getUserId()).orElse(null);
        if (user == null) return Optional.empty();

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PLACED");
        order.setDeliveryAddress(request.getDeliveryAddress() != null ? request.getDeliveryAddress() : user.getAddress());
        double total = 0;

        for (OrderRequest.CartItem ci : request.getItems()) {
            Product product = productRepository.findById(ci.getProductId()).orElse(null);
            if (product == null) continue;
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(ci.getQuantity());
            item.setPrice(product.getPrice() * ci.getQuantity());
            order.getItems().add(item);
            total += item.getPrice();
        }

        order.setTotalAmount(total);
        return Optional.of(orderRepository.save(order));
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderTimeDesc(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderTimeDesc();
    }

    public Optional<Order> updateStatus(Long id, String status) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            if ("DELIVERED".equals(status)) {
                order.setDeliveredTime(LocalDateTime.now());
            }
            return orderRepository.save(order);
        });
    }

    public Optional<Order> markReviewed(Long id) {
        return orderRepository.findById(id).map(order -> {
            order.setReviewed(true);
            return orderRepository.save(order);
        });
    }
}
