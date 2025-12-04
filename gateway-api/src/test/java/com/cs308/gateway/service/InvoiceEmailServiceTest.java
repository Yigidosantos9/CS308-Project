package com.cs308.gateway.service;

import com.cs308.gateway.model.invoice.InvoiceEmailRequest;
import com.cs308.gateway.model.invoice.InvoiceItem;
import com.cs308.gateway.model.invoice.InvoiceRequest;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InvoiceEmailServiceTest {

    private JavaMailSender mailSender;
    private InvoicePdfService invoicePdfService;
    private InvoiceEmailService invoiceEmailService;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        invoicePdfService = mock(InvoicePdfService.class);
        invoiceEmailService = new InvoiceEmailService(mailSender, invoicePdfService);

        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(invoicePdfService.generateInvoicePdf(any())).thenReturn(new byte[]{1, 2, 3});
    }

    @Test
    void sendInvoiceEmail_sendsMailWithAttachment() {
        InvoiceRequest invoice = InvoiceRequest.builder()
                .invoiceNumber("INV-1001")
                .issueDate("2025-01-01")
                .dueDate("2025-01-08")
                .buyerName("John Doe")
                .buyerAddress("123 Main St")
                .sellerName("CS308 Store")
                .sellerAddress("Uni Campus")
                .currencySymbol("₺")
                .items(List.of(
                        InvoiceItem.builder()
                                .description("Jacket")
                                .quantity(1)
                                .unitPrice(199.99)
                                .build()
                ))
                .build();

        InvoiceEmailRequest request = InvoiceEmailRequest.builder()
                .to("test@example.com")
                .invoice(invoice)
                .build();

        invoiceEmailService.sendInvoiceEmail(request);

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        assertNotNull(captor.getValue());
        verify(invoicePdfService).generateInvoicePdf(invoice);
    }
}


