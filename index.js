import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import routes from './routes/routes.js';
import path from 'path';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server Started at port ${PORT}`);
});
