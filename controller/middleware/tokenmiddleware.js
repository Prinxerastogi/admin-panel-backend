
const jwt = require("jsonwebtoken");

const sellerJWTToken = process.env.SELLER_JWT_SECRET_KEY;
const adminJWTToken = process.env.ADMIN_JWT_SECRET_KEY; 
const userJWTToken = process.env.JWT_SECRET_KEY;

/**
 * Factory to create JWT middleware with role-based access control.
 * @param {string[]} [allowedRoles] - Roles allowed to access this route (e.g., ["admin", "seller", "internal", "user"])
 */
function createRoleBasedJwtAuth(allowedRoles = []) {
    const verifyWith = (secret, token) =>
        new Promise((resolve, reject) =>
            jwt.verify(token, secret, (err, decoded) =>
                err ? reject(err) : resolve(decoded)
            )  
        );
 
    return async function roleBasedJwtAuth(req, res, next) {
        if (req.headers["x-api-key"] === process.env.crossApiKey) {
            req.decoded = {
                authType: "internal",
            };
            return next();
        }

        const authHeader =
            req.headers.authorization || req.headers["x-access-token"];
        if (!authHeader) {
            return res
                .status(401)
                .json({ error: "Authorization header missing" });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : authHeader.trim();

        try {
            let payload;
            let role = "";

            try {
                payload = await verifyWith(adminJWTToken, token);
                    role = "admin";  
            } catch {
                try {
                    payload = await verifyWith(sellerJWTToken, token);
                role = "seller";
                } catch {
                    payload = await verifyWith(userJWTToken, token);
                    role = "user";
                }
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
                return res
                    .status(403)
                    .json({ error: "Access denied for this role" });
            }

            req.decoded = { ...payload, role: role };
            return next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
    };
}

module.exports = createRoleBasedJwtAuth;
