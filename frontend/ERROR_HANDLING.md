# Error Handling & Network Issues

## Overview
This document explains how error handling and network issues are managed in the Car Rental Management System frontend.

## Features Implemented

### 1. **Request Timeout (15 seconds)**
All API requests have a 15-second timeout to prevent infinite loading when the backend is slow or unresponsive.

**Location:** `src/lib/api.ts`

### 2. **Network Error Detection**
The app detects different types of network errors and shows user-friendly messages:

- **Timeout errors** - Server taking too long to respond
- **Network errors** - Cannot reach the server (backend might be offline)
- **Server errors (500+)** - Backend encountered an error

All errors show toast notifications with helpful descriptions.

### 3. **Connection Status Monitor**
A connection status indicator appears when the user loses internet connection.

**Component:** `src/components/common/ConnectionStatus.tsx`

Features:
- Detects when user goes offline
- Shows alert at bottom-right of screen
- Auto-hides when connection is restored
- Uses browser's native online/offline detection

### 4. **Error State Component**
Reusable component for displaying errors with a retry button.

**Component:** `src/components/common/ErrorState.tsx`

Usage example:
```tsx
if (error) {
  return (
    <ErrorState
      title="Failed to load data"
      message={error}
      onRetry={() => fetchData()}
    />
  );
}
```

## Best Practices for Developers

### Always Use Try-Catch-Finally Pattern

```tsx
const fetchData = async () => {
  try {
    setLoading(true);
    const data = await apiCall();
    setData(data);
    setError(null); // Clear any previous errors
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to load data';
    setError(errorMessage);
  } finally {
    setLoading(false); // ALWAYS set loading to false
  }
};
```

### Key Points:
1. **Always** set `loading` to `false` in the `finally` block
2. **Always** handle errors gracefully - show user-friendly messages
3. **Always** provide a retry mechanism when possible
4. **Never** leave users in an infinite loading state

### Handling Different States

Every page that fetches data should handle three states:

1. **Loading State:**
```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
```

2. **Error State:**
```tsx
if (error) {
  return (
    <ErrorState
      title="Error Title"
      message={error}
      onRetry={() => fetchData()}
    />
  );
}
```

3. **Success State:**
```tsx
return (
  <div>
    {/* Your content here */}
  </div>
);
```

## API Error Types

### Network Errors (No Response)
- **Timeout (ECONNABORTED):** Request took longer than 15 seconds
- **Network Error (ERR_NETWORK):** Cannot reach server
- **Network Error (general):** Connection problems

### HTTP Errors (With Response)
- **401 Unauthorized:** Session expired, redirects to login
- **500+ Server Errors:** Backend error, shows toast notification
- **Other errors:** Shows specific error message from backend

## React Query Configuration

The authentication context uses React Query with these settings:

```tsx
{
  retry: false,              // Don't retry failed requests
  staleTime: 5 * 60 * 1000, // 5 minutes cache
  gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
  refetchOnWindowFocus: false, // Don't refetch when window regains focus
}
```

Network timeout is handled by Axios (15 seconds).

## Testing Error Scenarios

### Test Backend Offline
1. Stop the backend server
2. Try to navigate to any page
3. You should see:
   - Toast notification about network error
   - Error state with retry button (after timeout)
   - No infinite loading

### Test Slow Network
1. Use browser DevTools to throttle network to "Slow 3G"
2. Navigate to a data-heavy page
3. Should timeout after 15 seconds with error message

### Test Internet Disconnect
1. Disable your network connection
2. Connection status indicator should appear
3. Re-enable network
4. Should show "Connection restored" message

## Troubleshooting

### Infinite Loading Issues
If you see infinite loading:
1. Check if the page has a `finally` block that sets `loading` to false
2. Verify error handling catches all exceptions
3. Check browser console for unhandled promise rejections

### Toast Not Showing
Ensure the `<Toaster />` component is mounted in `App.tsx`.

### Connection Status Not Working
The ConnectionStatus component is added globally in `App.tsx`. Check if it's imported and rendered.

## Future Improvements

Consider implementing:
1. **Retry with exponential backoff** for failed requests
2. **Offline mode** with cached data using React Query
3. **Service worker** for offline capabilities
4. **Background sync** for failed requests
5. **Error tracking** (e.g., Sentry) for production monitoring
