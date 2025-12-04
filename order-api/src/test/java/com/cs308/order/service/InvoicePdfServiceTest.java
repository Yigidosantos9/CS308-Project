package com.cs308.order.service;

import com.cs308.order.model.InvoiceItem;
import com.cs308.order.model.InvoiceRequest;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class InvoicePdfServiceTest {

    private final InvoicePdfService invoicePdfService = new InvoicePdfService();

    @Test
    void generateInvoicePdf_shouldReturnPdfBytes() {
        InvoiceRequest request = new InvoiceRequest(
                "INV-1001",
                "2025-01-05",
                "2025-01-12",
                "RAWCTRL HQ",
                "Istiklal Caddesi No:1, Istanbul",
                "Jane Doe",
                "Example Street 10, Kadikoy, Istanbul",
                0.18,
                9.90,
                "$",
                List.of(
                        new InvoiceItem("RAWCTRL Hoodie", 1, 89.90),
                        new InvoiceItem("Denim Jeans", 1, 99.90)));

        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(request);

        assertThat(pdfBytes).isNotEmpty();
        String signature = new String(pdfBytes, 0, 4, StandardCharsets.US_ASCII);
        assertThat(signature).isEqualTo("%PDF");
    }
}
