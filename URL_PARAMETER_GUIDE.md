# 🔗 URL Parameter Identification Guide

## 📋 **Overview**

The Grading Assistant dashboard now supports URL parameter-based professor identification. This allows you to create direct links to specific professor dashboards and automatically load their data.

## 🎯 **Supported URL Parameters**

The dashboard accepts multiple parameter names for flexibility:

### **Primary Parameters:**
- `professor_id` - Main parameter for professor identification
- `prof_id` - Alternative short form
- `id` - Generic ID parameter

### **URL Examples:**

```
# Using professor_id (recommended)
http://localhost:5001/?professor_id=1
http://localhost:5001/?professor_id=2
http://localhost:5001/?professor_id=3

# Using prof_id (alternative)
http://localhost:5001/?prof_id=1
http://localhost:5001/?prof_id=2

# Using id (generic)
http://localhost:5001/?id=1
http://localhost:5001/?id=2

# Multiple parameters (professor_id takes priority)
http://localhost:5001/?professor_id=1&prof_id=2&id=3
```

## 🔄 **How It Works**

### **1. URL Parameter Parsing**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const professorId = urlParams.get('professor_id') || 
                   urlParams.get('prof_id') || 
                   urlParams.get('id');
```

### **2. Professor Fetching Logic**
```javascript
// Step 1: Try to fetch specific professor by ID
if (professorId) {
  const response = await fetch(`/api/professors/${professorId}`);
  if (response.ok) {
    selectedProfessor = await response.json();
  }
}

// Step 2: Fallback to first professor if not found
if (!selectedProfessor) {
  const response = await fetch('/api/professors');
  const professors = await response.json();
  selectedProfessor = professors[0];
}
```

### **3. Data Loading**
- **Professor Details**: Name, department, email
- **Assignments**: All assignments for the professor
- **Statistics**: Calculated from professor's data

## 🎨 **Visual Indicators**

### **Welcome Section**
- Shows professor's full name
- Displays professor ID and department
- Updates dynamically based on URL parameter

### **Header**
- Professor avatar with initials
- Department information
- Real-time data loading

## 🧪 **Testing the Functionality**

### **Test URLs to Try:**

1. **Professor ID 1 (Dr. Jane Smith)**
   ```
   http://localhost:5001/?professor_id=1
   ```

2. **Professor ID 2 (Prof. Michael Johnson)**
   ```
   http://localhost:5001/?professor_id=2
   ```

3. **Professor ID 3 (Dr. Sarah Wilson)**
   ```
   http://localhost:5001/?professor_id=3
   ```

4. **No Parameter (Fallback to first professor)**
   ```
   http://localhost:5001/
   ```

5. **Invalid ID (Fallback to first professor)**
   ```
   http://localhost:5001/?professor_id=999
   ```

## 🔍 **Debugging & Logging**

### **Console Logs**
The dashboard provides detailed console logging:

```javascript
// URL Parameters
console.log('URL Parameters:', {
  professor_id: urlParams.get('professor_id'),
  prof_id: urlParams.get('prof_id'),
  id: urlParams.get('id'),
  selectedId: professorId
});

// Professor Fetching
console.log(`Fetching professor with ID: ${professorId}`);
console.log('Professor found:', selectedProfessor);

// Fallback Logic
console.log('Fetching all professors as fallback...');
console.log('Using first professor as fallback:', selectedProfessor);
```

### **Browser Developer Tools**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate to dashboard with URL parameters
4. Check console logs for detailed information

## 🚀 **API Endpoints**

### **Get Specific Professor**
```
GET /api/professors/{id}
Response: {
  "id": 1,
  "name": "Dr. Jane Smith",
  "email": "jane.smith@university.edu",
  "department": "Computer Science",
  "created_at": "2025-10-26T01:28:29.943865"
}
```

### **Get All Professors**
```
GET /api/professors
Response: [
  {
    "id": 1,
    "name": "Dr. Jane Smith",
    "email": "jane.smith@university.edu",
    "department": "Computer Science"
  },
  // ... more professors
]
```

### **Get Assignments**
```
GET /api/assignments
Response: [
  {
    "id": 1,
    "title": "Data Structures Implementation",
    "description": "Implement a binary search tree...",
    "professor_id": 1,
    "max_points": 100,
    "due_date": "2025-11-15T23:59:59"
  },
  // ... more assignments
]
```

## 🎯 **Use Cases**

### **1. Direct Professor Access**
Create bookmarks or links for specific professors:
```
https://your-domain.com/?professor_id=1
https://your-domain.com/?professor_id=2
```

### **2. Integration with Other Systems**
Pass professor ID from external systems:
```
https://your-domain.com/?prof_id=123&source=ldap
```

### **3. Testing & Development**
Test different professor scenarios:
```
# Test with valid ID
http://localhost:5001/?professor_id=1

# Test with invalid ID (fallback)
http://localhost:5001/?professor_id=999

# Test without parameters (default)
http://localhost:5001/
```

## 🔧 **Error Handling**

### **Invalid Professor ID**
- Shows warning in console
- Falls back to first available professor
- Displays fallback professor information

### **Network Errors**
- Logs error details
- Continues with fallback logic
- Shows appropriate UI state

### **No Professors Available**
- Logs warning
- Shows default "Dr. Smith" placeholder
- Graceful degradation

## 📱 **Mobile & Responsive**

The URL parameter functionality works seamlessly across all devices:
- Desktop browsers
- Mobile browsers
- Tablet browsers
- Progressive Web Apps (PWA)

## 🔒 **Security Considerations**

- URL parameters are client-side only
- No sensitive data exposed in URLs
- Professor IDs are public identifiers
- No authentication required for basic functionality

## 🎉 **Summary**

The URL parameter identification system provides:

✅ **Flexible Parameter Names** - Multiple ways to specify professor ID
✅ **Robust Fallback Logic** - Always shows a professor dashboard
✅ **Detailed Logging** - Easy debugging and monitoring
✅ **Visual Indicators** - Clear professor identification in UI
✅ **Error Handling** - Graceful degradation for edge cases
✅ **Cross-Platform** - Works on all devices and browsers

**Ready to use!** 🚀
