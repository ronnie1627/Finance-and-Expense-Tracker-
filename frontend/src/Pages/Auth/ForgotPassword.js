import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Button, Container, Form } from "react-bootstrap";
import { forgotPasswordAPI } from "../../utils/ApiRequest";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(forgotPasswordAPI, { email });
      setMessage(data.message);
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
        <h3 className="mb-3">Forgot password</h3>
        <p>Enter your email and we will send you a link to reset it.</p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="forgotEmail">
            <Form.Control
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
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

export default ForgotPassword;