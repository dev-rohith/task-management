## Task Management System Assessment - TypeScript
### Note: Please read all the instructions before starting the assessment.

## Assignment Overview

You are tasked with completing a role-based user management system built with TypeScript, Node.js, Express, and Mongoose ORM.

**Technology Stack:** TypeScript, Node.js, Express, Drizzle ORM

## Submission Requirements
- Complete the implementation within the given timeframe
- Ensure all existing tests pass
- Document any assumptions or design decisions made
- Code should be production-ready quality

## Environment Setup
Ensure you have the following configured in your `.env` file:
```bash
# You can use a local database URL or a remote database URL for testing.
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

## Setup Instructions
```bash
npm install        # Install all project dependencies
npm run dev        # Start the development server
npm test           # Run all tests
```
### Note: Do not make any changes to the test case files or the workflows/scripts, as doing so will lead to automatic disqualification.

#### Note: Please go through all the source code, understand it thoroughly, and follow the comments for what needs to be done.

You've been provided with a partially implemented API codebase that simulates a real-world scenario where you need to debug existing functionality and complete missing features. This assessment evaluates your ability to work with existing code, implement RESTful APIs, and maintain code quality standards.

## Task Description
Fix existing issues and implement missing task CRUD features in the provided repository.
### Go to :- models/task.ts and routes/task.ts complete this files first then walk through all the code and understand problem solution run tests make sure all passing

## Task CRUD Operations
Please go to `routes/task.ts` and complete the TODO Items.
| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/tasks` | POST | Create task | `201` + task object |
| `/api/tasks` | GET | List tasks | `200` + array (supports `status` filter, pagination) |
| `/api/tasks/:id` | GET | Get task by ID | `200` + task or `404` |
| `/api/tasks/:id` | PUT | Update task | `200` + updated task |
| `/api/tasks/:id` | DELETE | Delete task | `204` or `404` |

## Error Handling
- `400` - Invalid input
- `401` - Authentication failure  
- `404` - Resource not found

## Project Structure
```
src/
├── config/          # DB, environment config
├── controllers/     # API handlers
├── middleware/      # Auth, error handling
├── models/          # Database models
├── routes/          # Express routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utilities, error classes
└── tests/           # Test suites
```

## What We're Looking For
- **Problem-solving skills** - Debug and fix existing authentication issues
- **API design knowledge** - Implement RESTful endpoints following best practices
- **TypeScript proficiency** - Maintain type safety throughout the codebase
- **Error handling** - Proper HTTP status codes and error responses 
- **Code quality** - Clean, readable, and maintainable code
- **Testing awareness** - Ensure all provided tests pass

## Evaluation Criteria
- Complete and correct functionality
- Proper error handling and status codes
- Clean code structure and TypeScript usage
- Readable and maintainable code
- Consistent with existing patterns
- Good validation and security practices
- All tests passing
- Clear commit messages and comments
- Additional documentation if needed


## Support
If you encounter any setup issues or have questions about requirements, please reach out to the technical team. Focus on implementing the core functionality first, then optimize and refine as time permits.
