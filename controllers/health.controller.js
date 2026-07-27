import { getDBStatus } from '../database/db.js';

export const checkHealth = async (req, res) => {
    try {
        const dbStatus = getDBStatus();
        const healthStatus = {
            status: 'OK',
            // timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            timestamp: new Date().toString(),

            services: {
                database: {
                    status: dbStatus.isConnected ? 'healthy' : 'Unhealthy',
                    details: {
                        ...dbStatus,
                        readyStateText: getReadyStateText(dbStatus.readyState)
                    }
                },
                server: {
                    status: 'healthy',
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage()
                }
            }
        };
        const httpStatus = healthStatus.services.database.status === 'healthy' ? 200 : 500
        res.status(httpStatus).json(healthStatus)
    } catch (error) {
        console.error("Health Check Failed", error);
        res.status(550).json({
            status: "ERROR",
            timestamp: new Date.now().toISOString(),
            error: error.message
        })
    }
};

function getReadyStateText(state) {
    switch (state) {
        case 0: return 'disconnected';
        case 1: return "Connected";
        case 2: return "connecting";
        case 3: return "disconnecting";
        default: return "Unknown";

    }
}
