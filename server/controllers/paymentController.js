import { config } from "../config/config.js";
import { db } from "../db/store.js";
import crypto from "crypto";

const razorpayAuth = () =>
    `Basic ${Buffer.from(
        `${config.razorpayKeyId}:${config.razorpayKeySecret}`
    ).toString("base64")}`;

const paymentConfig = (res, verify = false) => {
    if (config.razorpayKeyId && config.razorpayKeySecret) return true;

    res.status(503).json({
        success: false,
        message: verify
            ? "Payments are not configured. A payment cannot be verified without a gateway."
            : "Payments are not configured. Add Razorpay credentials before accepting orders."
    });

    return false;
};

const createOrder = async (req, res) => {
    try {
        if (!paymentConfig(res) || !req.user)
            return !req.user
                ? res.status(401).json({
                    success: false,
                    message: "Not authenticated"
                })
                : null;

        const { courseId } = req.body;
        const course = db.courses.find(c => c._id === courseId);

        if (!course)
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });

        if (course.status !== "published")
            return res.status(404).json({
                success: false,
                message: "Course is not available for purchase."
            });

        if (db.enrollments.some(e => e.userId === req.user._id && e.courseId === course._id))
            return res.status(409).json({
                success: false,
                message: "You are already enrolled in this course."
            });

        const price = Number(course.price || 0);
        const finalAmount = Number(
            course.discountPrice !== undefined
                ? course.discountPrice
                : price
        );
        const discount = Math.max(0, price - finalAmount);

        if (!Number.isFinite(price) || !Number.isFinite(finalAmount) ||
            price <= 0 || finalAmount <= 0 || finalAmount > price)
            return res.status(400).json({
                success: false,
                message: "This course has an invalid price. Contact support."
            });

        const response = await fetch(
            "https://api.razorpay.com/v1/orders",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: razorpayAuth()
                },
                body: JSON.stringify({
                    amount: Math.round(finalAmount * 100),
                    currency: "INR",
                    receipt: `studyhub_${Date.now()}`,
                    notes: {
                        courseId: course._id,
                        userId: req.user._id
                    }
                }),
                signal: AbortSignal.timeout(15000)
            }
        );

        if (!response.ok) {
            const details = await response.json().catch(() => ({}));
            return res.status(502).json({
                success: false,
                message:
                    details?.error?.description ||
                    "Razorpay could not create the payment order."
            });
        }

        const order = await response.json();

        res.json({
            success: true,
            order: {
                orderId: order.id,
                amount: price,
                discount,
                finalAmount,
                currency: order.currency,
                courseId: course._id,
                courseTitle: course.title,
                keyId: config.razorpayKeyId
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error creating payment order."
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        if (!paymentConfig(res, true)) return;

        if (!req.user)
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });

        const {
            courseId,
            orderId,
            paymentId,
            paymentMethod,
            razorpaySignature
        } = req.body;

        const course = db.courses.find(c => c._id === courseId);

        if (!course)
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });

        if (!orderId || !paymentId || !razorpaySignature)
            return res.status(400).json({
                success: false,
                message: "Missing payment gateway verification data."
            });

        const expectedSignature = crypto
            .createHmac("sha256", config.razorpayKeySecret)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        const providedSignature = String(razorpaySignature);

        const isValid =
            providedSignature.length === expectedSignature.length &&
            crypto.timingSafeEqual(
                Buffer.from(expectedSignature),
                Buffer.from(providedSignature)
            );

        if (!isValid)
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature."
            });

        const orderResponse = await fetch(
            `https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,
            {
                headers: { Authorization: razorpayAuth() },
                signal: AbortSignal.timeout(15000)
            }
        );

        if (!orderResponse.ok)
            return res.status(400).json({
                success: false,
                message:
                    "Unable to validate the payment order with Razorpay."
            });

        const gatewayOrder = await orderResponse.json();

        const finalAmount = Number(
            course.discountPrice !== undefined
                ? course.discountPrice
                : course.price
        );

        const expectedAmount = Math.round(finalAmount * 100);

        const orderValid =
            gatewayOrder.id === orderId &&
            gatewayOrder.status === "paid" &&
            gatewayOrder.notes?.courseId === course._id &&
            gatewayOrder.notes?.userId === req.user._id &&
            Number(gatewayOrder.amount) === expectedAmount &&
            gatewayOrder.currency === "INR";

        if (!orderValid)
            return res.status(400).json({
                success: false,
                message:
                    "Payment order does not match this course or account."
            });

        const existingPayment = db.payments.find(
            payment => payment.paymentId === paymentId
        );

        if (existingPayment)
            if (existingPayment.userId !== req.user._id ||
                existingPayment.courseId !== course._id ||
                existingPayment.orderId !== orderId)
                return res.status(409).json({
                    success: false,
                    message: "Payment is already associated with another purchase."
                });

        if (existingPayment)
            return res.json({
                success: true,
                message: "Payment was already verified.",
                payment: existingPayment
            });

        const discount = Math.max(
            0,
            Number(course.price || 0) - finalAmount
        );

        const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
            10000 + Math.random() * 90000
        )}`;

        const payment = {
            _id: `pay_${Date.now()}`,
            userId: req.user._id,
            userName: req.user.name,
            userEmail: req.user.email,
            courseId: course._id,
            courseTitle: course.title,
            amount: course.price,
            discount,
            finalAmount,
            currency: "INR",
            orderId,
            paymentId,
            status: "success",
            paymentMethod: paymentMethod || "Razorpay",
            invoiceNumber,
            date: new Date().toISOString()
        };

        db.payments.push(payment);

        let enrollment = db.enrollments.find(
            e =>
                e.userId === req.user._id &&
                e.courseId === course._id
        );

        if (!enrollment) {
            const firstLesson = db.lessons
                .filter(l => l.courseId === course._id)
                .sort((a, b) => a.order - b.order)[0];

            enrollment = {
                _id: `enr_${Date.now()}`,
                userId: req.user._id,
                courseId: course._id,
                progressPercentage: 0,
                completedLessons: [],
                lastAccessedLessonId: firstLesson?._id,
                enrolledAt: new Date().toISOString(),
                isCompleted: false
            };

            db.enrollments.push(enrollment);
            course.studentsCount =
                (course.studentsCount || 0) + 1;
        }

        db.notifications.push({
            _id: `notif_${Date.now()}`,
            userId: req.user._id,
            type: "payment_confirmation",
            title: "Payment Successful & Enrolled!",
            message: `Your payment of ₹${finalAmount.toFixed(
                2
            )} for "${course.title}" was confirmed. Invoice: ${invoiceNumber}.`,
            link: `/learn/${course._id}`,
            read: false,
            createdAt: new Date().toISOString()
        });

        await db.save();

        res.json({
            success: true,
            message: "Payment verified successfully!",
            payment
        });
    } catch (err) {
        console.error("Verify Payment Error:", err);
        res.status(500).json({
            success: false,
            message: "Error verifying payment."
        });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });

        const history = db.payments
            .filter(p => p.userId === req.user._id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching payment history."
        });
    }
};

const getAdminPaymentHistory = async (req, res) => {
    try {
        if (req.user?.role !== "admin")
            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });

        const history = [...db.payments].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching admin payment history."
        });
    }
};

export {
    createOrder,
    verifyPayment,
    getPaymentHistory,
    getAdminPaymentHistory
};
