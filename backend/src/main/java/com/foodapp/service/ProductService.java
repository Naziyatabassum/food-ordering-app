package com.foodapp.service;

import com.foodapp.model.Product;
import com.foodapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getProducts(String category, String sort) {
        if (category != null && !category.isEmpty()) {
            return sort.equals("desc")
                    ? productRepository.findByCategoryOrderByPriceDesc(category)
                    : productRepository.findByCategoryOrderByPriceAsc(category);
        }
        return sort.equals("desc")
                ? productRepository.findAllByOrderByPriceDesc()
                : productRepository.findAllByOrderByPriceAsc();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product product) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(product.getName());
            existing.setDescription(product.getDescription());
            existing.setPrice(product.getPrice());
            existing.setCategory(product.getCategory());
            existing.setImageUrl(product.getImageUrl());
            return productRepository.save(existing);
        });
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
