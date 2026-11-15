import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, ProgressBar } from "react-bootstrap";
import { budgetAPI } from "../../utils/ApiRequest";

const OLD_KEY = "monthlyBudget";
const formatINR = (value) => Number(value).toLocaleString("en-IN");

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? user._id : null;
  } catch (e) {
    return null;
  }
};

const BudgetCard = ({ transactions }) => {
  const userId = getUserId();
  const [budget, setBudget] = useState(0);
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const saveToServer = async (value) => {
    const { data } = await axios.post(`${budgetAPI}/${userId}`, {
      budget: value,
    });
    if (data.success) setBudget(data.budget);
    return data;
  };

  // Load the saved budget from MongoDB
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const { data } = await axios.get(`${budgetAPI}/${userId}`);
        let value = data.budget || 0;

        // One-time move of an older browser-saved budget to the database
        if (value === 0) {
          const old = Number(localStorage.getItem(OLD_KEY));
          if (old > 0) {
            await axios.post(`${budgetAPI}/${userId}`, { budget: old });
            localStorage.removeItem(OLD_KEY);
            value = old;
          }
        }
        setBudget(value);
      } catch (e) {
        setError("Could not load your budget.");
      }
    };

    load();
  }, [userId]);

  // Total expenses in the current month
  const now = new Date();
  const spent = transactions
    .filter((t) => String(t.transactionType).toLowerCase() === "expense")
    .filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const monthName = now.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;

  let barVariant = "success";
  if (percentUsed >= 100) barVariant = "danger";
  else if (percentUsed >= 70) barVariant = "warning";

  const handleSave = async () => {
    const value = Number(input);
    if (!(value > 0)) return;

    try {
      setError("");
      await saveToServer(value);
      setInput("");
      setEditing(false);
    } catch (e) {
      setError("Could not save your budget. Is the backend running?");
    }
  };

  const handleRemove = async () => {
    try {
      setError("");
      await saveToServer(0);
    } catch (e) {
      setError("Could not remove your budget.");
    }
  };

  const showForm = budget === 0 || editing;

  return (
    <div className="col-12 mb-4">
      <div className="card">
        <div className="card-header bg-black text-white d-flex justify-content-between">
          <span style={{ fontWeight: "bold" }}>Monthly Budget</span>
          <span>{monthName}</span>
        </div>
        <div className="card-body">
          {error && <p style={{ color: "red" }}>{error}</p>}

          {showForm ? (
            <div className="d-flex gap-2 align-items-center">
              <Form.Control
                type="number"
                placeholder="Enter monthly budget in ₹ (e.g. 10000)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
              {editing && (
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-2">
                <span>
                  Spent: <b>₹ {formatINR(spent)}</b>
                </span>
                <span>
                  Budget: <b>₹ {formatINR(budget)}</b>
                </span>
              </div>

              <ProgressBar
                now={Math.min(percentUsed, 100)}
                variant={barVariant}
                label={`${percentUsed.toFixed(0)}%`}
                style={{ height: "24px" }}
              />

              <p
                className="mt-3 mb-2"
                style={{ color: remaining >= 0 ? "green" : "red" }}
              >
                {remaining >= 0
                  ? `₹ ${formatINR(remaining)} left this month.`
                  : `Over budget by ₹ ${formatINR(Math.abs(remaining))}!`}
              </p>
              {percentUsed >= 70 && percentUsed < 100 && (
                <p style={{ color: "#d97706" }} className="mb-2">
                  Careful, you have used {percentUsed.toFixed(0)}% of your budget.
                </p>
              )}

              <Button
                size="sm"
                variant="secondary"
                className="me-2"
                onClick={() => setEditing(true)}
              >
                Change budget
              </Button>
              <Button size="sm" variant="outline-danger" onClick={handleRemove}>
                Remove
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;