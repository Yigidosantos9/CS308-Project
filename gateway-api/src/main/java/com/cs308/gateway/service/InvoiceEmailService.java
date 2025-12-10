package com.cs308.gateway.service;

import com.cs308.gateway.model.invoice.InvoiceEmailRequest;
import com.cs308.gateway.model.invoice.InvoiceRequest;
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

    public void sendRefundEmail(com.cs308.gateway.model.invoice.RefundEmailRequest request) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(request.getTo());
            helper.setSubject("Refund Approved - Order #" + request.getOrderId());

            String body = String.format(
                    "Dear Customer,\n\n" +
                            "Your refund request for Order #%d has been approved.\n" +
                            "Product(s): %s\n" +
                            "Refund Amount: $%.2f\n\n" +
                            "The amount will be credited to your original payment method within 5-7 business days.\n\n"
                            +
                            "Best regards,\n" +
                            "CS308 E-Commerce Team",
                    request.getOrderId(),
                    request.getProductName() != null ? request.getProductName() : "N/A",
                    request.getRefundAmount());

            helper.setText(body, false);

            mailSender.send(message);
            log.info("Refund email sent to {} for order {}", request.getTo(), request.getOrderId());
        } catch (MessagingException e) {
            log.error("Failed to compose refund email", e);
            throw new IllegalStateException("Unable to send refund email", e);
        }
    }
}
