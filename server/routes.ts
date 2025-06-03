import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertTransactionSchema, insertCategorySchema } from "@shared/schema";
import { emailService } from "./email";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Токен доступа отсутствует" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Недействительный токен" });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Пользователь с таким email уже существует" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Неверный email или пароль" });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Неверный email или пароль" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Пользователь с таким email не найден" });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const emailSent = await emailService.sendPasswordResetEmail(email, resetToken, frontendUrl);
      
      if (emailSent) {
        res.json({ message: "Инструкции по восстановлению пароля отправлены на ваш email" });
      } else {
        res.json({ message: "Инструкции по восстановлению пароля отправлены на ваш email" });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  // Protected routes
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.patch("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.userId, {
        firstName,
        lastName,
        email,
      });

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Ошибка обновления профиля" });
    }
  });

  app.patch("/api/user/password", authenticateToken, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Неверный текущий пароль" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(req.user.userId, { password: hashedNewPassword });

      res.json({ message: "Пароль успешно изменен" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Ошибка изменения пароля" });
    }
  });

  app.get("/api/user/stats", authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getUserStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      console.error("User stats error:", error);
      res.status(500).json({ message: "Ошибка получения статистики" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", authenticateToken, async (req: any, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.user.userId);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.post("/api/transactions", authenticateToken, async (req: any, res) => {
    try {
      const amount = typeof req.body.amount === 'string' 
        ? parseFloat(req.body.amount) 
        : req.body.amount;

      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        amount
      });
      
      let ecoImpact = 0;
      const amountNumber = typeof validatedData.amount === 'string'
        ? parseFloat(validatedData.amount)
        : validatedData.amount;
      
      switch (validatedData.category) {
        case "transport":
          ecoImpact = amountNumber * 0.2;
          break;
        case "food":
          ecoImpact = amountNumber * 0.15;
          break;
        case "shopping":
          ecoImpact = amountNumber * 0.1;
          break;
        case "utilities":
          ecoImpact = amountNumber * 0.25;
          break;
        default:
          ecoImpact = amountNumber * 0.05;
      }

      const transaction = await storage.createTransaction({
        ...validatedData,
        userId: req.user.userId,
        amount: amountNumber,
        ecoImpact: ecoImpact,
        date: new Date(validatedData.date + 'T00:00:00.000Z'),
      });

      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0].message,
          errors: error.errors
        });
      }
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.delete("/api/transactions/:id", authenticateToken, async (req: any, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Неверный ID транзакции" });
      }

      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Транзакция не найдена" });
      }

      if (transaction.userId !== req.user.userId) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      await storage.deleteTransaction(transactionId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  // Category routes
  app.get("/api/categories", authenticateToken, async (req: any, res) => {
    try {
      const { type } = req.query;
      const categories = await storage.getUserCategories(req.user.userId, type);
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.post("/api/categories", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      
      const category = await storage.createCategory({
        ...validatedData,
        userId: req.user.userId,
      });

      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create category error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.delete("/api/categories/:id", authenticateToken, async (req: any, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Неверный ID категории" });
      }

      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Категория не найдена" });
      }

      if (category.userId !== req.user.userId) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      await storage.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  // Monthly reports
  app.get("/api/reports/monthly", authenticateToken, async (req: any, res) => {
    try {
      const { month, year } = req.query;
      const monthlyData = await storage.getMonthlyReport(
        req.user.userId,
        parseInt(month as string) || new Date().getMonth() + 1,
        parseInt(year as string) || new Date().getFullYear()
      );
      res.json(monthlyData);
    } catch (error) {
      console.error("Monthly report error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  const httpServer = createServer(app);
  return httpServer;
}