// importing react features to use states, effects, and links
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import database
import { supabase } from '../../supabaseClient';

// declare + export BuyerManagement component
export default function BuyerManagement() {
  // tableData - state var that stores all table data, initially an empty array
  // setTableData - function used to update value of tableData
  const [tableData, setTableData] = useState([]);
  // isPopupOpen - state var that changes depending on whether popup is open or not, initially set to false
  // setIsPopupOpen - function used to update the value of isPopupOpen
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // newRowData - state var that stores obj containing properties for new row of data, all props initially set to empty string
  // setNewRowData - function to set new row data
  const [newRowData, setNewRowData] = useState({ buyer: '', compliance_work: '', due_date: '', task_assigned: '',  checklist: '' });

  // useEffect - effect that runs once when component mounts
  useEffect(() => {
    // call fetchMeasurement function
    fetchMeasurement()
  }, []) // <-- '[]' as the dependency array means it runs once

  // fetches data from db + updates tableData var w/ fetched data
  async function fetchMeasurement() {
    // await async data retrieval from db; selects all info from buyer_management table
    const { data } = await supabase
      .from(`buyer_management`)
      .select('*')
    // updates tableData var with data from db
    setTableData(data); 
  }

  // sets isPopupOpen to true, opening popup
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  // sets isPopupOpen to false, closing popup + adding new row of data
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    // clear input fields when closing the popup + create new row of data
    createMeasurement();
    // resets newRowData props to empty strings
    setNewRowData({ buyer: '', compliance_work: '', due_date: '', task_assigned: '',  checklist: '' });
  };

  // updates newRowData var when input changes
  const handleInputChange = (e) => {
    // gets name + value from event target
    const { name, value } = e.target;
    // add new name + value pair to obj along w/ prev data
    setNewRowData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // adds new row of data to tableData var + closes popup
  const handleAddRow = () => {
    setTableData((prevData) => [...prevData, newRowData]);
    handleClosePopup();
  };

  // inserts new row of data into db buyer_management table w/ values from newRowData
  async function createMeasurement() {
    await supabase
      .from(`buyer_management`)
      .insert({ buyer: newRowData.buyer, compliance_work: newRowData.compliance_work , due_date: newRowData.due_date , task_assigned: newRowData.task_assigned , checklist: newRowData.checklist })
  }

  return (
    <div className="relative flex flex-col justify-center overflow-hidden mt-20">
    <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl shadow-black-600/40 lg:max-w-4xl">
      <h1 className="text-2xl text-center mb-4">Buyer Management</h1>
    <div className="container mx-auto">
      <button onClick={handleOpenPopup} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Add Certificate
      </button>
      <table className="mt-4 w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Buyer</th>
            <th className="border border-gray-300 px-4 py-2">Compliance Work</th>
            <th className="border border-gray-300 px-4 py-2">Due Date</th>
            <th className="border border-gray-300 px-4 py-2">Task Assigned</th>
            <th className="border border-gray-300 px-4 py-2">Checklist</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
              <Link to={`/buyer_management/${row.buyer}`}>
                {row.buyer}
              </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2">
              <Link to={`/buyer_management/${row.compliance_work}`}>
                {row.compliance_work}
              </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2">
              <Link to={`/buyer_management/${row.due_date}`}>
                {row.due_date}
              </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2">
              <Link to={`/buyer_management/${row.task_assigned}`}>
                {row.task_assigned}
              </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2">
              <Link to={`/buyer_management/${row.checklist}`}>
                {row.checklist}
              </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPopupOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Add New Row</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Buyer
                </label>
                <input
                  type="text"
                  id="buyer"
                  name="buyer"
                  value={newRowData.buyer}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Complicance Work
                </label>
                <input
                  type="text"
                  id="compliance_work"
                  name="compliance_work"
                  value={newRowData.compliance_work}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={newRowData.due_date}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Task Assigned
                </label>
                <input
                  type="text"
                  id="task_assigned"
                  name="task_assigned"
                  value={newRowData.task_assigned}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Checklist
                </label>
                <input
                  type="text"
                  id="checklist"
                  name="checklist"
                  value={newRowData.checklist}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleClosePopup}
                  className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRow}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}

