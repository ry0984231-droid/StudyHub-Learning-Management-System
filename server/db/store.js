import { MongoClient } from "mongodb";
import { isDeepStrictEqual } from "node:util";
import { config } from "../config/config.js";

const collectionNames = [
    "users", "courses", "lessons", "quizzes", "quizAttempts",
    "enrollments", "reviews", "payments", "certificates",
    "notifications", "contactMessages", "studyEvents"
];

const emptyDatabase = () =>
    Object.fromEntries(collectionNames.map(name => [name, []]));

class DocumentStore {
    data = emptyDatabase();
    client = null;
    database = null;
    saveQueue = Promise.resolve();
    persisted = emptyDatabase();

    async connect() {
        if (!config.mongoUri)
            throw new Error(
                "MONGODB_URI is required. Set it in .env before starting StudyHub."
            );

        this.client = new MongoClient(config.mongoUri, {
            serverSelectionTimeoutMS: 10000
        });
        try {
            await this.client.connect();
        } catch (error) {
            await this.client.close().catch(() => undefined);
            this.client = null;
            const code = error?.code || error?.cause?.code;
            const reason = [error?.name, code].filter(Boolean).join(" / ");
            throw new Error(
                `Could not connect to MongoDB${reason ? ` (${reason})` : ""}. Check MONGODB_URI, database credentials, network access/IP allow-list, and the Docker MongoDB service.`
            );
        }
        this.database = this.client.db(config.mongoDbName);

        const records = await Promise.all(
            collectionNames.map(async name => [
                name,
                await this.collection(name).find({}).toArray()
            ])
        );

        records.forEach(([name, data]) => (this.data[name] = data));

        await Promise.all([
            this.collection("users").createIndex(
                { email: 1 }, { unique: true }
            ),
            this.collection("courses").createIndex(
                { slug: 1 }, { unique: true }
            ),
            this.collection("enrollments").createIndex(
                { userId: 1, courseId: 1 }, { unique: true }
            ),
            this.collection("certificates").createIndex(
                { certificateId: 1 }, { unique: true }
            ),
            this.collection("payments").createIndex(
                { paymentId: 1 }, { unique: true, sparse: true }
            ),
            this.collection("payments").createIndex(
                { orderId: 1 }, { unique: true, sparse: true }
            )
        ]);

        this.persisted = structuredClone(this.data);

        console.log(
            `Connected to MongoDB database: ${config.mongoDbName}`
        );
    }

    collection(name) {
        if (!this.database)
            throw new Error("MongoDB has not been connected.");
        return this.database.collection(name);
    }

    save() {
        const snapshot = structuredClone(this.data);
        const operation = this.saveQueue.catch(() => undefined).then(async () => {
            await Promise.all(collectionNames.map(async name => {
                const collection = this.collection(name);
                const previous = new Map(
                    this.persisted[name].map(record => [String(record._id), record])
                );
                const current = new Map(
                    snapshot[name].map(record => [String(record._id), record])
                );
                const writes = [];

                for (const record of snapshot[name]) {
                    const oldRecord = previous.get(String(record._id));
                    if (!oldRecord || !isDeepStrictEqual(oldRecord, record))
                        writes.push({
                            replaceOne: {
                                filter: { _id: record._id },
                                replacement: record,
                                upsert: true
                            }
                        });
                }

                if (writes.length)
                    await collection.bulkWrite(writes, { ordered: true });

                const removedIds = [...previous.keys()]
                    .filter(id => !current.has(id))
                    .map(id => previous.get(id)._id);
                if (removedIds.length)
                    await collection.deleteMany({ _id: { $in: removedIds } });

                this.persisted[name] = snapshot[name];
            }));
        });

        this.saveQueue = operation;
        operation.catch(error =>
            console.error("MongoDB persistence error:", error)
        );
        return operation;
    }

    async close() {
        await this.client?.close();
    }

    get users() { return this.data.users; }
    get courses() { return this.data.courses; }
    get lessons() { return this.data.lessons; }
    get quizzes() { return this.data.quizzes; }
    get quizAttempts() { return this.data.quizAttempts; }
    get enrollments() { return this.data.enrollments; }
    get reviews() { return this.data.reviews; }
    get payments() { return this.data.payments; }
    get certificates() { return this.data.certificates; }
    get notifications() { return this.data.notifications; }
    get contactMessages() { return this.data.contactMessages; }
    get studyEvents() { return this.data.studyEvents; }
}

export const db = new DocumentStore();
