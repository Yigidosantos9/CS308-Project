package com.cs308.product.service;

import com.cs308.product.domain.Comment;
import com.cs308.product.domain.Product;
import com.cs308.product.repository.CommentRepository;
import com.cs308.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Comment addComment(Long productId, String content, Long userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        Comment comment = Comment.builder()
                .product(product)
                .content(content)
                .userId(userId)
                .isApproved(false)
                .build();

        return commentRepository.save(comment);
    }

    @Transactional
    public void approveComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));
        comment.setApproved(true);
        commentRepository.save(comment);
    }

    public List<Comment> getApprovedComments(Long productId) {
        return commentRepository.findByProductIdAndIsApprovedTrue(productId);
    }
}
