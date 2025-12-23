package com.cs308.order.repository;

import com.cs308.order.model.Order;
import com.cs308.order.model.enums.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    Order findByIdAndUserId(Long id, Long userId);

    // ==================== REFUND QUERIES ====================

    /**
     * Find all orders with a specific refund status
     */
    List<Order> findByRefundStatus(RefundStatus refundStatus);

    /**
     * Find all orders with pending refund requests (for PM dashboard)
     */
    @Query("SELECT o FROM Order o WHERE o.refundStatus = 'PENDING' ORDER BY o.refundRequestedAt ASC")
    List<Order> findPendingRefundRequests();

    /**
     * Find orders by user with specific refund status
     */
    List<Order> findByUserIdAndRefundStatus(Long userId, RefundStatus refundStatus);

    /**
     * Count pending refund requests (for dashboard stats)
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.refundStatus = 'PENDING'")
    Long countPendingRefundRequests();

    /**
     * Find all refunded orders (for reporting)
     */
    @Query("SELECT o FROM Order o WHERE o.refundStatus = 'APPROVED' ORDER BY o.refundProcessedAt DESC")
    List<Order> findApprovedRefunds();
}