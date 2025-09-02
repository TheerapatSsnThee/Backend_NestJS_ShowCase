E-Commerce Platform API (Backend)
This repository contains the backend source code for a comprehensive E-Commerce platform, built with the NestJS framework. It provides a robust, scalable, and secure RESTful API designed to support all necessary e-commerce functionalities, from user authentication to order processing.

ภาษาไทย
Repository นี้ประกอบด้วยซอร์สโค้ดสำหรับระบบ Backend ของแพลตฟอร์มอีคอมเมิร์ซเต็มรูปแบบ พัฒนาด้วย NestJS โดยเป็น RESTful API ที่มีประสิทธิภาพ ปลอดภัย และสามารถขยายระบบได้ เพื่อรองรับฟังก์ชันการทำงานของอีคอมเมิร์ซที่จำเป็นทั้งหมด ตั้งแต่การยืนยันตัวตนผู้ใช้ไปจนถึงการจัดการคำสั่งซื้อ

✨ Features | คุณสมบัติเด่น
Authentication & Authorization: Secure JWT-based authentication with password hashing (bcrypt) and role-based access control (Admin, Staff, User).
Product Management: Full CRUD operations for products, including support for product variants and multiple image uploads.
Hierarchical Categories: Support for nested product categories (parent-child relationships).
High-Performance Shopping Cart: Utilizes Redis for fast and efficient shopping cart management.
Transactional Order System: A robust checkout process that ensures data integrity through database transactions, handling stock reduction, promotion application, and order creation atomically.
Promotion System: Flexible discount code management supporting both fixed-value and percentage-based promotions.
Payment Workflow: A complete payment process for bank transfers, including slip upload and admin verification.
Admin Dashboard: An endpoint for aggregating key business statistics, such as total sales, order counts, and new user registrations.
Asynchronous Job Queues: Implements BullMQ to handle background tasks, improving API response times.
Modular Architecture: Cleanly structured into distinct modules for high maintainability and scalability.

ระบบยืนยันตัวตนและจัดการสิทธิ์: การยืนยันตัวตนด้วย JWT ที่ปลอดภัย, การเข้ารหัสรหัสผ่าน (bcrypt) และระบบกำหนดสิทธิ์ตามบทบาท (Admin, Staff, User)
การจัดการสินค้า: ระบบจัดการสินค้าแบบ CRUD เต็มรูปแบบ รองรับตัวเลือกสินค้า (Variants) และการอัปโหลดรูปภาพหลายรูป
การจัดการหมวดหมู่แบบลำดับชั้น: รองรับหมวดหมู่สินค้าย่อย (ความสัมพันธ์แบบ Parent-Child)
ระบบตะกร้าสินค้าประสิทธิภาพสูง: ใช้ Redis ในการจัดการตะกร้าสินค้าเพื่อความรวดเร็ว
ระบบคำสั่งซื้อที่มั่นคง: กระบวนการสั่งซื้อที่รับประกันความถูกต้องของข้อมูลด้วย Database Transaction ครอบคลุมการตัดสต็อก, การใช้ส่วนลด, และการสร้างคำสั่งซื้อ
ระบบโปรโมชั่น: การจัดการโค้ดส่วนลดที่ยืดหยุ่น รองรับทั้งแบบมูลค่าคงที่และแบบเปอร์เซ็นต์
กระบวนการชำระเงิน: รองรับการชำระเงินโดยการโอนผ่านธนาคาร พร้อมระบบอัปโหลดสลิปและการยืนยันโดยผู้ดูแล
แดชบอร์ดสำหรับผู้ดูแล: Endpoint สำหรับรวบรวมสถิติที่สำคัญ เช่น ยอดขายรวม, จำนวนคำสั่งซื้อ, และผู้ใช้ใหม่
ระบบคิวสำหรับงานเบื้องหลัง: ใช้ BullMQ เพื่อจัดการงานที่ต้องใช้เวลาประมวลผลนาน (Asynchronous Tasks) เพื่อให้ API ตอบสนองได้รวดเร็วขึ้น
สถาปัตยกรรมแบบโมดูล: โครงสร้างโค้ดที่แบ่งเป็นสัดส่วนชัดเจน ง่ายต่อการบำรุงรักษาและต่อยอด

🚀 Technology Stack | เทคโนโลยีที่ใช้
Backend: NestJS, TypeScript, Express.js
Database: MySQL (Primary), Redis (for Cart & Caching/Queues)
ORM: TypeORM
Authentication: Passport.js (JWT Strategy), bcrypt
Job Queue: BullMQ
File Storage: AWS S3 (with local storage fallback for development)
Data Validation: class-validator, class-transformer
Configuration: @nestjs/config (.env)

⚙️ Getting Started | การติดตั้งและใช้งาน
Prerequisites | สิ่งที่ต้องมี
Node.js (>=16.0)

NPM
MySQL Server
Redis Server

Installation | การติดตั้ง
Clone the repository:
Bash
git clone https://github.com/TheerapatSsnThee/Backend_NestJS_ShowCase.git
cd Backend_NestJS_ShowCase
Install dependencies:

Bash
npm install
Setup environment variables:
Create a .env file in the root directory by copying the example file, then fill in your configuration details.

Bash
cp .env.example .env
You will need to update the database credentials, JWT secret, and other settings within the .env file.

Run the application:
The application will start on the port specified in your .env file (default is 3001).

Bash
# Development mode
npm run start:dev

📝 API Endpoints Overview | ภาพรวม API Endpoints
A brief overview of the main available endpoints:

Authentication
POST /auth/register: Register a new user.
POST /auth/login: Log in and receive a JWT.
Products & Categories
GET /products: Get a list of all products.
GET /products/:id: Get details for a single product.
GET /categories: Get a list of all categories.

Shopping Cart (Protected)
GET /cart: View the current user's cart.
POST /cart/items: Add an item to the cart.
Orders (Protected)
POST /orders/checkout: Create a new order from the cart.
GET /orders: Get the current user's order history.
Admin (Protected & Role-Restricted)
GET /admin/dashboard/stats: Get dashboard statistics.
GET /admin/users: Get a list of all users.
POST /admin/products: Create a new product.
