import { Notification } from "../notificationCenter";

export function getNotificationCenterEvent(
  {},
  params: { notification: Notification },
) {
  return {
    type: "NOTIFY",
    notification: params.notification,
  };
}
