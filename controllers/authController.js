import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const register = async (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({success: false, message: 'Provide all Details'});
    }

    try {
        const existingUser = await userModel.findOne({email});
        if (existingUser) {
            return res.status(409).json({success: false, message: 'User already exists'});
        }

        // const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({name, email, password: password});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({success: true, message: "Registration successful"});
        
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};


export const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({success: false, message: 'Email and password are required'});
    }

    try {
        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(401).json({success: false, message: 'Invalid email'});
        }

        if (!user.isAccountVerified){
            return res.status(401).json({success: false, message: 'Account not Verified'});
        }

        // const isMatch = await bcrypt.compare(password, user.password);

        if (password != user.password) {
            return res.status(401).json({success: false, message: 'Invalid password'});
        }
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success: true, message: 'Logged in successfully'});

    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.json({success: true, message: 'Logged Out'});

    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
}

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.user;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ 
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                balance: user.balance
            }
        });
        
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
}