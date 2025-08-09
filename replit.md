# Overview

PointZero Designs is a custom 3D printing service application built as a full-stack web platform. The application allows customers to upload 3D model files (STL, OBJ, 3MF), automatically analyze them for weight and print time estimation, and place orders with delivery or meetup options. The system features a modern React frontend with a dark theme optimized for 3D printing aesthetics, an Express.js backend with file upload capabilities, and email notifications for order processing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **Styling**: Custom dark theme with cyan accents designed for 3D printing industry aesthetics
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **File Uploads**: Multer middleware with file type validation (STL, OBJ, 3MF files up to 50MB)
- **Email Service**: Nodemailer integration for order confirmations and notifications
- **API Design**: RESTful endpoints with JSON responses and comprehensive error handling
- **Development**: Hot reload with Vite integration for seamless development experience

## Data Storage Solutions
- **Primary Database**: PostgreSQL configured through Drizzle ORM
- **Database Client**: Neon Database serverless connection (@neondatabase/serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Fallback Storage**: In-memory storage implementation for development/testing
- **Session Management**: PostgreSQL session store (connect-pg-simple) for persistent sessions

## Database Schema Design
The orders table includes comprehensive fields for:
- Customer information (name, phone, delivery preferences)
- Address fields for delivery option
- 3D model analysis data (file name, weight, print time estimates)
- Cost calculations (base cost, support removal fees, total)
- Order status tracking (pending, confirmed, in_progress, completed)
- Timestamp tracking for order lifecycle

## File Processing System
- **3D Model Analysis**: Mock analysis system that estimates print weight and time based on file size
- **File Validation**: Strict file type checking limited to common 3D printing formats
- **Cost Calculation**: Automated pricing based on estimated material weight and optional support removal services
- **Upload Security**: File size limits and type restrictions to prevent malicious uploads

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity for serverless environments
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-kit**: Database migration and schema management tools

## UI and Styling Libraries
- **@radix-ui/***: Comprehensive set of accessible, headless UI components
- **tailwindcss**: Utility-first CSS framework for consistent styling
- **class-variance-authority**: Component variant management for Tailwind
- **clsx**: Conditional className utility

## Form and Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for various schema libraries
- **zod**: TypeScript-first schema validation

## Backend Services
- **multer**: Multipart/form-data handling for file uploads
- **nodemailer**: Email sending capabilities for order notifications
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development enhancements
- **tsx**: TypeScript execution for development server

## Query Management
- **@tanstack/react-query**: Server state management with caching and synchronization