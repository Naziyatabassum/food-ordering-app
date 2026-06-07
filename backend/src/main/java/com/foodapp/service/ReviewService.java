package com.foodapp.service;

import com.foodapp.dto.ReviewRequest;
import com.foodapp.model.Product;
import com.foodapp.model.Review;
import com.foodapp.model.User;
import com.foodapp.repository.ProductRepository;
import com.foodapp.repository.ReviewRepository;
import com.foodapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<Review> addReview(ReviewRequest request) {
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        User user = userRepository.findById(request.getUserId()).orElse(null);
        if (product == null || user == null) return Optional.empty();

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setComment(request.getComment());
        review.setRating(request.getRating());
        return Optional.of(reviewRepository.save(review));
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId);
    }
}
