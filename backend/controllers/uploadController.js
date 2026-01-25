const uploadService = require('../services/uploadService');

class UploadController {
  
  // Upload single image
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please select a file to upload'
        });
      }

      const result = await uploadService.processSingleUpload(req.file);
      
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: result
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Upload failed'
      });
    }
  }

  // Upload multiple images
  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please select files to upload'
        });
      }

      const results = await uploadService.processMultipleUploads(req.files);
      
      res.status(200).json({
        success: true,
        message: 'Files uploaded successfully',
        data: results
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Upload failed'
      });
    }
  }

  // Delete image
  async deleteImage(req, res) {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Filename is required'
        });
      }

      const result = await uploadService.deleteFile(filename);
      
      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // List all uploaded images
  // List all uploaded images - FIXED PATH
async listImages(req, res) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // IMPORTANT: Fix the path based on your actual folder structure
    // Try these paths one by one:
    
    // Option 1: If controllers are in src/controllers and uploads is in root
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    
    // Option 2: If everything is in same folder
    // const uploadsDir = path.join(__dirname, 'uploads');
    
    // Option 3: From current working directory
    // const uploadsDir = path.join(process.cwd(), 'uploads');
    
    console.log('📂 Looking for uploads at:', uploadsDir);
    console.log('📂 Current directory (__dirname):', __dirname);
    
    // Check if folder exists
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Folder not found, creating it...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Uploads folder created, but empty'
      });
    }
    
    const files = fs.readdirSync(uploadsDir);
    console.log('📄 Found files:', files);
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        filename: file,
        imageUrl: `${baseUrl}/uploads/${file}`,
        url: `${baseUrl}/uploads/${file}`
      }));

    console.log('✅ Images found:', images.length);
    
    res.status(200).json({
      success: true,
      data: images,
      count: images.length
    });

  } catch (error) {
    console.error('❌ Error in listImages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list images',
      error: error.message,
      stack: error.stack // Add stack trace for debugging
    });
  }
}
}

module.exports = new UploadController();