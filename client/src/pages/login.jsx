import React from 'react';
import LoginForm from '../components/loginForm.jsx';

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <h2>DNS Manager Login</h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
