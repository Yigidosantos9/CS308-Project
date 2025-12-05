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
// @Service
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
}
