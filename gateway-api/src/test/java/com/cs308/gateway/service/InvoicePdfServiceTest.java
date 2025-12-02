package com.cs308.gateway.service;

import com.cs308.gateway.model.invoice.InvoiceItem;
import com.cs308.gateway.model.invoice.InvoiceRequest;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class InvoicePdfServiceTest {

    private final InvoicePdfService invoicePdfService = new InvoicePdfService();

    @Test
    void generateInvoicePdf_shouldReturnPdfBytes() {
        InvoiceRequest request = InvoiceRequest.builder()
                .invoiceNumber("INV-1001")
                .issueDate("2025-01-05")
                .dueDate("2025-01-12")
                .sellerName("RAWCTRL HQ")
                .sellerAddress("Istiklal Caddesi No:1, Istanbul")
                .buyerName("Jane Doe")
                .buyerAddress("Example Street 10, Kadikoy, Istanbul")
                .taxRate(0.18)
                .shippingFee(9.90)
                .currencySymbol("$")
                .items(List.of(
                        InvoiceItem.builder().description("RAWCTRL Hoodie").quantity(1).unitPrice(89.90).build(),
                        InvoiceItem.builder().description("Denim Jeans").quantity(1).unitPrice(99.90).build()
                ))
                .build();

        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(request);

        assertThat(pdfBytes).isNotEmpty();
        String signature = new String(pdfBytes, 0, 4, StandardCharsets.US_ASCII);
        assertThat(signature).isEqualTo("%PDF");
    }
}
