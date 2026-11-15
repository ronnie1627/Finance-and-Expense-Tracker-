import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Container, Form } from "react-bootstrap";
import { resetPasswordAPI } from "../../utils/ApiRequest";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${resetPasswordAPI}/${token}`, {
        password,
      });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container style={{ maxWidth: "420px" }}>
        <h3 className="mb-3">Set a new password</h3>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Control
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Update password"}
          </Button>
        </Form>

        {message && <p className="mt-3" style={{ color: "#22c55e" }}>{message}</p>}
        {error && <p className="mt-3" style={{ color: "#ef4444" }}>{error}</p>}

        <p className="mt-4">
          <Link to="/login">Back to login</Link>
        </p>
      </Container>
    </div>
  );
};

export default ResetPassword;