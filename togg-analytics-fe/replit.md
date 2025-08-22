# Overview

This is a full-stack vehicle analytics application for Togg electric vehicles built with React, Express, and PostgreSQL. The application allows users to track their vehicle data, monitor travel analytics, and view dashboard insights. It features a modern UI built with shadcn/ui components and uses Drizzle ORM for database operations with Neon Database as the PostgreSQL provider.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **Routing**: Wouter for client-side routing with authentication-based route protection
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build System**: Vite with custom configuration for development and production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Authentication**: OpenID Connect (OIDC) integration with Replit authentication
- **Session Management**: Express sessions with PostgreSQL session store using connect-pg-simple
- **API Design**: RESTful API endpoints with proper error handling and logging middleware
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations

## Data Storage Solutions
- **Primary Database**: PostgreSQL (Neon Database) for persistent data storage
- **Session Storage**: PostgreSQL table for user session management
- **Schema Management**: Drizzle migrations with schema defined in shared directory
- **Database Tables**: 
  - Users table for authentication and profile data
  - Vehicles table with user relationship and vehicle metadata
  - Travel data table for trip analytics and metrics
  - Sessions table for authentication session persistence

## Authentication and Authorization
- **Authentication Method**: OpenID Connect integration with Replit's identity provider
- **Session Strategy**: Server-side sessions with secure HTTP-only cookies
- **Authorization**: User-based access control with middleware protection on API routes
- **Security Features**: CSRF protection, secure cookie settings, and proper session expiration

## API Structure
- **Authentication Endpoints**: `/api/auth/user` for user profile retrieval
- **Vehicle Management**: CRUD operations for vehicles with user ownership validation
- **Travel Analytics**: Endpoints for travel data collection and analytics generation
- **Middleware Stack**: Authentication checks, request logging, JSON parsing, and error handling

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting with connection pooling
- **Database Connection**: `@neondatabase/serverless` driver for optimal serverless performance

## Authentication Services
- **Replit Authentication**: OpenID Connect provider for user authentication and identity management
- **Session Management**: PostgreSQL-backed session storage for scalable session handling

## UI and Component Libraries
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility and customization
- **shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography throughout the application

## Development and Build Tools
- **Vite**: Modern build tool with hot module replacement and optimized production builds
- **TypeScript**: Type safety across frontend and backend with shared type definitions
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Drizzle Kit**: Database migration and schema management toolkit

## Utility Libraries
- **TanStack Query**: Server state management with caching, background updates, and error handling
- **Wouter**: Lightweight client-side routing library
- **date-fns**: Date manipulation and formatting utilities
- **class-variance-authority**: Type-safe CSS class composition for component variants