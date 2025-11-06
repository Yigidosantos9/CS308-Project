import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Header Component (styled with inline styles to match)
const Header = () => {
  const styles = {
    nav: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      padding: '1.5rem', // 24px
      zIndex: 10,
    },
    container: {
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      color: 'white',
      fontSize: '2.25rem', // 36px
      fontWeight: 'bold',
      letterSpacing: '0.025em',
      textDecoration: 'none',
    },
    linksContainer: {
      display: 'flex',
      gap: '0.75rem', // 12px
    },
    linkBox: {
      width: '7rem', // 112px
      height: '3rem', // 48px
      backgroundColor: 'rgba(107, 114, 128, 0.7)',
      borderRadius: '0.375rem', // 6px
    },
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <a href="#" style={styles.logo}>
          AutoNext
        </a>
        <div style={styles.linksContainer}>
          <div style={styles.linkBox}></div>
          <div style={styles.linkBox}></div>
          <div style={styles.linkBox}></div>
        </div>
      </div>
    </nav>
  );
};

// Login Page Component
const LoginPage = () => {
  // State for the form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // New state for handling success/error messages from the backend
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    // This is where you'll send data to your Spring Boot backend
    console.log('Login submitted with:', {
      email,
      password,
    });

    // --- API IMPLEMENTATION ---
    // Make sure your backend controller is running at this URL
    // and the endpoint is POST /api/auth/login
    // NOTE: Your backend team MUST enable CORS for 'http://localhost:3000'
    const api_url = 'http://localhost:8080/api/auth/login';

    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Get the response as plain text (since your backend service returns a string)
      const responseText = await response.text();
      console.log('Backend Response:', responseText);

      if (response.ok) {
        // "Login successful."
        setMessage(responseText);
        // TODO: Save the token (if backend sends one) and redirect
        // Example: window.location.href = '/dashboard';
      } else {
        // "Invalid credentials provided." or "No user found..."
        // The error message from your backend will be in responseText
        setMessage(`Error: ${responseText}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error. Is the backend server running?');
    }
    // --- END OF API IMPLEMENTATION ---
  };
  const handleNavigateToRegister = () => {
    navigate('/register'); // Use navigate to change page
  };

  // Styles object for the Login Page
  const styles = {
    page: {
      position: 'relative',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: 'Inter, Arial, sans-serif',
    },
    bgImage: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundImage:
        "url('https://images.unsplash.com/photo-1520697833088-61819f794e61?auto-format&fit=crop&w=1920&q=80')",
    },
    bgOverlay: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      background:
        'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.7) 100%)',
    },
    mainContainer: {
      position: 'relative',
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    },
    formCard: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      padding: '2.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '100%',
      maxWidth: '28rem',
      boxSizing: 'border-box',
    },
    title: {
      color: 'white',
      fontSize: '1.875rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    // New style for the message display
    message: {
      color: 'white',
      textAlign: 'center',
      marginTop: '1rem',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '1rem',
      margin: '0.75rem 0',
      backgroundColor: 'rgb(75, 85, 99)',
      color: 'white',
      borderRadius: '0.375rem',
      border: 'none',
      boxSizing: 'border-box',
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1.25rem',
      marginBottom: '1.5rem',
    },
    forgotLink: {
      fontSize: '0.875rem',
      color: 'rgb(209, 213, 219)',
      textDecoration: 'none',
    },
    loginButton: {
      backgroundColor: 'rgb(6, 182, 212)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    dividerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '1.5rem 0',
      color: 'rgb(156, 163, 175)',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: 'rgb(107, 114, 128)',
      margin: '0 0.5rem',
    },
    createAccountButton: {
      width: '100%',
      backgroundColor: 'transparent',
      color: 'rgb(6, 182, 212)',
      border: '2px solid rgb(6, 182, 212)',
      padding: '1rem',
      borderRadius: '0.375rem',
      fontWeight: 'bold',
      fontSize: '1rem',
      textTransform: 'uppercase',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.page}>
      {/* 1. Background Image */}
      <div style={styles.bgImage}></div>

      {/* 2. Dark Overlay */}
      <div style={styles.bgOverlay}></div>

      {/* 3. Header */}
      <Header />

      {/* 4. Main Content (Centering the form) */}
      <div style={styles.mainContainer}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Welcome Back!</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              required
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div style={styles.actions}>
              <a href="#" style={styles.forgotLink}>
                Forgot Your Password?
              </a>
              <button type="submit" style={styles.loginButton}>
                Log In
              </button>
            </div>
          </form>

          {/* This part displays the success or error message */}
          {message && (
            <p style={styles.message}>
              {message}
            </p>
          )}

          <div style={styles.dividerContainer}>
            <div style={styles.dividerLine}></div>
            <span style={{ margin: '0 0.5rem' }}>Or</span>
            <div style={styles.dividerLine}></div>
          </div>

          {/* This button is for navigating to the register page */}
          <button style={styles.createAccountButton}
          onClick={handleNavigateToRegister}
          >
            Create an Account
            
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

