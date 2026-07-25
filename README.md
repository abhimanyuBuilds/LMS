<h1 align="center">
🚀 Learning Management System (LMS) Backend API
</h1>

<p align="center">
Production-ready LMS Backend built using Node.js, Express.js, MongoDB, JWT, Stripe, Razorpay, Cloudinary, and Mongoose.
</p>

<p align="center">
<img src="https://img.shields.io/badge/Node.js-24.x-green"/>
<img src="https://img.shields.io/badge/Express.js-5.x-black"/>
<img src="https://img.shields.io/badge/MongoDB-Database-green"/>
<img src="https://img.shields.io/badge/JWT-Authentication-orange"/>
<img src="https://img.shields.io/badge/Stripe-Payments-purple"/>
<img src="https://img.shields.io/badge/Razorpay-Payments-blue"/>
<img src="https://img.shields.io/badge/Cloudinary-Media-red"/>
<img src="https://img.shields.io/badge/License-MIT-yellow"/>
</p>

---

<h2>📌 Overview</h2>

This LMS backend is designed following production-grade practices and supports:

<ul>
<li>JWT Authentication & Authorization</li>
<li>Role Based Access Control (Student, Instructor, Admin)</li>
<li>Course & Lecture Management</li>
<li>Student Progress Tracking</li>
<li>Cloudinary Media Storage</li>
<li>Stripe & Razorpay Payment Integration</li>
<li>Rate Limiting & Request Validation</li>
<li>Health Monitoring Endpoint</li>
<li>Centralized Error Handling</li>
<li>RESTful API Architecture</li>
</ul>

---

<h2>🏗 Architecture</h2>

<pre>
Client
   |
   ▼
Express Router
   |
Middlewares
   |
├── JWT Authentication
├── Role Authorization
├── Joi Validation
├── Rate Limiting
├── Error Handling
|
Controllers
   |
Services
   |
MongoDB
   |
Cloudinary / Stripe / Razorpay
</pre>

---

<h2>🔐 Security Features</h2>

<table>
<tr>
<th>Feature</th>
<th>Description</th>
</tr>

<tr>
<td>JWT Authentication</td>
<td>HTTP Only Access & Refresh Tokens</td>
</tr>

<tr>
<td>RBAC</td>
<td>Student, Instructor, Admin Permissions</td>
</tr>

<tr>
<td>bcryptjs</td>
<td>Password Hashing</td>
</tr>

<tr>
<td>Rate Limiting</td>
<td>Prevents Brute Force Attacks</td>
</tr>

<tr>
<td>Joi Validation</td>
<td>Validates Incoming Requests</td>
</tr>

<tr>
<td>HTTP Only Cookies</td>
<td>Protects Against XSS</td>
</tr>

<tr>
<td>HMAC Verification</td>
<td>Razorpay Signature Verification</td>
</tr>

<tr>
<td>Token Expiry</td>
<td>Password Reset & Email Verification</td>
</tr>

</table>

---

<h2>⚡ Middleware Stack</h2>

<h3>Authentication Middleware</h3>

<ul>
<li>verifyJWT</li>
<li>restrictTo(...roles)</li>
</ul>

<h3>Rate Limiting</h3>

<ul>
<li>apiLimiter</li>
<li>signUpRateLimit</li>
<li>signInRateLimit</li>
<li>forgotPasswordRateLimit</li>
<li>changePasswordRateLimit</li>
<li>deleteUserAccountRateLimit</li>
<li>resendVerificationMailRateLimit</li>
</ul>

<h3>Validation</h3>

<ul>
<li>validateSignUp</li>
<li>validateSignIn</li>
<li>validatePasswordChanged</li>
<li>paginationSchema</li>
</ul>

---

<h2>🛡 Role Based Access Control</h2>

<table>
<tr>
<th>Role</th>
<th>Permissions</th>
</tr>

<tr>
<td>Student</td>
<td>Enroll, Watch Lectures, Track Progress</td>
</tr>

<tr>
<td>Instructor</td>
<td>Create Courses, Upload Lectures</td>
</tr>

<tr>
<td>Admin</td>
<td>Manage Entire Platform</td>
</tr>
</table>

---

<h2>📂 Project Structure</h2>

<pre>
src/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── database/
├── utils/
├── validations/
├── tests/
├── config/
└── app.js
</pre>

---

<h2>📈 Health Check Response</h2>

<pre>
{
    "status": "OK",
    "timestamp": "2026-07-25T11:56:43.109Z",
    "services": {
        "database": {
            "status": "healthy"
        }
    }
}
</pre>

---

<h2>📡 API Modules</h2>

<ul>
<li>User Module</li>
<li>Course Module</li>
<li>Lecture Module</li>
<li>Progress Module</li>
<li>Payment Module</li>
<li>Health Module</li>
</ul>

---

<h2>💳 Payment Flow</h2>

<pre>
Student
   |
   ▼
Purchase Course
   |
Stripe / Razorpay
   |
Payment Success
   |
Webhook Verification
   |
Create Purchase Record
   |
Enroll Student
   |
Unlock Lectures
</pre>

---

<h2>📚 Validation Rules</h2>

<h3>Password Policy</h3>

<ul>
<li>8-20 Characters</li>
<li>1 Uppercase Letter</li>
<li>1 Lowercase Letter</li>
<li>1 Number</li>
<li>1 Special Character</li>
</ul>

Example:

<pre>
Password@123
</pre>

---

<h2>🚦 Rate Limits</h2>

<table>
<tr>
<th>Endpoint</th>
<th>Limit</th>
</tr>

<tr>
<td>Signup</td>
<td>5 Requests / 10 Minutes</td>
</tr>

<tr>
<td>Signin</td>
<td>5 Requests / 10 Minutes</td>
</tr>

<tr>
<td>Forgot Password</td>
<td>3 Requests / 10 Minutes</td>
</tr>

<tr>
<td>Delete Account</td>
<td>3 Requests / 10 Minutes</td>
</tr>

<tr>
<td>Verification Email</td>
<td>2 Requests / 5 Minutes</td>
</tr>
</table>

---

<h2>🧪 Testing</h2>

<ul>
<li>Jest</li>
<li>Supertest</li>
<li>MongoDB Test Database</li>
<li>Unit Testing</li>
<li>Integration Testing</li>
</ul>

---

<h2>🚀 Future Improvements</h2>

<ul>
<li>Redis Caching</li>
<li>RabbitMQ</li>
<li>Docker Support</li>
<li>Microservices Architecture</li>
<li>Swagger Documentation</li>
<li>CI/CD Pipeline</li>
<li>AWS Deployment</li>
<li>WebSocket Notifications</li>
</ul>

---

<h2>👨‍💻 Author</h2>

<p>
<b>Abhimanyu Singh</b><br>
Backend Developer | Node.js | MongoDB | AWS Enthusiast
</p>

<p>
<a href="www.linkedin.com/in/abnalwa07">LinkedIn</a>
</p>

---

<h2 align="center">
⭐ If you found this project useful, don't forget to star the repository!
</h2>