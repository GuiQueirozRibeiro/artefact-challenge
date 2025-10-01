# Task Manager Application

## Overview

A simple yet robust task management system built with Next.js 15, tRPC, and TypeScript following Clean Code principles.

## Features

- ✅ Full CRUD operations for tasks
- ✅ Server-Side Rendering (SSR) for optimal performance
- ✅ Optimistic UI updates for better UX
- ✅ Real-time validation and error handling
- ✅ Infinite scroll with intersection observer
- ✅ Responsive design
- ✅ Type-safe API with tRPC
- ✅ Clean architecture and reusable components

## Project Structure

\`\`\`
app/
├── \_components/
│ ├── task-list.tsx # Task list with infinite scroll
│ └── task-form.tsx # Reusable form component
├── tasks/
│ ├── new/
│ │ └── page.tsx # Create task page
│ └── [id]/
│ └── edit/
│ └── page.tsx # Edit task page
└── page.tsx # Home page with SSR

server/
└── api/
└── routers/
└── task.ts # tRPC router with business logic

lib/
└── utils.ts # Utility functions
\`\`\`

## Key Design Decisions

### 1. Clean Code Principles

- **Single Responsibility**: Each component has one clear purpose
- **DRY**: Reusable TaskForm component for create/edit operations
- **Clear Naming**: Descriptive function and variable names
- **Type Safety**: Full TypeScript coverage with proper interfaces

### 2. Performance Optimizations

- **SSR**: Pre-fetching data on server for faster initial load
- **Optimistic Updates**: Immediate UI feedback on mutations
- **Infinite Scroll**: Efficient loading of large task lists
- **Cache Management**: Smart invalidation strategies

### 3. User Experience

- **Loading States**: Visual feedback during data fetching
- **Error Handling**: Clear error messages with recovery options
- **Form Validation**: Real-time validation with character counts
- **Responsive Design**: Works on all device sizes

### 4. Architecture

- **Separation of Concerns**: Clear separation between UI and business logic
- **Component Composition**: Small, focused components
- **Consistent Patterns**: Uniform error handling and data flow

## Running the Application

\`\`\`bash

# Install dependencies

npm install

# Run development server

npm run dev

# Build for production

npm run build

# Start production server

npm start
\`\`\`

## API Endpoints (tRPC Procedures)

- \`task.create\`: Create a new task
- \`task.list\`: Get all tasks
- \`task.listPaginated\`: Get tasks with pagination
- \`task.getById\`: Get single task by ID
- \`task.update\`: Update existing task
- \`task.delete\`: Delete task
