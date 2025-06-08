# API Fix and Task Management System Assessment - TypeScript

## Company Assignment Overview
**Position:** Backend Developer Assessment  
**Technology Stack:** TypeScript, Node.js, Express, Drizzle ORM

You've been provided with a partially implemented API codebase that simulates a real-world scenario where you need to debug existing functionality and complete missing features. This assessment evaluates your ability to work with existing code, implement RESTful APIs, and maintain code quality standards.

## Task Description
Fix existing issues and implement missing task CRUD features in the provided TypeScript/Node.js/Express API with Drizzle ORM.

## Authentication Requirements
- Fix `POST /api/auth/login` endpoint
- Return JWT token and user data on successful login

## Task CRUD Operations

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

## Environment Setup
Ensure you have the following configured in your `.env` file:
```bash
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

## Setup Instructions
```bash
npm install
npm run migrate
npm run seed
npm run dev
npm test
```

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

## Submission Requirements
- Complete the implementation within the given timeframe
- Ensure all existing tests pass
- Document any assumptions or design decisions made
- Code should be production-ready quality

## Success Criteria
## Evaluation Criteria
**Technical Implementation (60%)**
- Functionality completeness and correctness
- Proper error handling and status codes
- Code organization and TypeScript usage

**Code Quality (25%)**
- Readability and maintainability
- Following established patterns in codebase
- Proper validation and security practices

**Testing & Documentation (15%)**
- All tests passing
- Clear commit messages and code comments
- Any additional documentation provided

## Support
If you encounter any setup issues or have questions about requirements, please reach out to the technical team. Focus on implementing the core functionality first, then optimize and refine as time permits.
