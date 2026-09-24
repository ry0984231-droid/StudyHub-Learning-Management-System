import { db } from "../db/store.js";

const getNotifications = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });

        const notifications = db.notifications
            .filter(n => n.userId === req.user._id)
            .sort(
                (a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
            );

        res.json({
            success: true,
            count: notifications.length,
            unreadCount: notifications.filter(n => !n.read).length,
            data: notifications
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching notifications."
        });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const notification = db.notifications.find(
            n =>
                n._id === req.params.id &&
                n.userId === req.user?._id
        );

        if (notification) {
            notification.read = true;
            await db.save();
        }

        res.json({
            success: true,
            message: "Notification marked as read."
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error updating notification."
        });
    }
};

const markAllNotificationsRead = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });

        db.notifications.forEach(n => {
            if (n.userId === req.user._id) n.read = true;
        });

        await db.save();

        res.json({
            success: true,
            message: "All notifications marked as read."
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error updating notifications."
        });
    }
};

export {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead
};
