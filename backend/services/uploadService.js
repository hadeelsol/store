const fs = require('fs');
const path = require('path');

class UploadService {
  
  // Process single upload
  async processSingleUpload(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      // Delete invalid file
      fs.unlinkSync(file.path);
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP allowed');
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(file.path);
      throw new Error('File size too large. Maximum 5MB allowed');
    }

    // Generate URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;

    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      imageUrl: imageUrl,
      path: file.path
    };
  }

  async processMultipleUploads(files) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const results = [];
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    for (const file of files) {

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!allowedTypes.includes(file.mimetype)) {
        fs.unlinkSync(file.path);
        throw new Error(`Invalid file type for ${file.originalname}`);
      }

      if (file.size > 5 * 1024 * 1024) {
        fs.unlinkSync(file.path);
        throw new Error(`File too large for ${file.originalname}`);
      }

      results.push({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        imageUrl: `${baseUrl}/uploads/${file.filename}`,
        path: file.path
      });
    }

    return results;
  }

  // Delete uploaded file
  async deleteFile(filename) {
    const filePath = path.join('uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true, message: 'File deleted successfully' };
    } else {
      throw new Error('File not found');
    }
  }
}

module.exports = new UploadService();