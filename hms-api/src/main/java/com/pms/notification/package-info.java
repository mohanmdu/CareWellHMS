/**
 * Notification module (SMS/email), extracted from inline calls scattered
 * through the legacy action methods (AutoMailGenerator, SendSMS - see
 * migration doc §5 mapping table). Should be @Async and queue-backed so a
 * slow SMS/email provider never blocks the request thread that triggered it.
 */
package com.pms.notification;
