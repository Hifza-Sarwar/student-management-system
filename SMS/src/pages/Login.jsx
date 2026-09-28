import "/src/index.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
function Login() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      console.log("Login response:", data);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", email);

      alert("Login successful!");

if (data.role === "student") {
  navigate("/student/dashboard");
} else if (data.role === "admin") {
  navigate("/admin/dashboard");
}
    } catch (error) {
      console.error(error);
      alert("Backend server is not running");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>Student Management</h1>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#">Forgot password?</a>
          </div>

          <button type="submit">Login →</button>
        </form>

        <p className="register">
  Don't have an account?
  <Link to="/register"> Register</Link>
</p>

      </div>
    </div>
  );
}

export default Login;