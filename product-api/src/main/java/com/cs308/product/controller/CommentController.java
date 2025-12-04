package com.cs308.product.controller;

import com.cs308.product.domain.Comment;
import com.cs308.product.model.AddCommentRequest;
import com.cs308.product.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<Comment> addComment(@Valid @RequestBody AddCommentRequest request) {
        Comment comment = commentService.addComment(request.getProductId(), request.getContent(), request.getUserId());
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveComment(@PathVariable Long id) {
        commentService.approveComment(id);
        return ResponseEntity.ok().build();
    }
}
