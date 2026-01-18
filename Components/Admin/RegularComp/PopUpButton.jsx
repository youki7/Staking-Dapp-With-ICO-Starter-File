import React from 'react'

const PopUpButton = ({ title, handleClick }) => {
  return (
    <button onClick={handleClick} className="form__btn" type="button">
      {title}
    </button>
  )
}

export default PopUpButton
