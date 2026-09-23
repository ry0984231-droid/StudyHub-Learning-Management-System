import { db } from "../db/store.js";

const getWishlist = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });

        const user = db.users.find(u => u._id === req.user._id);
        const wishlist = user?.wishlist || [];
        const courses = db.courses.filter(c => wishlist.includes(c._id));

        res.json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error fetching wishlist."
        });
    }
};

const toggleWishlist = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });

        const user = db.users.find(u => u._id === req.user._id);
        if (!user)
            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        const { courseId } = req.params;
        user.wishlist ||= [];

        const index = user.wishlist.indexOf(courseId);
        const isWishlisted = index === -1;

        isWishlisted
            ? user.wishlist.push(courseId)
            : user.wishlist.splice(index, 1);

        await db.save();

        res.json({
            success: true,
            isWishlisted,
            message: isWishlisted
                ? "Course added to wishlist."
                : "Course removed from wishlist.",
            wishlist: user.wishlist
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error updating wishlist."
        });
    }
};

export {
    getWishlist,
    toggleWishlist
};
