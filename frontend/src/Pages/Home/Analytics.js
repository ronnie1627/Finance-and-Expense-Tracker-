import React from "react";
import { Container, Row } from "react-bootstrap";
import CircularProgressBar from "../../components/CircularProgressBar";
import LineProgressBar from "../../components/LineProgressBar";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BudgetCard from "./BudgetCard";

const formatINR = (value) => Number(value).toLocaleString("en-IN");

const isType = (item, type) =>
  String(item.transactionType).toLowerCase() === type;

const percent = (part, total) => (total > 0 ? (part / total) * 100 : 0);

const Analytics = ({ transactions }) => {
  const TotalTransactions = transactions.length;
  const totalIncomeTransactions = transactions.filter((item) =>
    isType(item, "credit")
  );
  const totalExpenseTransactions = transactions.filter((item) =>
    isType(item, "expense")
  );

  const totalIncomePercent = percent(
    totalIncomeTransactions.length,
    TotalTransactions
  );
  const totalExpensePercent = percent(
    totalExpenseTransactions.length,
    TotalTransactions
  );

  const totalTurnOver = transactions.reduce(
    (acc, transaction) => acc + Number(transaction.amount),
    0
  );
  const totalTurnOverIncome = transactions
    .filter((item) => isType(item, "credit"))
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  const totalTurnOverExpense = transactions
    .filter((item) => isType(item, "expense"))
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const TurnOverIncomePercent = percent(totalTurnOverIncome, totalTurnOver);
  const TurnOverExpensePercent = percent(totalTurnOverExpense, totalTurnOver);

  const balance = totalTurnOverIncome - totalTurnOverExpense;
  const balanceColor = balance >= 0 ? "#22c55e" : "#ef4444";

  const categories = [
    "Groceries",
    "Rent",
    "Salary",
    "Tip",
    "Food",
    "Medical",
    "Utilities",
    "Entertainment",
    "Transportation",
    "Other",
  ];

  const colors = {
    "Groceries": '#FF6384',
    "Rent": '#36A2EB',
    "Salary": '#FFCE56',
    "Tip": '#4BC0C0',
    "Food": '#9966FF',
    "Medical": '#FF9F40',
    "Utilities": '#8AC926',
    "Entertainment": '#6A4C93',
    "Transportation": '#1982C4',
    "Other": '#F45B69',
  };

  return (
    <>
      <Container className="mt-5 ">
        <Row>
          {/* Balance card */}
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-header bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Current Balance</span>
              </div>
              <div className="card-body text-center">
                <h1 style={{ color: balanceColor, fontWeight: "bold" }}>
                  {balance < 0 ? "-" : ""}₹ {formatINR(Math.abs(balance))}
                </h1>
                <div className="d-flex justify-content-center gap-4 mt-2">
                  <span style={{ color: "green" }}>
                    Income: ₹ {formatINR(totalTurnOverIncome)}
                  </span>
                  <span style={{ color: "red" }}>
                    Expense: ₹ {formatINR(totalTurnOverExpense)}
                  </span>
                </div>
                {balance < 0 && (
                  <p className="mt-2 mb-0" style={{ color: "red" }}>
                    You are spending more than you earn.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Monthly budget card */}
          <BudgetCard transactions={transactions} />

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Total Transactions:</span>{" "}
                {TotalTransactions}
              </div>
              <div className="card-body">
                <h5 className="card-title " style={{color: "green"}}>
                  Income: <ArrowDropUpIcon/>{totalIncomeTransactions.length}
                </h5>
                <h5 className="card-title" style={{color: "red"}}>
                  Expense: <ArrowDropDownIcon />{totalExpenseTransactions.length}
                </h5>

                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={totalIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 mb-2">
                  <CircularProgressBar
                    percentage={totalExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white ">
                <span style={{ fontWeight: "bold" }}>Total TurnOver:</span>{" "}
                ₹ {formatINR(totalTurnOver)}
              </div>
              <div className="card-body">
                <h5 className="card-title" style={{color: "green"}}>Income: <ArrowDropUpIcon /> ₹ {formatINR(totalTurnOverIncome)}</h5>
                <h5 className="card-title" style={{color: "red"}}>Expense: <ArrowDropDownIcon /> ₹ {formatINR(totalTurnOverExpense)}</h5>
                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={TurnOverIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 mb-4">
                  <CircularProgressBar
                    percentage={TurnOverExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header  bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Categorywise Income</span>{" "}
              </div>
              <div className="card-body">
                {categories.map(category => {
                  const income = transactions.filter(transaction => isType(transaction, "credit") && transaction.category === category).reduce((acc, transaction) => acc + Number(transaction.amount), 0)

                  const incomePercent = percent(income, totalTurnOver);

                  return(
                    <React.Fragment key={category}>
                    {income > 0 &&
                      (<LineProgressBar label={category} percentage={incomePercent.toFixed(0)} lineColor={colors[category]} />)
                    }
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header  bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Categorywise Expense</span>{" "}
              </div>
              <div className="card-body">
                {categories.map(category => {
                  const expenses = transactions.filter(transaction => isType(transaction, "expense") && transaction.category === category).reduce((acc, transaction) => acc + Number(transaction.amount), 0)

                  const expensePercent = percent(expenses, totalTurnOver);

                  return(
                    <React.Fragment key={category}>
                    {expenses > 0 &&
                      (<LineProgressBar label={category} percentage={expensePercent.toFixed(0)} lineColor={colors[category]}/>)
                    }
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Analytics;