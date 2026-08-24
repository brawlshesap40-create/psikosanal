import { notificationsService } from "@psikosanal/core";

export const getNotificationsForUser = notificationsService.getForUser;
export const countUnreadNotifications = notificationsService.countUnread;
