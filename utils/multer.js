import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req , res , cb){
        cb(null , `../upload`)
    },
    filename: function(req , res , cb){
        cb(null , `${Date.now()}-${file.originalname}`)
    },
});



export const upload = multer({
    storage , 
    limit: {
        fileSize: 8 * 1000  * 1000 // 8mb
    }
})