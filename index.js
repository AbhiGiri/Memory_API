import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import postRouters from './routes/posts.js';
import userRouters from './routes/users.js';

const app = express();
dotenv.config();

app.use(express.json({limit: "30mb", extended: true }));
app.use(express.urlencoded({limit: "30mb", extended: true }));
app.use(cors());
//routers
app.use('/posts', postRouters);
app.use('/user', userRouters);

app.get('/', (req, res) => {
    res.send('App is running...');
})

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL, { useUnifiedTopology: true})
    .then(() => {
        app.listen(PORT, () => {
            console.log('connected to db and listening server at port: 5000');
        });
    })
    .catch(error => {
        console.log(error.message);
    });

