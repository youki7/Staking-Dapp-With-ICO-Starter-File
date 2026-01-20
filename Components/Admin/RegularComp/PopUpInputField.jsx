import { useId } from 'react'

const PopUpInputField = ({ title, placeholder, handleChange }) => {
  const id = useId()
  return (
    <div className="form__group">
      <label htmlFor={id} className="form__label">
        {title}
      </label>
      <input
        type="text"
        id={id}
        className="form__input"
        placeholder={placeholder}
        onChange={handleChange}
        autoComplete="off"
      />
    </div>
  )
}

export default PopUpInputField
