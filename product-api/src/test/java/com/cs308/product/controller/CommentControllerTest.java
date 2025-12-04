package com.cs308.product.controller;

import com.cs308.product.domain.Comment;
import com.cs308.product.model.AddCommentRequest;
import com.cs308.product.service.CommentService;
import com.cs308.product.web.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CommentController.class)
@Import(GlobalExceptionHandler.class)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CommentService commentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void addCommentReturnsCreatedComment() throws Exception {
        AddCommentRequest request = new AddCommentRequest();
        request.setProductId(1L);
        request.setUserId(100L);
        request.setContent("Great product!");

        Comment comment = new Comment();
        comment.setId(10L);
        comment.setContent("Great product!");
        comment.setUserId(100L);
        comment.setApproved(false);

        when(commentService.addComment(eq(1L), eq("Great product!"), eq(100L))).thenReturn(comment);

        mockMvc.perform(post("/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.content").value("Great product!"))
                .andExpect(jsonPath("$.approved").value(false));

        verify(commentService).addComment(eq(1L), eq("Great product!"), eq(100L));
    }

    @Test
    void approveCommentReturnsOk() throws Exception {
        mockMvc.perform(put("/comments/{id}/approve", 10L))
                .andExpect(status().isOk());

        verify(commentService).approveComment(10L);
    }
}
