import mongoose, { get } from "mongoose"
const MAX_RETRY = 3;
const RETRY_INTERVAL = 5000;


class DataBaseConnection {
    constructor() {
        this.retryCount = 0;
        this.isConnected = false;


        // configure mongoose setting

        mongoose.set('strictQuery', true)

        // register a new event


        mongoose.connection.on('connected', () => {
            console.log('mongodb connected successfully✅')
            this.isConnected = true
        });

        mongoose.connection.on('error', (err) => {
            console.log('mongodb connection error ❌', err)
            this.isConnected = false
        });

        mongoose.connection.on('disconnect', () => {
            console.log('mongodb disconnected⚠️')
            this.isConnected = false;
        });

        process.on('SIGNINT' , this.handleAppTermination.bind(this))
        process.on('SIGTERM' , this.handleAppTermination.bind(this))
    }

    async connect() {
        try {
            if (!process.env.MONGODB_URI) {
                throw new Error('MONGODB URI is not defined in environment veriable')
            }

            const connectionOption = {
                maxPoolSize: 10,
                serverSelectionTimeoutMs: 5000, // wait 5 second to find mongoDB
                socketTimeoutMs: 45000, // wait 45 sec before killing inactive socket
                family: 4 // use ipv4
            }

            if (process.env.NODE_ENV === 'development') {
                mongoose.set('debug', true) // here i'm accepting debugging console
            }

            console.log(`${process.env.MONGODB_URI} is a DB uri`)
            await mongoose.connect(process.env.MONGODB_URI, connectionOption)
            this.retryCount = 0 // reset retry count on successful connection
        } catch (error) {
            console.error("Failed to connect to mongoDB", error.message)
        }
    }

    async handleConnectionError() {
        if (this.retryCount < MAX_RETRY) {
            this.retryCount++
            console.log(`Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRY}`)
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL))
            return this.connect()
        } else {
            console.error(`Failed to connect to mongoDB after ${MAX_RETRY} attempts`)
            process.exit(1)
        }
    }
    handleDiscconnection(){
        if(!this.isConnected){
            console.log('Attempting to connect to MongoDB...')
            this.connect()
        }
    }
    async handleAppTermination(){
        try {
            await mongoose.connection.close()
            console.log('MongoDB connection closed through app termination')
            process.exit(0)
        } catch (err) {
            console.error('Error during database connection:',err)
            process.exit(1)
        }
    }

    getConnectionStatus(){
        return {
           isConnected: this.isConnected , 
           readyState: mongoose.connection.readyState,
           host: mongoose.connection.host , 
           name: mongoose.connection.name
        };
    }
}


const dbConnection = new DataBaseConnection()

export default dbConnection.connect.bind(dbConnection)
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection)


