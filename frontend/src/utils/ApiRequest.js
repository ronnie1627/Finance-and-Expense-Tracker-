const host =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://finance-and-expense-tracker-peach.vercel.app";
export const setAvatarAPI = `${host}/api/auth/setAvatar`;
export const registerAPI = `${host}/api/auth/register`;
export const loginAPI = `${host}/api/auth/login`;
export const forgotPasswordAPI = `${host}/api/auth/forgotPassword`;
export const resetPasswordAPI = `${host}/api/auth/resetPassword`;
export const budgetAPI = `${host}/api/auth/budget`;
export const addTransaction = `${host}/api/v1/addTransaction`;
export const getTransactions = `${host}/api/v1/getTransaction`;
export const editTransactions = `${host}/api/v1/updateTransaction`;
export const deleteTransactions = `${host}/api/v1/deleteTransaction`;