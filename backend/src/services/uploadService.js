import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // Root par jo config/cloudinary.js hai usko target karega

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 🚨 FIX: Check karein agar filename ke andar standard extension hai ya nahi
    const hasExtension = file.originalname && file.originalname.includes(".");
    
    return {
      folder: "civiceye",
      // 🚨 CRITICAL FIX: Agar browser camera dynamic blob bhej raha hai bina format ke, 
      // toh use explicit format 'jpeg' de do taaki allowed_formats use silent block na kare!
      format: hasExtension ? undefined : "jpeg", 
      resource_type: "image",
      public_id: `complaint-${Date.now()}-${Math.round(Math.random() * 1E4)}`
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Safe 5MB limit check
});

export default upload;