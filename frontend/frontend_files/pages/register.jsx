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

// Register Page Component
const RegisterPage = () => {
  // State for the form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- New fields required by your backend ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState(''); // Backend expects a Date, but string is fine
  // New state for handling success/error messages from the backend
  const [message, setMessage] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    // This is where you'll send data to your Spring Boot backend
    console.log('Register submitted with:', {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      birthDate,
    });

    // --- API IMPLEMENTATION ---
    // Make sure your backend controller is running at this URL
    // and the endpoint is POST /api/auth/register
    // NOTE: Your backend team MUST enable CORS for 'http://localhost:3000'
    const api_url = 'http://localhost:8080/api/auth/register'; // Or /api/auth/signup

    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName, // Your backend service calls this 'surname'
          email,
          password,
          phoneNumber,
          birthDate,
        }),
      });

      // Get the response as plain text (since your backend service returns a string)
      const responseText = await response.text();
      console.log('Backend Response:', responseText);
      if (response.ok) {
        // "User signed up successfully."
        setMessage(responseText);
        // TODO: Redirect to login page after a few seconds
      } else {
        // "User already exists..."
        // The error message from your backend will be in responseText
        setMessage(`Error: ${responseText}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error. Is the backend server running?');
    }
    // --- END OF API IMPLEMENTATION ---
  };

  // Styles object for the Register Page
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
    // New style for the message display
    message: {
      color: 'white',
      textAlign: 'center',
      marginTop: '1rem',
      fontSize: '0.9rem',
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
            
            {/* --- New Fields Added Here --- */}
            <input
              type="tel"
              placeholder="Phone Number (e.g., +15551234)"
              required
              style={styles.input}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
              type="text" // Using text for simplicity, use date if you want a date picker
              placeholder="Birth Date (e.g., YYYY-MM-DD)"
              onFocus={(e) => (e.target.type = 'date')} // Changes to date picker on click
              onBlur={(e) => {
                if (!e.target.value) { e.target.type = 'text'; }
              }} // Reverts if empty
              required
              style={styles.input}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            {/* ----------------------------- */}

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
          
          {/* This part displays the success or error message */}
          {message && (
            <p style={styles.message}>
              {message}
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

