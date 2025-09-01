import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  /**
   * จำลองการอัปโหลดไฟล์โดยการบันทึกไฟล์ลงในเครื่อง (Local Storage)
   * สำหรับการทดสอบและพัฒนาก่อนนำขึ้น Production
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    // 1. กำหนดตำแหน่งที่จะบันทึกไฟล์
    // เราจะสร้างโฟลเดอร์ชื่อ 'uploads' ขึ้นมาใน root ของโปรเจกต์ backend
    const uploadPath = path.join(__dirname, '..', '..', 'uploads');

    // 2. สร้างโฟลเดอร์ 'uploads' หากยังไม่มี
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // 3. สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const destination = path.join(uploadPath, uniqueFilename);

    // 4. บันทึกไฟล์ลงในตำแหน่งที่กำหนด
    await fs.promises.writeFile(destination, file.buffer);

    // 5. คืนค่าเป็น Path ที่สามารถเข้าถึงได้จากภายนอก (จำลอง)
    // ใน Production จริง ค่านี้จะเป็น URL จาก S3
    // แต่สำหรับการพัฒนา เราจะใช้ Path ที่สัมพันธ์กับเซิร์ฟเวอร์
    // **หมายเหตุ:** เรายังต้องตั้งค่าให้ Express สามารถ Serve ไฟล์จากโฟลเดอร์นี้ได้
    return `/uploads/${uniqueFilename}`;
  }
}