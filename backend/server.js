
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { handleIngestion } from './ingestion.js';
import { handleSearch } from './search.js';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// MongoDB Atlas Connection
const MONGO_URI = 'mongodb+srv://deenavenkatesan2006_db_user:deena2006@cluster0.xcfu56c.mongodb.net/opsmind?authSource=admin&retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (OpsMind DB)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.post('/api/ingest', upload.array('pdfs'), handleIngestion);
app.post('/api/search', handleSearch);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 OpsMind AI Backend running on port ${PORT}`);
});
