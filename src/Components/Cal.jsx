// Calender.jsx

import React, { useState, useEffect } from "react";
import Datepicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCalendarAlt } from "react-icons/fa";
import '../Styles/cal.css';
import { addDays, isSameDay, startOfWeek, addWeeks, setDay } from "date-fns";

/**
 * CustomInput Component
 * Creates a custom input field for the Datepicker with a calendar icon.
 */
function CustomInput({ value, onClick }) {
  return (
    <div className="input-group">
      <input
        placeholder='MM/DD/YYYY'
        type="text"
        className="form-control"
        value={value}
        onClick={onClick}
        readOnly
      />
      <div className="input-group-append">
        <span className="input-group-text">
          <FaCalendarAlt />
        </span>
      </div>
    </div>
  );
}

/**
 * Calender Component
 * Handles date selection with specific constraints:
 * - Only Monday to Friday are selectable.
 * - Users can select dates from the current week and the next week.
 * - The current date and Sundays are not selectable.
 */
function Calender({ passdata }) {
  const [selectedDate, setDate] = useState(null);

  /**
   * Handles date selection.
   *
   * @param {Date} date - The selected date.
   */
  const handleDateChange = (date) => {
    setDate(date);
  };

  /**
   * Passes the selected date to the parent component.
   */
  useEffect(() => {
    if (selectedDate) {
      passdata(selectedDate);
    }
  }, [selectedDate, passdata]);

  /**
   * Calculates the maximum selectable date as next week's Friday.
   *
   * @returns {Date} - The date representing next week's Friday.
   */
  const calculateMaxDate = () => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const nextWeekFriday = setDay(addWeeks(currentWeekStart, 1), 5, { weekStartsOn: 1 }); // Next week's Friday
    return nextWeekFriday;
  };

  return (
    <div className="Calender">
      <label>
        <Datepicker 
          selected={selectedDate} 
          onChange={handleDateChange} 
          minDate={addDays(new Date(), 1)} // Start from tomorrow
          maxDate={calculateMaxDate()} // Next week's Friday
          filterDate={(date) => {
            const day = date.getDay();
            const isAllowed = day >=1 && day <=5; // Only Monday to Friday
            return isAllowed;
          }}
          excludeDates={[new Date()]} // Exclude today
          customInput={<CustomInput />} 
          dateFormat="MM/dd/yyyy"
          placeholderText="Select a date"
        />
      </label>
    </div>
  );
}

export default Calender;
