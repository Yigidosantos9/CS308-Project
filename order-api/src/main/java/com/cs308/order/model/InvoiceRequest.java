package com.cs308.order.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class InvoiceRequest {

    @NotBlank
    private String invoiceNumber;

    @NotBlank
    private String issueDate;

    @NotBlank
    private String dueDate;

    @NotBlank
    private String sellerName;

    @NotBlank
    private String sellerAddress;

    @NotBlank
    private String buyerName;

    @NotBlank
    private String buyerAddress;

    private String paymentMethod;

    private String orderId;

    private String buyerEmail;

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }

    @NotNull
    private Double taxRate = 0.0;

    private Double shippingFee = 0.0;

    private String currencySymbol = "$";

    @Valid
    @NotEmpty
    private List<InvoiceItem> items = new ArrayList<>();

    public InvoiceRequest() {
    }

    public InvoiceRequest(String invoiceNumber, String issueDate, String dueDate, String sellerName,
            String sellerAddress, String buyerName, String buyerAddress, Double taxRate, Double shippingFee,
            String currencySymbol, List<InvoiceItem> items) {
        this.invoiceNumber = invoiceNumber;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.sellerName = sellerName;
        this.sellerAddress = sellerAddress;
        this.buyerName = buyerName;
        this.buyerAddress = buyerAddress;
        this.taxRate = taxRate != null ? taxRate : 0.0;
        this.shippingFee = shippingFee != null ? shippingFee : 0.0;
        this.currencySymbol = currencySymbol != null ? currencySymbol : "$";
        this.items = items != null ? items : new ArrayList<>();
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(String issueDate) {
        this.issueDate = issueDate;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public String getSellerAddress() {
        return sellerAddress;
    }

    public void setSellerAddress(String sellerAddress) {
        this.sellerAddress = sellerAddress;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBuyerAddress() {
        return buyerAddress;
    }

    public void setBuyerAddress(String buyerAddress) {
        this.buyerAddress = buyerAddress;
    }

    public Double getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(Double taxRate) {
        this.taxRate = taxRate;
    }

    public Double getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(Double shippingFee) {
        this.shippingFee = shippingFee;
    }

    public String getCurrencySymbol() {
        return currencySymbol;
    }

    public void setCurrencySymbol(String currencySymbol) {
        this.currencySymbol = currencySymbol;
    }

    public List<InvoiceItem> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItem> items) {
        this.items = items;
    }
}
