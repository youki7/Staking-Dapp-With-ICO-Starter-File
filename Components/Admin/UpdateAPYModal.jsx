import React, { useState } from 'react'

import { IoMdClose } from '../ReactICON'

const UpdateAPYModal = ({ setLoader, modifyPool, modifyPoolId }) => {
  const [amount, setAmount] = useState()

  const CALLING_FUNCTION_MODIFY_POOL = async () => {
    setLoader(true)
    console.log(modifyPoolId, amount)
    // Call modifyPool with pool id and new apy (amount)
    try {
      const receipt = await modifyPool(Number(modifyPoolId), Number(amount))
      if (receipt?.blockNumber) {
        console.log(receipt)
        setLoader(false)
        window.location.reload()
      }
    } catch (error) {
      console.error(error)
      setLoader(false)
    }
  }

  return (
    <div
      className="modal modal--auto fade"
      id="modal-apool"
      aria-labelledby="modal-apool"
      aria-hidden
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal__content">
            <button
              className="modal__close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <i className="ti ti-x">
                <IoMdClose />
              </i>
            </button>
            <h4 className="modal__title">Invest</h4>
            <p className="modal__text">
              Update staking pool #00-{modifyPoolId} APY %
            </p>
            <div className="modal__form">
              <label htmlFor="amount2" className="form__label">
                Enter Amount
              </label>
              <input
                type="text"
                id="amount2"
                name="amount2"
                className="apool__input"
                style={{ backgroundColor: 'transparent' }}
                placeholder="amount in %"
                onChange={(e) => setAmount(e.target.value)}
              />

              <button
                onClick={() => CALLING_FUNCTION_MODIFY_POOL()}
                className="form__btn"
                type="button"
                // data-bs-dismiss="modal"
              >
                Update APY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateAPYModal
