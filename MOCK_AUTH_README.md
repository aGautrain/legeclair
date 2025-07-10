# Mock Authentication System

This project includes a comprehensive mock authentication system for demonstration purposes. It provides a realistic user experience without requiring a backend server.

## Features

### 🔐 Authentication Store (`src/stores/app.ts`)

- **User Management**: Mock user data with profiles, avatars, and roles
- **Session Persistence**: Automatic login state restoration from localStorage/sessionStorage
- **Route Protection**: Guards for protected routes
- **Mock API Simulation**: Realistic loading states and error handling

### 👥 Pre-configured Demo Users

| User       | Email              | Password    | Role  | Avatar                                    |
| ---------- | ------------------ | ----------- | ----- | ----------------------------------------- |
| John Doe   | john@example.com   | password123 | User  | [Avatar](https://i.pravatar.cc/150?img=1) |
| Jane Smith | jane@example.com   | password123 | Admin | [Avatar](https://i.pravatar.cc/150?img=2) |
| Demo User  | demo@legeclair.com | password123 | User  | [Avatar](https://i.pravatar.cc/150?img=3) |

### 🚀 Quick Demo Login

The landing page includes a demo section with quick login buttons for each user. Simply click on a user's name to instantly log in with their account.

### 📱 User Interface

#### Login Page (`/login`)

- Email/password authentication
- "Remember me" functionality
- Quick demo login buttons
- Error handling and loading states
- Social login placeholders

#### Registration Page (`/register`)

- Full user registration form
- Auto-login after successful registration
- Validation and error handling

#### Topbar

- User avatar and name display
- Dropdown menu with profile options
- Logout functionality
- Conditional navigation based on auth state

## How to Use

### 1. Quick Demo Login

1. Visit the homepage
2. Scroll to the "Try the Demo" section
3. Click on any user button to instantly log in
4. You'll be redirected to the documents page

### 2. Manual Login

1. Go to `/login`
2. Use any of the demo user credentials:
   - Email: `john@example.com`, `jane@example.com`, or `demo@legeclair.com`
   - Password: `password123`
3. Optionally check "Remember me" for persistent login
4. Click "Sign In"

### 3. Registration

1. Go to `/register`
2. Fill out the registration form
3. Submit to create a new account
4. You'll be automatically logged in and redirected

### 4. Logout

1. Click on your user avatar in the topbar
2. Select "Logout" from the dropdown menu
3. You'll be redirected to the homepage

## Technical Implementation

### Store Structure

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: "user" | "admin";
  createdAt: Date;
  lastLoginAt: Date;
}
```

### Key Methods

- `login(credentials)`: Authenticate user with email/password
- `register(userData)`: Create new user account
- `logout()`: Clear session and redirect
- `checkAuth()`: Restore session from storage
- `mockQuickLogin(index)`: Quick login for demo users

### Route Protection

Protected routes automatically redirect to `/login` if user is not authenticated:

- `/documents`
- `/profile`
- `/settings`

Authenticated users are redirected to `/documents` when accessing auth routes:

- `/login`
- `/register`

### Session Storage

- **localStorage**: Used when "Remember me" is checked
- **sessionStorage**: Used for regular sessions
- Automatic cleanup on logout

## Development Notes

### Adding New Demo Users

To add new demo users, modify the `mockUsers` array in `src/stores/app.ts`:

```typescript
const mockUsers: User[] = [
  // ... existing users
  {
    id: "4",
    username: "new_user",
    email: "new@example.com",
    firstName: "New",
    lastName: "User",
    avatar: "https://i.pravatar.cc/150?img=4",
    role: "user",
    createdAt: new Date(),
    lastLoginAt: new Date(),
  },
];
```

### Customizing Authentication Logic

The mock authentication can be easily replaced with real API calls by modifying the methods in `src/stores/app.ts`:

```typescript
const login = async (credentials: LoginCredentials): Promise<boolean> => {
  // Replace mock logic with actual API call
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    const userData = await response.json();
    user.value = userData.user;
    isAuthenticated.value = true;
    // ... rest of login logic
  }
};
```

### Testing Different User Roles

- **User Role**: Standard access to documents and basic features
- **Admin Role**: Additional admin privileges (can be extended in the UI)

## Security Notes

⚠️ **Important**: This is a mock system for demonstration purposes only. In production:

1. Never store passwords in plain text
2. Implement proper JWT or session-based authentication
3. Use HTTPS for all authentication requests
4. Implement proper CSRF protection
5. Add rate limiting for login attempts
6. Use secure password hashing (bcrypt, Argon2, etc.)
7. Implement proper session management
8. Add two-factor authentication for sensitive operations

## Troubleshooting

### Session Not Persisting

- Check browser storage settings
- Ensure localStorage/sessionStorage is enabled
- Clear browser cache and try again

### Route Protection Not Working

- Verify router guards are properly configured
- Check authentication state in Vue DevTools
- Ensure store is properly initialized

### Demo Login Not Working

- Check console for errors
- Verify demo user data is properly configured
- Ensure router navigation is working correctly
