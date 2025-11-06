import React, { useState } from 'react';

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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // This is where you'll send data to your Spring Boot backend
    console.log('Login submitted with:', {
      email,
      password,
    });
    // Example API call (uncomment and adjust later)
    /*
    fetch('http://localhost:8080/api/auth/login', { // Make sure this matches your backend endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // Save token, redirect to dashboard, etc.
    })
    .catch((error) => {
      console.error('Error:', error);
      // Show error message to user
    });
    */
  };

  // Styles object for the Login Page
  // These are crafted to match the aesthetic of the RegisterPage
  const styles = {
    page: {
      position: 'relative',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: 'Inter, Arial, sans-serif', // Added Inter as preferred font
    },
    bgImage: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundImage:
        "url('https://images.unsplash.com/photo-1520697833088-61819f794e61?auto=format&fit=crop&w=1920&q=80')",
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
      justifyContent: 'center', // Centered the login form
      padding: '1rem',
    },
    formCard: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)', // Dark card bg
      padding: '2.5rem', // 40px
      borderRadius: '0.5rem', // 8px
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '100%',
      maxWidth: '28rem', // 448px
      boxSizing: 'border-box',
    },
    title: {
      color: 'white',
      fontSize: '1.875rem', // 30px
      fontWeight: 'bold',
      marginBottom: '2rem', // 32px
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    input: {
      width: '100%',
      padding: '1rem', // 16px
      margin: '0.75rem 0', // 12px
      backgroundColor: 'rgb(75, 85, 99)',
      color: 'white',
      borderRadius: '0.375rem', // 6px
      border: 'none',
      boxSizing: 'border-box', // Ensures padding doesn't affect width
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1.25rem', // 20px
      marginBottom: '1.5rem', // 24px
    },
    forgotLink: {
      fontSize: '0.875rem', // 14px
      color: 'rgb(209, 213, 219)',
      textDecoration: 'none',
    },
    loginButton: {
      backgroundColor: 'rgb(6, 182, 212)', // Cyan button
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem', // 12px 24px
      borderRadius: '0.375rem', // 6px
      cursor: 'pointer',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    dividerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '1.5rem 0', // 24px
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
      padding: '1rem', // 16px
      borderRadius: '0.375rem', // 6px
      fontWeight: 'bold',
      fontSize: '1rem', // 16px
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

          <div style={styles.dividerContainer}>
            <div style={styles.dividerLine}></div>
            <span style={{ margin: '0 0.5rem' }}>Or</span>
            <div style={styles.dividerLine}></div>
          </div>

          {/* This button is for navigating to the register page */}
          <button style={styles.createAccountButton}>
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
