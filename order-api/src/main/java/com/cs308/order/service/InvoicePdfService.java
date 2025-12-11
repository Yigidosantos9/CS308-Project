package com.cs308.order.service;

import com.cs308.order.model.InvoiceItem;
import com.cs308.order.model.InvoiceRequest;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.List;
import java.util.Optional;

@Service
public class InvoicePdfService {

    private static final Logger log = LoggerFactory.getLogger(InvoicePdfService.class);

    private static final float MARGIN = 50f;
    private static final DecimalFormat MONEY_FORMAT = new DecimalFormat("#,##0.00");
    private PDFont bodyFont = PDType1Font.HELVETICA;
    private PDFont boldFont = PDType1Font.HELVETICA_BOLD;
    private PDFont italicFont = PDType1Font.HELVETICA_OBLIQUE;

    public byte[] generateInvoicePdf(InvoiceRequest request) {
        validate(request);

        try (PDDocument document = new PDDocument()) {
            loadFonts(document);
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float y = PDRectangle.A4.getHeight() - MARGIN;

                y = drawHeader(content, request, y);
                y = drawParties(content, request, y - 16);
                y = drawItemsTable(content, request.getItems(), y - 14);
                y = drawTotals(content, request, y - 10);

                drawFooter(content, y - 24, "Thank you for your purchase.");
            }

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                document.save(baos);
                return baos.toByteArray();
            }
        } catch (IOException e) {
            log.error("Failed to generate invoice PDF", e);
            throw new IllegalStateException("Unable to generate invoice PDF", e);
        }
    }

    private void validate(InvoiceRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Invoice request cannot be null");
        }
        if (!StringUtils.hasText(request.getInvoiceNumber())) {
            throw new IllegalArgumentException("Invoice number is required");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("At least one invoice item is required");
        }
    }

    private float drawHeader(PDPageContentStream content, InvoiceRequest request, float y) throws IOException {
        y = writeText(content, boldFont, 22, MARGIN, y, "INVOICE");
        y = writeText(content, bodyFont, 11, MARGIN, y, "Invoice No: " + request.getInvoiceNumber());
        if (StringUtils.hasText(request.getOrderId())) {
            y = writeText(content, bodyFont, 11, MARGIN, y, request.getOrderId());
        }
        y = writeText(content, bodyFont, 11, MARGIN, y, "Issue Date: " + request.getIssueDate());
        return writeText(content, bodyFont, 11, MARGIN, y, "Due Date: " + request.getDueDate());
    }

    private float drawParties(PDPageContentStream content, InvoiceRequest request, float y) throws IOException {
        drawDivider(content, y);
        y -= 12;

        y = writeText(content, boldFont, 12, MARGIN, y, "Billed To");
        y = writeMultiline(content, bodyFont, 11, MARGIN, y, request.getBuyerName(),
                request.getBuyerAddress());

        y = writeText(content, boldFont, 12, MARGIN + 280, y + 16, "From");
        y = writeMultiline(content, bodyFont, 11, MARGIN + 280, y, request.getSellerName(),
                request.getSellerAddress());

        return y - 4;
    }

    private float drawItemsTable(PDPageContentStream content, List<InvoiceItem> items, float y) throws IOException {
        drawDivider(content, y);
        y -= 12;

        float startX = MARGIN;
        float[] colWidths = { 250, 70, 100, 100 };

        y = writeTableRow(content, y, startX, colWidths, true,
                "Item", "Qty", "Unit Price", "Subtotal");

        for (InvoiceItem item : items) {
            double total = Optional.ofNullable(item.getUnitPrice()).orElse(0.0)
                    * Optional.ofNullable(item.getQuantity()).orElse(0);
            y = writeTableRow(content, y - 12, startX, colWidths, false,
                    item.getDescription(),
                    String.valueOf(item.getQuantity()),
                    formatMoney(item.getUnitPrice()),
                    formatMoney(total));
        }

        return y - 4;
    }

    private float drawTotals(PDPageContentStream content, InvoiceRequest request, float y) throws IOException {
        double subTotal = request.getItems().stream()
                .mapToDouble(item -> Optional.ofNullable(item.getUnitPrice()).orElse(0.0)
                        * Optional.ofNullable(item.getQuantity()).orElse(0))
                .sum();
        double taxAmount = subTotal * Optional.ofNullable(request.getTaxRate()).orElse(0.0);
        double shipping = Optional.ofNullable(request.getShippingFee()).orElse(0.0);
        double total = subTotal  + taxAmount +shipping;

        float startX = MARGIN + 320;
        drawDivider(content, y);
        y -= 10;
        y = writeText(content, boldFont, 12, startX, y, "Summary");
        if (StringUtils.hasText(request.getPaymentMethod())) {
            y = writeText(content, bodyFont, 11, startX, y, "Payment: " + request.getPaymentMethod());
        }
        y = writeText(content, bodyFont, 11, startX, y, "Subtotal: " + formatMoney(subTotal, request));
        y = writeText(content, bodyFont, 11, startX, y,
                "Tax (" + (request.getTaxRate() * 100) + "%): " + formatMoney(taxAmount, request));
        y = writeText(content, bodyFont, 11, startX, y, "Shipping: " + formatMoney(shipping, request));
        y = writeText(content, boldFont, 12, startX, y, "Total: " + formatMoney(total, request));
        return y;
    }

    private void drawFooter(PDPageContentStream content, float y, String text) throws IOException {
        drawDivider(content, y);
        writeText(content, italicFont, 10, MARGIN, y - 12, text);
    }

    private float writeText(PDPageContentStream content, PDFont font, float fontSize, float x, float y,
            String text) throws IOException {
        content.beginText();
        content.setFont(font, fontSize);
        content.newLineAtOffset(x, y);
        content.showText(text != null ? text : "");
        content.endText();
        return y - (fontSize + 4);
    }

    private float writeMultiline(PDPageContentStream content, PDFont font, float fontSize, float x, float y,
            String... lines) throws IOException {
        float currentY = y;
        for (String line : lines) {
            currentY = writeText(content, font, fontSize, x, currentY, line);
        }
        return currentY;
    }

    private float writeTableRow(PDPageContentStream content, float y, float startX, float[] colWidths, boolean header,
            String... values) throws IOException {
        float currentX = startX;
        for (int i = 0; i < values.length; i++) {
            content.beginText();
            content.setFont(header ? boldFont : bodyFont, header ? 11 : 10);
            content.newLineAtOffset(currentX, y);
            content.showText(values[i]);
            content.endText();
            currentX += colWidths[i];
        }
        return y;
    }

    private void drawDivider(PDPageContentStream content, float y) throws IOException {
        content.moveTo(MARGIN, y);
        content.lineTo(PDRectangle.A4.getWidth() - MARGIN, y);
        content.setLineWidth(0.8f);
        content.stroke();
    }

    private String formatMoney(double value) {
        return "$" + MONEY_FORMAT.format(value);
    }

    private String formatMoney(double value, InvoiceRequest request) {
        String symbol = Optional.ofNullable(request.getCurrencySymbol()).orElse("$");
        return symbol + MONEY_FORMAT.format(value);
    }

    private void loadFonts(PDDocument document) {
        String[] fontPaths = {
                "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
                "/System/Library/Fonts/Supplemental/Arial Unicode MS.ttf",
                "/System/Library/Fonts/Supplemental/Helvetica.ttc"
        };
        for (String path : fontPaths) {
            try {
                java.nio.file.Path p = java.nio.file.Paths.get(path);
                if (java.nio.file.Files.exists(p)) {
                    PDFont font = PDType0Font.load(document, java.nio.file.Files.newInputStream(p));
                    bodyFont = font;
                    boldFont = font;
                    italicFont = font;
                    return;
                }
            } catch (Exception ignored) {
            }
        }
        // fallback defaults already set
    }
}
