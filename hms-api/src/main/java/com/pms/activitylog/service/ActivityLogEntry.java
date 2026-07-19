package com.pms.activitylog.service;

/**
 * Fluent builder for a single ActivityLog write, so call sites elsewhere in
 * the app (AdmissionService, IpBillingService, IpPaymentRequestService, ...)
 * read as a short chained statement instead of a long positional argument
 * list - performedBy/performedAt are filled in by ActivityLogService.log().
 */
public class ActivityLogEntry {

    private final String module;
    private final String operation;
    private String content;
    private String previousContent;
    private String status = "Success";
    private String patientUhid;
    private String patientName;
    private String opNumber;
    private String ipNumber;
    private String screenName;
    private String remarks;

    public ActivityLogEntry(String module, String operation) {
        this.module = module;
        this.operation = operation;
    }

    public ActivityLogEntry content(String content) {
        this.content = content;
        return this;
    }

    public ActivityLogEntry previousContent(String previousContent) {
        this.previousContent = previousContent;
        return this;
    }

    public ActivityLogEntry status(String status) {
        this.status = status;
        return this;
    }

    public ActivityLogEntry patient(String patientUhid, String patientName) {
        this.patientUhid = patientUhid;
        this.patientName = patientName;
        return this;
    }

    public ActivityLogEntry opNumber(String opNumber) {
        this.opNumber = opNumber;
        return this;
    }

    public ActivityLogEntry ipNumber(String ipNumber) {
        this.ipNumber = ipNumber;
        return this;
    }

    public ActivityLogEntry screenName(String screenName) {
        this.screenName = screenName;
        return this;
    }

    public ActivityLogEntry remarks(String remarks) {
        this.remarks = remarks;
        return this;
    }

    public String module() {
        return module;
    }

    public String operation() {
        return operation;
    }

    public String content() {
        return content;
    }

    public String previousContent() {
        return previousContent;
    }

    public String status() {
        return status;
    }

    public String patientUhid() {
        return patientUhid;
    }

    public String patientName() {
        return patientName;
    }

    public String opNumber() {
        return opNumber;
    }

    public String ipNumber() {
        return ipNumber;
    }

    public String screenName() {
        return screenName;
    }

    public String remarks() {
        return remarks;
    }
}
