export interface IpBillingActivityLogEntry {
  id: number;
  componentId: number;
  componentName: string;
  operation: string;
  content: string | null;
  previousContent: string | null;
  performedBy: string;
  performedAt: string;
}
