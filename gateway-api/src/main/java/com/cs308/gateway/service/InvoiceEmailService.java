package com.cs308.gateway.service;

import com.cs308.gateway.model.invoice.InvoiceEmailRequest;
import com.cs308.gateway.model.invoice.InvoiceRequest;
import com.cs308.gateway.model.invoice.RefundEmailRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceEmailService {

    private final JavaMailSender mailSender;
    private final OrderService orderService;

    public void sendInvoiceEmail(InvoiceEmailRequest request) {
        InvoiceRequest invoice = request.getInvoice();

        byte[] pdfBytes = orderService.generateInvoicePdf(invoice);

        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(request.getTo());

            String subject = StringUtils.hasText(request.getSubject())
                    ? request.getSubject()
                    : "Invoice " + invoice.getInvoiceNumber();
            helper.setSubject(subject);

            String body = StringUtils.hasText(request.getBody())
                    ? request.getBody()
                    : "Thank you for your purchase. Your invoice is attached as a PDF.";
            helper.setText(body, false);

            String filename = "invoice-" + invoice.getInvoiceNumber() + ".pdf";
            helper.addAttachment(filename, new ByteArrayResource(pdfBytes));

            mailSender.send(message);
            log.info("Invoice email sent to {} for invoice {}", request.getTo(), invoice.getInvoiceNumber());
        } catch (MessagingException e) {
            log.error("Failed to compose invoice email", e);
            throw new IllegalStateException("Unable to send invoice email", e);
        }
    }

    public void sendInvoiceEmail(String to, byte[] pdfBytes, String invoiceNumber) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject("Invoice " + invoiceNumber);
            helper.setText("Thank you for your purchase. Your invoice is attached as a PDF.", false);

            String filename = "invoice-" + invoiceNumber + ".pdf";
            helper.addAttachment(filename, new ByteArrayResource(pdfBytes), "application/pdf");

            mailSender.send(message);
            log.info("Invoice email sent to {} for invoice {}", to, invoiceNumber);
        } catch (MessagingException e) {
            log.error("Failed to compose invoice email", e);
            throw new IllegalStateException("Unable to send invoice email", e);
        }
    }

    /**
     * Send refund approval email to customer
     */
    public void sendRefundEmail(RefundEmailRequest request) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(request.getTo());
            helper.setSubject("Refund Approved - Order #" + request.getOrderId());

            String body = String.format(
                    "Dear Customer,\n\n" +
                            "Great news! Your refund request for Order #%d has been approved.\n\n" +
                            "Product(s): %s\n" +
                            "Refund Amount: $%.2f\n\n" +
                            "The refund will be credited to your original payment method within 5-7 business days.\n\n" +
                            "If you have any questions, please don't hesitate to contact our support team.\n\n" +
                            "Thank you for shopping with RAWCTRL!\n\n" +
                            "Best regards,\n" +
                            "The RAWCTRL Team",
                    request.getOrderId(),
                    request.getProductName() != null ? request.getProductName() : "N/A",
                    request.getRefundAmount() != null ? request.getRefundAmount() : 0.0);

            helper.setText(body, false);

            mailSender.send(message);
            log.info("Refund approval email sent to {} for order {}", request.getTo(), request.getOrderId());
        } catch (MessagingException e) {
            log.error("Failed to compose refund approval email", e);
            throw new IllegalStateException("Unable to send refund email", e);
        }
    }

    /**
     * Send refund rejection email to customer
     */
    public void sendRefundRejectionEmail(RefundEmailRequest request) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(request.getTo());
            helper.setSubject("Refund Request Update - Order #" + request.getOrderId());

            String reasonText = "";
            if (request.getRejectionReason() != null && !request.getRejectionReason().isEmpty()) {
                reasonText = String.format("\n\nReason: %s", request.getRejectionReason());
            }

            String body = String.format(
                    "Dear Customer,\n\n" +
                            "We regret to inform you that your refund request for Order #%d has been declined.%s\n\n" +
                            "Product(s): %s\n" +
                            "Order Amount: $%.2f\n\n" +
                            "If you believe this decision was made in error or have any questions, " +
                            "please contact our customer support team for further assistance.\n\n" +
                            "We value your business and are here to help resolve any concerns you may have.\n\n" +
                            "Best regards,\n" +
                            "The RAWCTRL Team",
                    request.getOrderId(),
                    reasonText,
                    request.getProductName() != null ? request.getProductName() : "N/A",
                    request.getRefundAmount() != null ? request.getRefundAmount() : 0.0);

            helper.setText(body, false);

            mailSender.send(message);
            log.info("Refund rejection email sent to {} for order {}", request.getTo(), request.getOrderId());
        } catch (MessagingException e) {
            log.error("Failed to compose refund rejection email", e);
            throw new IllegalStateException("Unable to send refund rejection email", e);
        }
    }

    /**
     * Send refund request confirmation email to customer
     */
    public void sendRefundRequestConfirmationEmail(String to, Long orderId, String productName) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject("Refund Request Received - Order #" + orderId);

            String body = String.format(
                    "Dear Customer,\n\n" +
                            "We have received your refund request for Order #%d.\n\n" +
                            "Product(s): %s\n\n" +
                            "Our team will review your request and get back to you within 2-3 business days.\n\n" +
                            "You can track the status of your refund request in your order history.\n\n" +
                            "Thank you for your patience.\n\n" +
                            "Best regards,\n" +
                            "The RAWCTRL Team",
                    orderId,
                    productName != null ? productName : "N/A");

            helper.setText(body, false);

            mailSender.send(message);
            log.info("Refund request confirmation email sent to {} for order {}", to, orderId);
        } catch (MessagingException e) {
            log.error("Failed to compose refund request confirmation email", e);
            // Don't throw - this is optional
        }
    }

    /**
     * Send order cancellation confirmation email to customer
     */
    public void sendOrderCancellationEmail(String to, Long orderId, String productName) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject("Order Cancelled - Order #" + orderId);

            String body = String.format(
                    "Dear Customer,\n\n" +
                            "Your order #%d has been successfully cancelled as requested.\n\n" +
                            "Product(s): %s\n\n" +
                            "If you paid for this order, a full refund will be processed to your original payment method within 5-7 business days.\n\n" +
                            "If you have any questions or didn't request this cancellation, please contact our support team immediately.\n\n" +
                            "We hope to serve you again soon!\n\n" +
                            "Best regards,\n" +
                            "The RAWCTRL Team",
                    orderId,
                    productName != null ? productName : "N/A");

            helper.setText(body, false);

            mailSender.send(message);
            log.info("Order cancellation email sent to {} for order {}", to, orderId);
        } catch (MessagingException e) {
            log.error("Failed to compose order cancellation email", e);
            // Don't throw - this is optional
        }
    }
}