import { Router } from "express";
import { loginUSer, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.conroller.js";
import {upload} from "../middlewares/multer.middleware.js"
// import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUSer)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser).post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router