import mongoose from 'mongoose';
import PostMessage from "../models/postMessage.js";

export const getPosts = async (req, res) => {
    const { page } = req.query;
console.log(`${page} from query`);
    try {
        const LIMIT = 8;
        const startIndex = (Number(page) -1 ) * LIMIT; //get the starting index of every page
        const total = await PostMessage.countDocuments({});
        
        const posts = await PostMessage.find().sort({ _id: -1}).limit(LIMIT).skip(startIndex);
        console.log(`${Number(page)} from posts`);
        res.status(200).json({data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total/LIMIT)});

    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

export const getPost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await PostMessage.findById(id);
        res.status(200).json({data: post});

    } catch (error) {
        res.status(404).json({message: error.message});
    }
};
//Query ---> /posts?page=1 ---> page = 1
//Params ---> /posts/id:123 ---> id = 123 
export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, "i");

        const posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]});

        res.json({ data: posts });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const post = req.body;
    const newPost = new PostMessage({...post, creator: req.userId, createdAt: new Date().toISOString()});
    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

export const updatePost = async (req, res) => {
    try {
        const {id: _id} = req.params;
        const post = req.body;
        if(!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(404).json('No post with that id');
        }
        const updatePost = await PostMessage.findByIdAndUpdate(_id, { ...post, _id}, {new: true});
        res.status(200).json(updatePost);

    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

export const deletePost = async (req, res) => {
    try {
        const {id: _id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(404).json('No post with that id');
        }
        const deletePost = await PostMessage.findByIdAndRemove(_id);
        res.status(201).json({message: 'post deleted successfully'});
    } catch (error) {
        res.status(404).json({message: error.message})
    }
};

export const likePost = async (req, res) => {
    try {
        const {id: _id } = req.params;
        if(!req.userId) return res.json({message: 'Unauthenticated'});
        if(!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(404).json('No post with that id');
        }
        const post = await PostMessage.findById(_id);
        const index = post.likes.findIndex((id) => id === String(req.userId));

        if(index === -1) {
            // like a post
            post.likes.push(req.userId);
        } else {
            //dislike a post
            post.likes = post.likes.filter((id) => id !== String(req.userId));
        }
        const updatePost = await PostMessage.findByIdAndUpdate(_id, post, {new: true});
        res.status(200).json(updatePost);

    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

export const commentPost = async (req, res) => {
        const { id } =  req.params;
        const { comment } =  req.body;
        const post = await PostMessage.findById(id);
        post.comments.push(comment);
        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {new: true});
        // console.log(updatedPost);
        res.status(200).json(updatedPost);
}