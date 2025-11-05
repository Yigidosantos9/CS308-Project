import React, { useState } from 'react';

// Header Component (styled with inline styles to match)
// This is the same header from LoginPage.jsx for consistency.
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

// Register Page Component
const RegisterPage = () => {
  // State for the form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // This is where you'll send data to your Spring Boot backend
    console.log('Register submitted with:', {
      firstName,
      lastName,
      email,
      password,
    });
    // Example API call (uncomment and adjust later)
    /*
    fetch('http://localhost:8080/api/auth/register', { // Make sure this matches your backend endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // Redirect to login page
    })
    .catch((error) => {
      console.error('Error:', error);
      // Show error message to user
    });
    */
  };

  // Styles object for the Register Page
  // These are crafted to match the aesthetic of the LoginPage
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
      justifyContent: 'flex-start', // Aligned to the left as per your design
      padding: '0 5%', // Added padding to push it from the left edge
      boxSizing: 'border-box',
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
      textAlign: 'left', // Aligned left in your design
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
    nameFieldsContainer: {
      display: 'flex',
      gap: '1rem', // Space between first and last name
      margin: '0.75rem 0', // 12px
    },
    nameField: {
      flex: 1, // Each input takes half the space
    },
    submitButton: {
      width: '100%',
      backgroundColor: 'rgb(6, 182, 212)', // Cyan button
      color: 'white',
      border: 'none',
      padding: '1rem', // 16px
      borderRadius: '0.375rem', // 6px
      cursor: 'pointer',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: '1rem', // 16px
      marginTop: '1.25rem', // 20px
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

      {/* 4. Main Content (Form on the left) */}
      <div style={styles.mainContainer}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Sign Up</h2>

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

            {/* Container for First and Last Name */}
            <div style={styles.nameFieldsContainer}>
              <div style={styles.nameField}>
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  style={styles.input}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div style={styles.nameField}>
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  style={styles.input}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" style={styles.submitButton}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
