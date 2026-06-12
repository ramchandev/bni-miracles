export type MemberNotificationType =
  | "121_request"
  | "121_accepted"
  | "121_declined"
  | "bizrox_comment";

export type MemberNotification = {
  id: string;
  member_id: string;
  type: MemberNotificationType;
  title: string;
  body: string;
  href: string | null;
  source_id: string | null;
  is_read: boolean;
  created_at: string;
};

export function notificationIcon(type: MemberNotificationType): string {
  switch (type) {
    case "121_request":
    case "121_accepted":
    case "121_declined":
      return "📅";
    case "bizrox_comment":
      return "💬";
    default:
      return "🔔";
  }
}
