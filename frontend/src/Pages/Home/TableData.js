import React, { useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./home.css";
import { deleteTransactions, editTransactions } from "../../utils/ApiRequest";
import axios from "axios";

const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

const TableData = (props) => {
  const [show, setShow] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currId, setCurrId] = useState(null);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Open the popup and pre-fill it with the current transaction values
  const handleEditClick = (itemKey) => {
    const tran = props.data.find((item) => item._id === itemKey);
    if (!tran) return;

    setCurrId(itemKey);
    setEditingTransaction(tran);
    setValues({
      title: tran.title || "",
      amount: tran.amount !== undefined ? tran.amount : "",
      description: tran.description || "",
      category: tran.category || "",
      date: moment(tran.date).format("YYYY-MM-DD"),
      transactionType: capitalize(tran.transactionType),
    });
    handleShow();
  };

  const handleEditSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      const { data } = await axios.put(`${editTransactions}/${currId}`, {
        ...values,
      });

      if (data.success === true) {
        handleClose();
        window.location.reload();
      } else {
        console.log("error");
      }
    } catch (err) {
      console.log("Update failed:", err);
    }
  };

  const handleDeleteClick = async (itemKey) => {
    if (!window.confirm("Delete this transaction?")) return;

    try {
      const { data } = await axios.post(`${deleteTransactions}/${itemKey}`, {
        userId: props.user._id,
      });

      if (data.success === true) {
        window.location.reload();
      } else {
        console.log("error");
      }
    } catch (err) {
      console.log("Delete failed:", err);
    }
  };

  return (
    <>
      <Container>
        <Table responsive="md" className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {props.data.map((item, index) => (
              <tr key={item._id || index}>
                <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                <td>{item.title}</td>
                <td>₹ {Number(item.amount).toLocaleString("en-IN")}</td>
                <td>{capitalize(item.transactionType)}</td>
                <td>{item.category}</td>
                <td>
                  <div className="icons-handle">
                    <EditNoteIcon
                      sx={{ cursor: "pointer" }}
                      id={item._id}
                      onClick={() => handleEditClick(item._id)}
                    />

                    <DeleteForeverIcon
                      sx={{ color: "red", cursor: "pointer" }}
                      id={item._id}
                      onClick={() => handleDeleteClick(item._id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* One popup for the whole table */}
        {editingTransaction && (
          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>Update Transaction Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEditSubmit}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    name="title"
                    type="text"
                    value={values.title}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formAmount">
                  <Form.Label>Amount (₹)</Form.Label>
                  <Form.Control
                    name="amount"
                    type="number"
                    value={values.amount}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formSelect">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Rent">Rent</option>
                    <option value="Salary">Salary</option>
                    <option value="Tip">Tip</option>
                    <option value="Food">Food</option>
                    <option value="Medical">Medical</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formSelect1">
                  <Form.Label>Transaction Type</Form.Label>
                  <Form.Select
                    name="transactionType"
                    value={values.transactionType}
                    onChange={handleChange}
                  >
                    <option value="Credit">Credit</option>
                    <option value="Expense">Expense</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDate">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={values.date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={handleEditSubmit}>
                Save changes
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </>
  );
};

export default TableData;